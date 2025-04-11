<template>
    <div 
        class="component-container"
        :class="{
            pulling: interactionType === 'edge',
            grabbing: interactionType === 'block'
        }" 
    >
        <div ref="pcpPlot" style="height: 100%; position: relative;" class="svg-container">
            <!-- Raster rendering layer -->
            <div v-if="PCPStore.renderingType === 'raster' && optionsStore.showPcpLines" style="width: 100%; height: 100%;">
                <PCPlotPathLayerRaster ref="rasterLayer" />
            </div>
            <svg 
                ref="plotCanvas"  
                class="pcp-plot svg-content-responsive"
                tabindex="0"
                height="100%" 
                width="100%" 
                style="font-size: 1em; font-family: monospace; position: absolute; left: 0; top: 0; user-select: none;"
                @mousemove.prevent="onMouseMove"
                @mouseup.prevent="dragFilterDone"
                @keydown.delete="dataStore.deleteCategory(selectedCategory)"
            >
            <filter x="0" y="0" width="1" height="1" id="solid">
                <feFlood flood-color="white" :flood-opacity="optionsStore.tickBackgroundOpacity" result="bg" />
                <feMerge>
                    <feMergeNode in="bg"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>


            <!-- Full graphics group -->
            <g
                v-if="data.length > 0"
                :transform="`translate(${plotLeftPadding} 0)`"
            > 

                <!-- Vector rendering layer -->
                <PCPlotPathLayerVector v-if="optionsStore.showPcpLines === true" />

                <!-- Raster EXPORT image (only visible when exporting) -->
                <image v-if="PCPStore.renderingType === 'raster' && pathsDataUrl" :href="pathsDataUrl" width="100%" height="100%" :y="getPlotYBounds()[0]" />

                <!-- Axis group. Filter for enabled, sort by position, position using index. -->
                <g 
                    v-for="(c, cIndex) in dataStore.enabledCategoriesSorted" 
                    :key="c.position" 
                    class="axis"
                    :transform="`translate(${truncateDecimals(cIndex*horizontalOffset,2)} ${truncateDecimals(getPlotYBounds()[0], 2)})`"
                >	
                    <PCPlotAxis 
                        :axisLength="getAxisLength()"
                        :c="c"
                        :canvas="plotCanvas"
                        :plotYBounds="getPlotYBounds()"
                    />
                </g>

                <g class="scatter-plugin-container" 
                    :transform="`translate(${getPlotXBounds()[1] + optionsStore.colorLegendOffsetH} ${getPlotYBounds()[0] + optionsStore.colorLegendOffsetV})`"
                >
                    <RangeIndicator />
                </g>
            </g>
            </svg>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, inject, watch, nextTick} from "vue";
import { storeToRefs } from "pinia";

import { saveAs } from "file-saver";
import { saveSvgAsPng } from "save-svg-as-png";

// Components
import PCPlotPathLayerVector from "./PCPlotPathLayerVector";
import PCPlotPathLayerRaster from "./PCPlotPathLayerRaster";
import RangeIndicator from "@/components/plot-features/RangeIndicator";
import PCPlotAxis from "./PCPlotAxis.vue";

// Models
import SingleRangeFilter from "@/models/filters/SingleRangeFilter";
import CategoricFilter from "@/models/filters/CategoricFilter";
import Popup from '@/models/layout/Popup';

// Misc
import { truncateDecimals } from "@/utils/data-utils";
import { getTrueEventCoordinates } from "@/utils/svg-utils";

// Stores
import { useDataStore } from "@/store/DataStore";
import { useOptionsStore } from "@/store/OptionsStore";
import { useStateStore } from "@/store/StateStore";
import { usePCPStore } from "@/store/PCPStore";
import { useLayoutStore } from "@/store/LayoutStore";

// Store references
const dataStore = useDataStore();
const optionsStore = useOptionsStore();
const stateStore = useStateStore();
const PCPStore = usePCPStore();
const layoutStore = useLayoutStore();

const {data, filterIDMap, categories} = storeToRefs(dataStore);
const {activeView, selectedCategory} = storeToRefs(stateStore);
const {horizontalOffset, axisLength, plotXBounds, plotYBounds, pathsDataUrl, 
    plotTopPadding, plotRightPadding, plotBottomPadding, plotLeftPadding, 
    currentFilterStartTime, currentFilterCategory, currentFilterDeltaTime, 
    currentFilterStartValue, currentFilterEndValue, filterMinDragTime, 
    mousedown, clickOnCooldown,interactionType, filterToRemove, 
    blockOriginCoordinates} = storeToRefs(PCPStore);

// Plotted data
const dataIncluded = ref([]);
const dataExcluded = ref([]);

// Layout references
const plotCanvas = ref(null);
const pcpPlot = ref(null);
const rasterLayer = ref(null);

