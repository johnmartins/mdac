<template>
    <div class="component-container">
        <div ref="pcpPlot" style="height: 100%; position: relative;" class="svg-container">
            <!-- Raster rendering layer -->
            <div v-if="PCPStore.renderingType === 'raster'" style="width: 100%; height: 100%;">
                <PCPlotPathLayerRaster />
            </div>
            <svg 
                ref="plotCanvas"  
                class="pcp-plot svg-content-responsive"
                tabindex="0"
                height="100%" 
                width="100%" 
                style="font-size: 1em; font-family: monospace; position: absolute; left: 0; top: 0; "
                @mousemove.prevent="onMouseMove"
                @mouseup.prevent="dragFilterDone"
                @keydown.delete="dataStore.deleteCategory(selectedCategory)"
            >
				
                <!-- Full graphics group -->
                <g
                    v-if="data.length > 0"
                    :transform="`translate(${plotParameters.padding} 0)`"
                > 

                    <!-- Vector rendering layer -->
                    <PCPlotPathLayerVector />

                    <image v-if="PCPStore.renderingType === 'raster' && pathsDataUrl" :href="pathsDataUrl" width="100%" height="100%" :y="getPlotYBounds()[0]" />

                    <!-- Axis group. Filter for enabled, sort by position, position using index. -->
                    <g 
                        v-for="(c, cIndex) in dataStore.enabledCategoriesSorted" 
                        :key="c.position" 
                        class="axis"
                        :class="{highlighted: getSelectedCategoryTitle() == c.title}" 
                        :transform="`translate(${truncateDecimals(cIndex*horizontalOffset,2)} ${truncateDecimals(getPlotYBounds()[0], 2)})`"
                    >	

                        <!-- Axis vertical line -->
                        <line x1="0" y1="0" x2="0" :y2="truncateDecimals(getPlotYBounds()[1]-(plotParameters.axisTitlePadding),2)" />

                        <!-- Hitbox -->
                        <rect 
                            class="filter-hitbox"
                            :height="truncateDecimals(getAxisLength()+40, 1)"
                            @click="onClickAxis(c)"
                            @mousedown.prevent="dragFilterStart($event, c)"
                        />

                        <!-- Axis Filters -->
                        <g v-for="(f, index) in filters[c.title]" :key="index">
                            <PCPlotFilter :filter="f" :category="c" @interaction="onFilterInteraction" />
                        </g>
						
                        <!-- Proto axis filters -->
                        <g v-if="plotVariables.currentFilterCategory && plotVariables.currentFilterDeltaTime > plotParameters.filterMinDragTime">
                            <g v-if="plotVariables.currentFilterCategory.title === c.title">
                                <rect 
                                    class="filter-box-proto"
                                    :y="truncateDecimals(Math.min(plotVariables.currentFilterStartValue, plotVariables.currentFilterEndValue) - plotParameters.padding, 1)"
                                    :height="truncateDecimals(Math.abs(plotVariables.currentFilterEndValue - plotVariables.currentFilterStartValue), 1)"
                                />
                            </g>
                        </g>
						
                        <!-- Axis label -->
                        <text 
                            :y="truncateDecimals(getPlotYBounds()[1]-(plotParameters.axisTitlePadding-10),1)" 
                            class="title" 
                            :style="{fontSize: `${optionsStore.titleSize}em`}"
                            :transform="`rotate(${plotParameters.axisTitleRotation} 0 ${truncateDecimals(getPlotYBounds()[1]-(plotParameters.axisTitlePadding-10),1)})`"
                            @click="onClickAxis(c)"
                        >
                            {{ c.displayTitle }}
                        </text>
						
                        <!-- Axis tick group -->
                        <g v-for="(tick, index) in c.getTickArray()" :key="index" class="tick"> 
                            <text x="-10" :y="c.scaleLinear(tick)*getAxisLength()" class="tick-string" :style="{fontSize: `${optionsStore.tickSize}em`}">{{ c.getTickString(tick) }}</text>
                            <line x1="0" :y1="c.scaleLinear(tick)*getAxisLength()" x2="-5" :y2="c.scaleLinear(tick)*getAxisLength()" />	
                            <!-- Top tick -->
                        </g>
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
import { reactive, ref, onMounted, onUpdated, inject, computed, watch} from "vue"
import { storeToRefs } from "pinia"

import { saveAs } from "file-saver"
import { saveSvgAsPng } from "save-svg-as-png"

// Components
import PCPlotPathLayerVector from "./PCPlotPathLayerVector"
import PCPlotPathLayerRaster from "./PCPlotPathLayerRaster"
import PCPlotFilter from "./PCPlotFilter.vue"
import RangeIndicator from "@/components/plot-features/RangeIndicator"

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
const {horizontalOffset, axisLength, plotXBounds, plotYBounds, pathsDataUrl} = storeToRefs(PCPStore)

// Plotted data
const dataIncluded = ref([])
const dataExcluded = ref([])

// Layout references
const plotCanvas = ref(null)
const pcpPlot = ref(null)

