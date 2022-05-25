<template>
	<div class="component-container">
		<div style="height: 100%;" class="svg-container">
			<svg 
			class="pcp-plot svg-content-responsive" 
			height="100%" 
			width="100%" 
			ref="plotCanvas"
			tabindex="0"
			style="font-size: 1em;"
			@mousemove.prevent="dragFilterBox"
			@mouseup.prevent="dragFilterDone"
			@keydown.delete="dataStore.deleteCategory(dataStore.getCategoryWithName(selectedCategoryName))"
			>
				
				<!-- Full graphics group -->
				<g v-if="data.length > 0"
				:transform="`translate(${plotParameters.padding} 0)`"> 
				
					<!-- Data line generator -->
					<g stroke-width="1" fill="transparent" :transform="`translate(0 ${getPlotYBounds()[0]})`">
						
						<!-- Excluded data (through user applied filters) -->
						<g v-if="!plotParameters.hideFiltered" stroke="#bfbfbf">
							<path 
							v-for="(d, index) in data.filter(de => !dataStore.dataPointFilterCheck(de))" :key="index"
							:stroke-opacity="getLineOpacity(d)"
							:d="lineGenerator(d)"
							/>
						</g>
						
						<!-- Included data -->
						<path 
						v-for="(d, index) in data.filter(de => dataStore.dataPointFilterCheck(de))" :key="index"
						:stroke="getLineColor(d)"
						:stroke-opacity="getLineOpacity(d)"
						:d="lineGenerator(d)" />
					</g>

					<!-- Axis group -->
					<g 
					class="axis" 
					v-for="c in categories" 
					@click="selectCategory(c)"
					@mousedown.prevent="dragFilterStart($event, c)"
					v-bind:class="{highlighted: selectedCategoryName == c.title}"
					:key="c.position" 
					:transform="`translate(${c.position*horizontalOffset} ${getPlotYBounds()[0]})`">	

						<!-- Hitbox -->
						<rect 
						class="filter-hitbox"
						:height="getAxisLength()+40"
						/>

						<!-- Axis Filters -->
						<g v-for="(f, index) in filters[c.title]" :key="index">
							<rect 
							class="filter-box"
							:y="c.scaleLinear(f.thresholdB)*getAxisLength()" 
							:height="(c.scaleLinear(f.thresholdA)-c.scaleLinear(f.thresholdB))*getAxisLength()" />
						</g>
						
						<!-- Proto axis filters -->
						<g v-if="plotVariables.currentFilterCategory && plotVariables.currentFilterDeltaTime > plotParameters.filterMinDragTime">
							<g v-if="plotVariables.currentFilterCategory.title === c.title">
								<rect 
								class="filter-box-proto"
								:y="Math.min(plotVariables.currentFilterStartValue, plotVariables.currentFilterEndValue) - plotParameters.padding"
								:height="Math.abs(plotVariables.currentFilterEndValue - plotVariables.currentFilterStartValue)"
								/>
							</g>
						</g>
						
						<!-- Axis label -->
						<text 
							:y="getPlotYBounds()[1]-(plotParameters.axisTitlePadding-10)" 
							class="title" 
							:transform="`rotate(${plotParameters.axisTitleRotation} 0 ${getPlotYBounds()[1]-(plotParameters.axisTitlePadding-10)})`">
							{{c.displayTitle}}
						</text>
						
						<!-- Axis vertical line -->
						<line x1="0" y1="0" x2="0" :y2="getPlotYBounds()[1]-(plotParameters.axisTitlePadding)"/>
						
						<!-- Axis tick group -->
						<g class="tick" v-for="(tick, index) in c.getTickArray()" :key="index"> <!-- Tick group -->
							<text x="-10" :y="c.scaleLinear(tick)*getAxisLength()" class="tick-string">{{c.getTickString(tick)}}</text>
							<line x1="0" :y1="c.scaleLinear(tick)*getAxisLength()" x2="-5" :y2="c.scaleLinear(tick)*getAxisLength()"/>	<!-- Top tick -->
						</g>
					</g>
				</g>
			</svg>
		</div>
	</div>
</template>

<script setup>
import { reactive, ref, onMounted, onUpdated, inject, computed } from "vue"
import * as d3 from "d3"
import { saveAs } from "file-saver"
import { saveSvgAsPng } from "save-svg-as-png"
import { storeToRefs } from "pinia"