const plotVariables = reactive({
    hasRendered: false,
});

function updateContainerSize () {
    if (activeView.value !== 'pcp') return;

    plotXBounds.value = getPlotXBounds();
    plotYBounds.value = getPlotYBounds();
}

// Event buss listeners and triggers
const eventBus = inject('eventBus');

eventBus.on('ExportForm.exportFigureRequest', handleExportRequest);

// Update container size if certain events occur
eventBus.on('SourceForm.readData', updateContainerSize);
eventBus.on('Layout.contentResize', updateContainerSize);
eventBus.on('Router.TabChange', (viewName) => {
    if (viewName === 'pcp') {
        plotVariables.hasRendered = true;
        updateContainerSize();
    }
})

eventBus.on('RedrawCategoricalFilters', recreateCategoricFilters);

// Listeners
watch(() => filterIDMap.value.size, () => {
    data.value.forEach(de => {
        const included = dataStore.dataPointFilterCheck(de);
        if (included) {
            dataIncluded.value.push(de);
        } else {
            dataExcluded.value.push(de);
        }
    });
});

watch([categories, plotXBounds, () => dataStore.enabledCategoriesCount], () => {
    if (dataStore.enabledCategoriesCount < 2) return 50;
    horizontalOffset.value = plotXBounds.value[1]/Math.max(1,(dataStore.enabledCategoriesCount-1))
})

watch([plotYBounds, () => plotBottomPadding], () => {
    axisLength.value = getPlotYBounds()[1]-(plotBottomPadding.value)
})

function getAxisLength () {
    return plotYBounds.value[1]-(plotBottomPadding.value)
}

function getPlotYBounds () {
    if (!plotCanvas.value) return [0, 0]

    const upperBoundary = plotTopPadding.value;
    // bottom padding is divided by 4 to compensate for stacking effects
    const lowerBoundary = plotCanvas.value.getBoundingClientRect().height - plotBottomPadding.value / 4 - plotTopPadding.value;
    const array = [upperBoundary, lowerBoundary];
    return array;
}

function getPlotXBounds () {
    const array = [plotLeftPadding.value, plotCanvas.value.getBoundingClientRect().width - (plotLeftPadding.value + plotRightPadding.value)]
    return array
}

function resetFilterDrag () {
    mousedown.value = false;
    interactionType.value = null;
    currentFilterCategory.value = null;
    currentFilterStartValue.value = 0;
    currentFilterDeltaTime.value = 0;
    currentFilterEndValue.value = 0;
    filterToRemove.value = null;
}

function onMouseMove (evt) {
    if (!mousedown.value) return;

    if (interactionType.value === 'block') {
        return grabFilterBlock(evt)
    }

    dragFilterBox(evt)
}

function grabFilterBlock (evt) {
    let taAdjusted, tbAdjusted;

    if (!currentFilterCategory.value.usesCategoricalData) {
        let ta = filterToRemove.value.thresholdA
        let tb = filterToRemove.value.thresholdB
        taAdjusted = currentFilterCategory.value.scaleLinear(ta)*axisLength.value + plotTopPadding.value;
        tbAdjusted = currentFilterCategory.value.scaleLinear(tb)*axisLength.value + plotTopPadding.value;
    } else {
        taAdjusted = filterToRemove.value.upperBoundRatio * axisLength.value + plotTopPadding.value;
        tbAdjusted = filterToRemove.value.lowerBoundRatio * axisLength.value + plotTopPadding.value;
    }
     
    const loc = getTrueEventCoordinates(evt, plotCanvas.value);
    currentFilterStartValue.value = loc.y + (taAdjusted - blockOriginCoordinates.value);
    currentFilterEndValue.value =  loc.y + (tbAdjusted - blockOriginCoordinates.value);
    currentFilterDeltaTime.value = Date.now() - currentFilterStartTime.value;
}

function dragFilterBox (evt) {
    const loc = getTrueEventCoordinates(evt, plotCanvas.value)
    if (!mousedown.value) return
    currentFilterEndValue.value = loc.y
    currentFilterDeltaTime.value = Date.now() - currentFilterStartTime.value
}

function triggerClickCooldown () {
    // This method prevents the end of filter mousedrags to be perceived as clicks
    clickOnCooldown.value = true;
    setTimeout(() => {
        clickOnCooldown.value = false
    }, 250);
}