const plotParameters = reactive({
    padding: 100,
    axisTitlePadding: 200,
    axisTitleRotation: 45,
    filterMinDragTime: 125, // ms
})
const plotVariables = reactive({
    mousedown: false,
    currentFilterStartTime: 0,
    currentFilterDeltaTime: 0,
    currentFilterCategory: null,
    currentFilterStartValue: 0,
    currentFilterEndValue: 0,
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

watch([plotYBounds, () => plotParameters.axisTitlePadding], () => {
    axisLength.value = getPlotYBounds()[1]-(plotParameters.axisTitlePadding)
})

function onMouseMove (evt) {
    dragFilterBox(evt)
}

function onFilterInteraction (evt) {
    plotVariables.mousedown = true
    plotVariables.currentFilterCategory = evt.category 
    plotVariables.currentFilterStartValue = evt.start + plotParameters.padding
    plotVariables.currentFilterStartTime = Date.now()
    plotVariables.currentFilterDeltaTime = 0
    plotVariables.filterToRemove = evt.filter		// Mark the original filter for deletion
}

function getAxisLength () {
    return plotYBounds.value[1]-(plotParameters.axisTitlePadding)
}

function getPlotYBounds () {
    if (!plotCanvas.value) return [0, 0]

    const upperBoundary = plotParameters.padding
    const lowerBoundary = plotCanvas.value.getBoundingClientRect().height - plotParameters.padding
    const array = [upperBoundary, lowerBoundary]
    return array
}

function getPlotXBounds () {
    const array = [plotParameters.padding, plotCanvas.value.getBoundingClientRect().width - plotParameters.padding - plotParameters.axisTitlePadding]
    return array
}

function resetFilterDrag () {
    plotVariables.mousedown = false
    plotVariables.currentFilterCategory = null
    plotVariables.currentFilterStartValue = 0
    plotVariables.currentFilterDeltaTime = 0
    plotVariables.currentFilterEndValue = 0
    plotVariables.filterToRemove = null
}

function dragFilterBox (evt) {
    const loc = getTrueEventCoordinates(evt, plotCanvas.value)
    if (!plotVariables.mousedown) return
    plotVariables.currentFilterEndValue = loc.y
    plotVariables.currentFilterDeltaTime = Date.now() - plotVariables.currentFilterStartTime
}

function dragFilterStart (evt, c) {
    plotVariables.mousedown = true
    const loc = getTrueEventCoordinates(evt, plotCanvas.value)
    plotVariables.currentFilterCategory = c 
    plotVariables.currentFilterStartValue = loc.y
    plotVariables.currentFilterStartTime = Date.now()
    plotVariables.currentFilterDeltaTime = 0
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
    if (plotVariables.currentFilterDeltaTime < 100) ignoreRequest = true	

    if (ignoreRequest) {
        // This filter was likely unintentional.
        resetFilterDrag()
        return
    } else {
        // This filter was likely intentional. Prevent follow up click
        triggerClickCooldown()
    }

    if (Date.now() - plotVariables.currentFilterStartTime < plotParameters.filterMinDragTime) return

    // Calculate domain extent
    const c = plotVariables.currentFilterCategory
    const y1 = plotVariables.currentFilterStartValue - plotParameters.padding
    const y2 = plotVariables.currentFilterEndValue - plotParameters.padding
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

function onClickAxis (c) {
    if (plotVariables.clickOnCooldown) return;
    if (plotVariables.mousedown === true) return;
    if (selectedCategory.value && selectedCategory.value.title === c.title) {
        c = null
    }	
	
    // Remove focus from any form element to prevent erronious user input
    plotCanvas.value.focus()

    selectedCategory.value = c ? c : null
}

function getSelectedCategoryTitle () {
    return selectedCategory.value ? selectedCategory.value.title : null
}

function handleExportRequest (format) {
    if (activeView.value !== 'pcp') return

    if (format === 'png') {
        exportPNG()
    } 
    else if (format === 'svg') {
        exportSVG()
    }
    else {
        throw new Error('Unknown format in export request')
    }
}

function exportPNG () {
    const csvElement = plotCanvas.value
    saveSvgAsPng(csvElement, 'PCPlot.png', {encoderOptions: 1, backgroundColor: 'white', scale: 2})
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
    style += '.tick-string {font-size: 0.8rem; text-anchor: end; dominant-baseline: middle;}'
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
}

.pcp-plot {
	.axis {
		cursor: pointer;

		text {
			fill: black;
			stroke-opacity: 0;
		}

		line {
			stroke: black;
			fill-opacity: 0;
		}

		.filter-box {
			x: -8px;
			width: 16px; 
		}

		.filter-box-proto {
			x: -8px;
			width: 16px;
		}

		.filter-hitbox {
			stroke: transparent;
			fill-opacity: 0;
			x: -10px;
			y: -20px;
			width: 20px;
		}

		.title {
			x: 0px;
			text-anchor: start;
		}

		.tick-string {
			text-anchor: end;
			dominant-baseline: middle;
			font-weight: bold;
		}
	}

	.axis:hover {
		.title {
			fill: darkblue;
			font-weight: bold;
		}

		line {
			stroke-width: 2px;
			stroke: darkblue;
		}
		
	}

	.highlighted {
		.title {
			fill: darkblue;
			font-weight: bold;
		}

		line {
			stroke-width: 2px;
			stroke: darkblue;
		}
	}
}



</style>