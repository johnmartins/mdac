<template>
	<div class="component-container">
		<div style="height: 100%; position: relative;" class="svg-container" ref="pcpPlot">
			<PCPlotPathLayer />
			<svg 
			class="pcp-plot svg-content-responsive"  
			ref="plotCanvas"
			tabindex="0"
			height="100%" 
			width="100%" 
			style="font-size: 1em; font-family: monospace; position: absolute; left: 0; top: 0; "
			@mousemove.prevent="dragFilterBox"
			@mouseup.prevent="dragFilterDone"
			@keydown.delete="dataStore.deleteCategory(selectedCategory)"
			>
				

				<!-- Full graphics group -->
				<g v-if="data.length > 0"
				:transform="`translate(${plotParameters.padding} 0)`"> 

					<image :href="pathsDataUrl" width="100%" height="100%" :y="getPlotYBounds()[0]" />

					<!-- Axis group. Filter for enabled, sort by position, position using index. -->
					<g 
					class="axis" 
					v-for="(c, cIndex) in dataStore.enabledCategoriesSorted" 
					@click="onClickAxis(c)"
					@mousedown.prevent="dragFilterStart($event, c)"
					v-bind:class="{highlighted: getSelectedCategoryTitle() == c.title}"
					:key="c.position" 
					:transform="`translate(${truncateDecimals(cIndex*horizontalOffset,2)} ${truncateDecimals(getPlotYBounds()[0], 2)})`">	

						<!-- Hitbox -->
						<rect 
						class="filter-hitbox"
						:height="truncateDecimals(getAxisLength()+40, 1)"
						/>

						<!-- Axis Filters -->
						<g v-for="(f, index) in filters[c.title]" :key="index">
							<g v-if="f.type == 'single-range'">
								<rect 
								class="filter-box"
								:y="truncateDecimals(c.scaleLinear(f.thresholdB)*getAxisLength(), 1)" 
								:height="truncateDecimals((c.scaleLinear(f.thresholdA)-c.scaleLinear(f.thresholdB))*getAxisLength(), 1)" />
							</g>
							<g v-if="f.type == 'categoric'">
								<rect
								class="filter-box"
								:y="truncateDecimals(f.lowerBoundRatio*getAxisLength(), 1)"
								:height="truncateDecimals((f.upperBoundRatio - f.lowerBoundRatio)*getAxisLength(), 1)"
								/>
							</g>
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
							:transform="`rotate(${plotParameters.axisTitleRotation} 0 ${truncateDecimals(getPlotYBounds()[1]-(plotParameters.axisTitlePadding-10),1)})`">
							{{c.displayTitle}}
						</text>
						
						<!-- Axis vertical line -->
						<line x1="0" y1="0" x2="0" :y2="truncateDecimals(getPlotYBounds()[1]-(plotParameters.axisTitlePadding),2)"/>
						
						<!-- Axis tick group -->
						<g class="tick" v-for="(tick, index) in c.getTickArray()" :key="index"> 
							<text x="-10" :y="c.scaleLinear(tick)*getAxisLength()" class="tick-string" :style="{fontSize: `${optionsStore.tickSize}em`}">{{c.getTickString(tick)}}</text>
							<line x1="0" :y1="c.scaleLinear(tick)*getAxisLength()" x2="-5" :y2="c.scaleLinear(tick)*getAxisLength()"/>	
							<!-- Top tick -->
						</g>
					</g>
				</g>
			</svg>
		</div>
	</div>
</template>

<script setup>
import { reactive, ref, onMounted, onUpdated, inject, computed, watch} from "vue"
import { storeToRefs } from "pinia"
import * as d3 from "d3"

import { saveAs } from "file-saver"
import { saveSvgAsPng } from "save-svg-as-png"

// Components
import PCPlotPathLayer from "./PCPlotPathLayer"

// Models
import SingleRangeFilter from "@/models/filters/SingleRangeFilter"
import CategoricFilter from "@/models/filters/CategoricFilter"

// Misc
import {truncateDecimals} from "@/utils/data-utils"
import {getTrueEventCoordinates} from "@/utils/svg-utils"

// Stores
import {useDataStore} from "../../../store/DataStore"
import {useOptionsStore} from "../../../store/OptionsStore"
import {useStateStore} from "../../../store/StateStore"
import {usePCPStore} from "../../../store/PCPStore"

// Store references
const dataStore = useDataStore()
const optionsStore = useOptionsStore()
const stateStore = useStateStore()
const PCPStore = usePCPStore()

const {data, filterIDMap, filters, categories} = storeToRefs(dataStore)
const {activeView, selectedCategory} = storeToRefs(stateStore)
const {horizontalOffset, axisLength, colorScaleCategory, colorScaleFunction, plotXBounds, plotYBounds, pathsDataUrl} = storeToRefs(PCPStore)

// Plotted data
const dataIncluded = ref([])
const dataExcluded = ref([])

// Layout references
const plotCanvas = ref(null)
const pcpPlot = ref(null)

const plotParameters = reactive({
	padding: 100,
	axisTitlePadding: 150,
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
})

function updateContainerSize () {
	if (activeView.value !== 'pcp') return

	plotXBounds.value = getPlotXBounds()
	plotYBounds.value = getPlotYBounds()
}

// Event buss listeners and triggers
const eventBus = inject('eventBus')

eventBus.on('ExportForm.exportRequest', handleExportRequest)

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
watch((selectedCategory), () => {
	setColorScale(selectedCategory.value)
})

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

function setColorScale (category) {
	if (!category) {
		colorScaleCategory.value = null
		colorScaleFunction.value = () => 'black'
		return
	}

	colorScaleCategory.value = category.title
	if (!category.usesCategoricalData) {
		colorScaleFunction.value = d3.scaleSequential().domain([category.lb, category.ub]).interpolator(d3.interpolateRgbBasis(["blue", "green", "yellow", "red"]))
	} else {
		colorScaleFunction.value = d3.scaleOrdinal().domain(category.availableCategoricalValues).range(d3.schemeCategory10)
	}
	
}

function resetFilterDrag () {
	plotVariables.mousedown = false
	plotVariables.currentFilterCategory = null
	plotVariables.currentFilterStartValue = 0
	plotVariables.currentFilterDeltaTime = 0
	plotVariables.currentFilterEndValue = 0
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
	else {
		throw new Error('Unknown format in export request')
	}
}

function exportPNG () {
	const csvElement = plotCanvas.value
	saveSvgAsPng(csvElement, 'PCPlot.png', {encoderOptions: 1, backgroundColor: 'white', scale: 2})
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