function dragFilterDone () {
    let ignoreRequest = false
    if (!mousedown.value) ignoreRequest = true
    if (currentFilterDeltaTime.value < 100) ignoreRequest = true	

    if (ignoreRequest) {
        // This filter was likely unintentional.
        resetFilterDrag()
        return
    } else {
        // This filter was likely intentional. Prevent follow up click
        triggerClickCooldown()
    }

    if (Date.now() - currentFilterStartTime.value < filterMinDragTime) return

    // Calculate domain extent
    const c = currentFilterCategory.value
    const y1 = currentFilterStartValue.value - plotTopPadding.value
    const y2 = currentFilterEndValue.value - plotTopPadding.value
    let y1Ratio = (y1 / getAxisLength())
    let y2Ratio = (y2 / getAxisLength())

    // Check if completely out of bounds
    if ((y1Ratio > 1 || y1Ratio < 0) && (y2Ratio > 1 || y2Ratio < 0) ) {
        console.warn('Filter out of bounds. Ignoring.')
        resetFilterDrag()
        return
    }

    // Limit ratio to be within bounds
    if (y1Ratio > 1) y1Ratio = 1.01
    if (y1Ratio < 0) y1Ratio = -0.01
    if (y2Ratio > 1) y2Ratio = 1.01
    if (y2Ratio < 0) y2Ratio = -0.01
	
    // Check that the range is large enough to be tangible
    const minRange = 0.001
    if (Math.abs(y1Ratio - y2Ratio) < minRange) {
        resetFilterDrag()
        return
    }

    if (c.usesCategoricalData) {
        const f = CategoricFilter.createFromRatios(c, y1Ratio, y2Ratio)
        dataStore.addFilter(f)
    } else {
        const f = SingleRangeFilter.createFromRatios(c, y1Ratio, y2Ratio)
        dataStore.addFilter(f)
    }

    // If this new filter is replacing an existing filter, then delete the original copy.
    if (filterToRemove.value) {
        dataStore.deleteFilter(filterToRemove.value)
    }

    resetFilterDrag()
    eventBus.emit('PCPlot.dragFilterDone');
}

function recreateCategoricFilters (c) {

    if (!c.usesCategoricalData) {
        throw new Error(`${c.title} does not use categorical data.`)
    }

    // Remove and then recreate all filters for this category with the same range ratios.
    if (dataStore.filters[c.title]) {
        dataStore.filters[c.title].forEach(f => {
            f.flipRatio();
        });
    }
}

async function handleExportRequest (format) {
    if (activeView.value !== 'pcp') return;

    if (format === 'png') {

        if (PCPStore.renderingType !== 'raster') {
            const errorPopup = new Popup('error', 'Invalid export configuration', 
                'To export to PNG, first change render mode to "Rasterized" under the Plot Options section in the menu.' +
            '\n\nAlternatively, you can export to SVG.')
            layoutStore.queuePopup(errorPopup)
            return
        }

        try {
            if (rasterLayer.value) {
                await rasterLayer.value.generateDataUrl();
            }
            await nextTick();
            await exportPNG();
        } finally {
            PCPStore.pathsDataUrl = null;
        }
    } 
    else if (format === 'svg') {
        exportSVG();
    }
    else {
        throw new Error('Unknown format in export request');
    }
}

async function exportPNG () {
    const csvElement = plotCanvas.value
    await saveSvgAsPng(csvElement, 'PCPlot.png', {encoderOptions: 1, backgroundColor: 'white', scale: 2})
}

function exportSVG () {
    // Raster check
    if (PCPStore.renderingType === 'raster') {
        const errorPopup = new Popup('error', 'Invalid export configuration', 
            'It is not possible to export a rasterized plot as an SVG file.' +
		'\n\nEither change Export Format to PNG, or change Render mode to Vectorized.')
        layoutStore.queuePopup(errorPopup)
        return
    }

    const csvElement = plotCanvas.value

    // Prevents exported SVG from being cropped when imported into e.g. Inkscape or PowerPoint
    let viewboxWidth = csvElement.getBoundingClientRect().width;
    let viewboxHeight = csvElement.getBoundingClientRect().height;

    const svgData = csvElement.innerHTML 
    const head = `<svg viewBox="0 0 ${viewboxWidth} ${viewboxHeight}" title="graph" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">`
	
    let style = `<style>`
    style += 'svg {font-family: monospace;}'
    style += '.title {font-size: 0.8rem; text-anchor: start; x: 0px;}'
    style += '.tick-string {font-size: 0.8rem; text-anchor: end; dominant-baseline: middle; filter: url(#solid);}'
    style += 'line {stroke: black; fill-opacity: 0;}'
    style += 'path {fill-opacity: 0;}'
    style += '.filter-box {stroke: white;stroke-opacity: 0.9;stroke-width: 2px;fill: #595959; fill-opacity: 0.6;x: -8px;width: 16px;}' 
    style += '</style>'
    const full_svg = head +  style + svgData + "</svg>"
    const blob = new Blob([full_svg], {type: "image/svg+xml"});  
    saveAs(blob, "PCPlot.svg");
}
    
</script>

<style lang="scss" scoped>

.component-container {
	height: 100%;
	overflow: hidden;

    &.grabbing {
        cursor: grabbing !important;
    }

    &.pulling {
        cursor: ns-resize !important;
    }
}

</style>