import {useDataStore} from "../../../store/DataStore"
import {useLayoutStore} from "../../../store/LayoutStore"
import Category from "@/models/plots/Category"
import DataFilter from "@/models/plots/DataFilter"
import dataUtils from "@/utils/data-utils"

const dataStore = useDataStore()
const {data, filters, categories} = storeToRefs(dataStore)
const layoutStore = useLayoutStore()
const {activeView} = storeToRefs(layoutStore)

// Layout references
const plotCanvas = ref(null)

const plotParameters = reactive({
	padding: 50,
	axisTitlePadding: 150,
	axisTitleRotation: 45,
	defaultDataOpacity: 0.8,
	filteredDataOpacity: 0.05,
	filterMinDragTime: 125, // ms
	hideFiltered: false,
	curveType: 'curve'
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
	xBounds: [0, 500],    // 2D vector with x limits
    yBounds: [0, 500]     // 2D vector with y limits
})

const horizontalOffset = computed( () => {
	if (categories.value.length < 2) return 50;
	return plotVariables.xBounds[1]/Math.max(1,(categories.value.length-1))
})

function updateContainerSize () {
	if (activeView.value !== 'pcp') return
	plotVariables.xBounds = getPlotXBounds()
	plotVariables.yBounds = getPlotYBounds()
}

// Data structures
const settings = reactive({
	colorScaleCategory: null,
	colorScale: () => {return "black"}
})
const selectedCategoryName = ref(null)

// Event buss listeners and triggers
const eventBus = inject('eventBus')
eventBus.on('OptionsForm.setFilteredDataOpacity', (v) => {
	plotParameters.filteredDataOpacity = v
	plotParameters.hideFiltered = false
	if (v < 0.01) {
		plotParameters.hideFiltered = true
	} 
})
eventBus.on('OptionsForm.setDataOpacity', (v) => {
	plotParameters.defaultDataOpacity = v
})
eventBus.on('OptionsForm.setTickSize', (v) => {
	for (let e of document.querySelectorAll('text.tick-string')) {
		e.style.fontSize = `${v}em`
	}
})
eventBus.on('OptionsForm.setTitleSize', (v) => {
	for (let e of document.querySelectorAll('text.title')) {
		e.style.fontSize = `${v}em`
	}
})
eventBus.on('OptionsForm.setCurveType', (v) => {plotParameters.curveType = v})
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

function lineGenerator(d) {
	let dataCats = Object.keys(d)
	let dataArray = Array(dataCats.length).fill(null)

	for (let i = 0; i < dataCats.length; i++) {
		let c = dataStore.getCategoryWithName(dataCats[i])

		if (!c)  {
			continue
		}
		const x = dataUtils.mercilessDecimalDeleter(c.position*horizontalOffset.value, 1)
		const y = dataUtils.mercilessDecimalDeleter(c.scaleLinear(d[c.title])*getAxisLength(), 1)

		dataArray[c.position] = {
			x: x, 
			y: y
		}
	}

	const lengthPreFilter = dataArray.length
	dataArray = dataArray.filter((obj) => { return obj != null })
	const lengthPostFilter = dataArray.length

	let d3CurveType = d3.curveMonotoneX
	if (plotParameters.curveType === 'curve') {
		d3CurveType = d3.curveMonotoneX
	} else if (plotParameters.curveType === 'line') {
		d3CurveType = d3.curveLinear
	}
	
	return d3.line([])
		.x((de) => {return de.x})
		.y((de) => {return de.y})
		.curve(d3CurveType)
		(dataArray)
}

function getAxisLength () {
	return getPlotYBounds()[1]-(plotParameters.axisTitlePadding)
}

function getPlotYBounds () {
	const array = [plotParameters.padding, plotCanvas.value.getBoundingClientRect().height - plotParameters.padding]
	return array
}

function getPlotXBounds () {
	const array = [plotParameters.padding, plotCanvas.value.getBoundingClientRect().width - plotParameters.padding - plotParameters.axisTitlePadding]
	return array
}

function getLineColor (dataPoint) {
	if (!settings.colorScaleCategory) return "black"
	if (!dataPoint[settings.colorScaleCategory]) return "black"
	return settings.colorScale(dataPoint[settings.colorScaleCategory])
}

