<template>
    <div class="component-container">
        <div ref="pcpPlot" style="height: 100%; position: relative;" class="svg-container">
            <!-- Raster rendering layer -->
            <div v-if="PCPStore.renderingType === 'raster'" style="width: 100%; height: 100%;">
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
                <PCPlotPathLayerVector />

                <!-- Raster export image -->
                <image v-if="PCPStore.renderingType === 'raster' && pathsDataUrl" :href="pathsDataUrl" width="100%" height="100%" :y="getPlotYBounds()[0]" />
                

                <!-- Axis group. Filter for enabled, sort by position, position using index. -->
                <g 
                    v-for="(c, cIndex) in dataStore.enabledCategoriesSorted" 
                    :key="c.position" 
                    class="axis"
                    :class="{
                        highlighted: getSelectedCategoryTitle() == c.title,
                        pulling: plotVariables.interactionType === 'edge',
                        grabbing: plotVariables.interactionType === 'block'
                    }" 
                    :transform="`translate(${truncateDecimals(cIndex*horizontalOffset,2)} ${truncateDecimals(getPlotYBounds()[0], 2)})`"
                >	
                    <PCPlotAxis 
                        :axisLength="getAxisLength()"
                        :c="c"
                        :canvas="plotCanvas"
                        :plotYBounds="getPlotYBounds()"
                    />
                </g>

                <g class="scatter-plugin-container" :transform="`translate(${getPlotXBounds()[1] + 20} ${getPlotYBounds()[0]})`">
                    <RangeIndicator />
                </g>
            </g>
            </svg>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUpdated, inject, computed, watch, nextTick} from "vue";
import { storeToRefs } from "pinia";

import { saveAs } from "file-saver"
import { saveSvgAsPng } from "save-svg-as-png"

// Components
import PCPlotPathLayerVector from "./PCPlotPathLayerVector";
import PCPlotPathLayerRaster from "./PCPlotPathLayerRaster";
import RangeIndicator from "@/components/plot-features/RangeIndicator";
import PCPlotAxis from "./PCPlotAxis.vue";

// Models
import SingleRangeFilter from "@/models/filters/SingleRangeFilter"
import CategoricFilter from "@/models/filters/CategoricFilter"
import Popup from '@/models/layout/Popup'

// Misc
import {truncateDecimals} from "@/utils/data-utils"
import {getTrueEventCoordinates} from "@/utils/svg-utils"

// Stores
import {useDataStore} from "../../../store/DataStore"
import {useOptionsStore} from "../../../store/OptionsStore"
import {useStateStore} from "../../../store/StateStore"
import {usePCPStore} from "../../../store/PCPStore"
import {useLayoutStore} from "../../../store/LayoutStore"

// Store references
const dataStore = useDataStore()
const optionsStore = useOptionsStore()
const stateStore = useStateStore()
const PCPStore = usePCPStore()
const layoutStore = useLayoutStore()

const {data, filterIDMap, filters, categories} = storeToRefs(dataStore)
const {activeView, selectedCategory} = storeToRefs(stateStore)
const {horizontalOffset, axisLength, plotXBounds, plotYBounds, pathsDataUrl, 
    axisLabelMargin, axisLabelAngle, plotTopPadding, plotRightPadding, 
    plotBottomPadding, plotLeftPadding, currentFilterStartTime,
    currentFilterCategory, currentFilterDeltaTime, currentFilterStartValue,
    currentFilterEndValue, filterMinDragTime} = storeToRefs(PCPStore)

// Plotted data
const dataIncluded = ref([])
const dataExcluded = ref([])

// Layout references
const plotCanvas = ref(null)
const pcpPlot = ref(null)
const rasterLayer = ref(null)

const plotVariables = reactive({
    mousedown: false,
    interactionType: null,
    blockOriginCoordinates: 0,
    clickOnCooldown: false,
    hasRendered: false,
    filterToRemove: null,			// Used when editing an existing filter to delete the original copy
})