function getLineOpacity (dataPoint) {
	if (dataStore.dataPointFilterCheck(dataPoint)) {
		return plotParameters.defaultDataOpacity
	} 

	return plotParameters.filteredDataOpacity
}

function setColorScale (category) {
	if (!category) {
		settings.colorScaleCategory = null
		settings.colorScale = () => {return "black"}
		return
	}

	settings.colorScaleCategory = category.title
	settings.colorScale = d3.scaleSequential().domain([category.lb, category.ub]).interpolator(d3.interpolateRgbBasis(["red", "green", "blue"]))
}

function resetFilterDrag () {
	plotVariables.mousedown = false
	plotVariables.currentFilterCategory = null
	plotVariables.currentFilterStartValue = 0
	plotVariables.currentFilterDeltaTime = 0
	plotVariables.currentFilterEndValue = 0
}

function dragFilterBox (evt) {
	if (!plotVariables.mousedown) return
	plotVariables.currentFilterEndValue = evt.layerY
	plotVariables.currentFilterDeltaTime = Date.now() - plotVariables.currentFilterStartTime
}

function dragFilterStart (evt, c) {
	plotVariables.mousedown = true
	plotVariables.currentFilterCategory = c 
	plotVariables.currentFilterStartValue = evt.layerY
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
	if (plotVariables.currentFilterDeltaTime < 250) ignoreRequest = true	

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
	let outOfBounds = false
	if ((y1Ratio > 1 || y1Ratio < 0) && (y2Ratio > 1 || y2Ratio < 0) ) {
		outOfBounds = true
		console.warn('Filter out of bounds. Ignoring.')
	}

	// Limit ratio to be within bounds
	if (y1Ratio > 1) y1Ratio = 1.01
	if (y1Ratio < 0) y1Ratio = -0.01
	if (y2Ratio > 1) y2Ratio = 1.01
	if (y2Ratio < 0) y2Ratio = -0.01
	
	// Check that the range is large enough to be tangible
	const minRange = 0.0001
	let insufficientRange = false
	if (Math.abs(y1Ratio - y2Ratio) < minRange) {
		insufficientRange = true
	}

	const thresholdA = c.getScale().invert(y1Ratio)
	const thresholdB = c.getScale().invert(y2Ratio)

	// Create and add filter
	if (!outOfBounds && !insufficientRange) {
		const filter = new DataFilter(c.title, thresholdA, thresholdB)
		dataStore.addFilter(filter)
	}

	resetFilterDrag()
}

function selectCategory (c) {
	if (plotVariables.clickOnCooldown) return;
	if (plotVariables.mousedown === true) return;
	
	if (selectedCategoryName.value === c.title) {
		c = null
	}
	
	plotCanvas.value.focus()
	selectedCategoryName.value = c ? c.title : null
	setColorScale(c)
	eventBus.emit('PCPlot.selectCategory', c)
}

function handleExportRequest (format) {
	if (format === 'svg') {
		exportCSV()
	} else if (format === 'png') {
		exportPNG()
	} 
	else {
		console.error('Unknown format in export request')
	}
}

function exportCSV () {
	const csvElement = plotCanvas.value
	var svgData = csvElement.innerHTML //put id of your svg element here
	var head = '<svg title="graph" version="1.1" xmlns="http://www.w3.org/2000/svg">'
	
	let style = `<style>`
	style += '.title {font-size: 0.8rem; text-anchor: start; x: 0px;}'
	style += '.tick-string {font-size: 0.8rem; text-anchor: end; dominant-baseline: middle;}'
	style += 'line {stroke: black; fill: transparent;}'
	style += '.filter-box {stroke: white;stroke-opacity: 0.9;fill: purple;fill-opacity: 0.4;x: -8px;width: 16px;}'
	style += '</style>'
	var full_svg = head +  style + svgData + "</svg>"
	var blob = new Blob([full_svg], {type: "image/svg+xml"});  
	saveAs(blob, "PCPlot.svg");
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
			stroke: transparent;
		}

		line {
			stroke: black;
			fill: transparent;
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
			fill: transparent;
			x: -10px;
			y: -20px;
			width: 20px;
		}

		.title {
			x: 0px;
			font-size: 0.8em;	
			text-anchor: start;
		}

		.tick-string {
			font-size: 0.6em;
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