function updateContainerSize () {
    if (activeView.value !== 'pcp') return

    plotXBounds.value = getPlotXBounds()
    plotYBounds.value = getPlotYBounds()
}

// Event buss listeners and triggers
const eventBus = inject('eventBus')

eventBus.on('ExportForm.exportFigureRequest', handleExportRequest)

// Update container size if certain events occur
eventBus.on('SourceForm.readData', updateContainerSize)
eventBus.on('Layout.contentResize', updateContainerSize)
eventBus.on('Router.TabChange', (viewName) => {
    if (viewName === 'pcp') {
        plotVariables.hasRendered = true
        updateContainerSize()
    }
})

eventBus.on('RedrawCategoricalFilters', recreateCategoricFilters);

// Listeners
watch(() => filterIDMap.value.size, () => {
    // This is a bit wasteful. Use reduce instead to get both in one loop?
    dataIncluded.value = data.value.filter(de => dataStore.dataPointFilterCheck(de))
    dataExcluded.value = data.value.filter(de => !dataStore.dataPointFilterCheck(de))
})

watch([categories, plotXBounds, () => dataStore.enabledCategoriesCount], () => {
    if (dataStore.enabledCategoriesCount < 2) return 50;
    horizontalOffset.value = plotXBounds.value[1]/Math.max(1,(dataStore.enabledCategoriesCount-1))
})

watch([plotYBounds, () => plotBottomPadding], () => {
    axisLength.value = getPlotYBounds()[1]-(plotBottomPadding.value)
})

function onFilterInteraction (evt) {
    if (evt.type === 'edge') {
        handleFilterEdgeInteraction(evt);
    } else if (evt.type === 'block') {
        handleFilterBlockInteraction(evt);
    } else {
        throw new Error('Unknown filter interaction type');
    }
}

function handleFilterBlockInteraction (evt) {
    if (plotVariables.mousedown === false) {
        plotVariables.blockOriginCoordinates = getTrueEventCoordinates(evt.mouseEvent, plotCanvas.value).y
    }

    plotVariables.interactionType = 'block';
    plotVariables.mousedown = true;
    currentFilterCategory = evt.category;
    currentFilterStartValue = evt.start
    currentFilterEndValue = evt.start
    currentFilterStartTime = Date.now();
    currentFilterDeltaTime = 0;
    plotVariables.filterToRemove = evt.filter;		// Mark the original filter for deletion
}

function handleFilterEdgeInteraction (evt) {
    plotVariables.interactionType = 'edge';
    plotVariables.mousedown = true;
    currentFilterCategory = evt.category;
    currentFilterStartValue = evt.start + plotTopPadding.value;
    currentFilterStartTime = Date.now();
    currentFilterDeltaTime = 0;
    plotVariables.filterToRemove = evt.filter;		// Mark the original filter for deletion
}

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
    plotVariables.mousedown = false;
    plotVariables.interactionType = null;
    currentFilterCategory = null;
    currentFilterStartValue = 0;
    currentFilterDeltaTime = 0;
    currentFilterEndValue = 0;
    plotVariables.filterToRemove = null;
}

function onMouseMove (evt) {
    if (!plotVariables.mousedown) return;

    if (plotVariables.interactionType === 'block') {
        return grabFilterBlock(evt)
    }

    dragFilterBox(evt)
}

function grabFilterBlock (evt) {
    let taAdjusted, tbAdjusted;

    if (!currentFilterCategory.usesCategoricalData) {
        let ta = plotVariables.filterToRemove.thresholdA
        let tb = plotVariables.filterToRemove.thresholdB
        taAdjusted = currentFilterCategory.scaleLinear(ta)*axisLength.value + plotTopPadding.value;
        tbAdjusted = currentFilterCategory.scaleLinear(tb)*axisLength.value + plotTopPadding.value;
    } else {
        taAdjusted = plotVariables.filterToRemove.upperBoundRatio * axisLength.value + plotTopPadding.value;
        tbAdjusted = plotVariables.filterToRemove.lowerBoundRatio * axisLength.value + plotTopPadding.value;
    }
     
    const loc = getTrueEventCoordinates(evt, plotCanvas.value);
    currentFilterStartValue = loc.y + (taAdjusted - plotVariables.blockOriginCoordinates);
    currentFilterEndValue =  loc.y + (tbAdjusted - plotVariables.blockOriginCoordinates);
    currentFilterDeltaTime = Date.now() - currentFilterStartTime;
}

function dragFilterBox (evt) {
    const loc = getTrueEventCoordinates(evt, plotCanvas.value)
    if (!plotVariables.mousedown) return
    currentFilterEndValue = loc.y
    currentFilterDeltaTime = Date.now() - currentFilterStartTime
}

function dragFilterStart (evt, c) {
    plotVariables.mousedown = true
    const loc = getTrueEventCoordinates(evt, plotCanvas.value)
    currentFilterCategory = c 
    currentFilterStartValue = loc.y
    currentFilterStartTime = Date.now()
    currentFilterDeltaTime = 0
}

function triggerClickCooldown () {
    // This method prevents the end of filter mousedrags to be perceived as clicks
    plotVariables.clickOnCooldown = true
    setTimeout(() => {
        plotVariables.clickOnCooldown = false
    }, 250)
}

function dragFilterDone () {
    let ignoreRequest = false
    if (!plotVariables.mousedown) ignoreRequest = true
    if (currentFilterDeltaTime < 100) ignoreRequest = true	

    if (ignoreRequest) {
        // This filter was likely unintentional.
        resetFilterDrag()
        return
    } else {
        // This filter was likely intentional. Prevent follow up click
        triggerClickCooldown()
    }

    if (Date.now() - currentFilterStartTime < filterMinDragTime) return

    // Calculate domain extent
    const c = currentFilterCategory
    const y1 = currentFilterStartValue - plotTopPadding.value
    const y2 = currentFilterEndValue - plotTopPadding.value
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
    if (plotVariables.filterToRemove) {
        dataStore.deleteFilter(plotVariables.filterToRemove)
    }

    resetFilterDrag()
}

function onClickAxis (evt, c) {
    if (plotVariables.clickOnCooldown) return;
    if (plotVariables.mousedown === true) return;
    // Manage selected category
    if (selectedCategory.value && selectedCategory.value.title === c.title) {
        selectedCategory.value = null;
    } else {
        selectedCategory.value = c;
    }	
	
    // Remove focus from any form element to prevent erronious user input
    plotCanvas.value.focus()

    if (evt.ctrlKey) {
        return flipAxis(c);
    }

    if (evt.shiftKey) {
        return setColorCodeCategory(c);
    }
}

function onDblClickAxis (evt, c) {
    setColorCodeCategory(c)
}

function flipAxis (c) {
    c.flip();

    if (c.usesCategoricalData) {
        recreateCategoricFilters(c);
    }

    requestRasterRedraw();
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

function setColorCodeCategory (c) {
    if (!optionsStore.selectedColorCodeCategory) {
        optionsStore.selectedColorCodeCategory = c;
        optionsStore.resetColorCodeOverride();
        return;
    }

    if (optionsStore.selectedColorCodeCategory.id === c.id) {
        optionsStore.selectedColorCodeCategory = null;
        optionsStore.resetColorCodeOverride();
        return;
    }

    optionsStore.selectedColorCodeCategory = c;
    optionsStore.resetColorCodeOverride();
}

function getSelectedCategoryTitle () {
    return selectedCategory.value ? selectedCategory.value.title : null
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
            await rasterLayer.value.generateDataUrl();
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

function requestRasterRedraw () {
    eventBus.emit('PCPRasterLayer.RequestPCPRedraw');
}
    
</script>

<style lang="scss" scoped>

.component-container {
	height: 100%;
	overflow: hidden;
}

</style>