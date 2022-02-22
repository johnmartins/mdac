<template>
	<div class="component-container" ref="componentContainer">
		<div style="height: 100%;" class="svg-container">
			<svg 
			class="pcp-plot svg-content-responsive" 
			height="100%" 
			width="100%" 
			ref="plotCanvas"
			@mousemove="dragFilterBox"
			@mouseup="dragFilterDone"
			>
				
				<!-- Full graphics group -->
				<g
				:transform="`translate(${plotParameters.padding} 0)`"> 
				
					<!-- Data line generator -->
					<g v-for="(d, index) in data" :key="index">
						<path 
						fill="transparent" 
						stroke-width="1"
						v-if="dataPointFilterCheck(d) || !plotParameters.hideFiltered"
						:stroke="getLineColor(d)"
						:stroke-opacity="getLineOpacity(d)"
						:transform="`translate(0 ${getPlotYBounds()[0]})`"
						:d="lineGenerator(d)" />
					</g>

					<!-- Axis group -->
					<g 
						class="axis" 
						v-for="c in categories" 
						@click="selectCategory(c)"
						@mouseover="highlightedCategoryName = c.title"
						@mouseleave="highlightedCategoryName = null"
						@mousedown.prevent="dragFilterStart($event, c)"
						v-bind:class="{highlighted: highlightedCategoryName == c.title || selectedCategoryName == c.title}"
						:key="c.position" 
						:transform="`translate(${c.position*plotParameters.horizontalOffset} ${getPlotYBounds()[0]})`">	

						<!-- Axis Filters -->
						<g v-for="(f, index) in filters[c.title]" :key="index">
							<rect 
							class="filter-box"
							x="-8" 
							:y="c.scaleLinear(f.thresholdB)*getAxisLength()" 
							width="16" 
							:height="(c.scaleLinear(f.thresholdA)-c.scaleLinear(f.thresholdB))*getAxisLength()" />
						</g>
						<!-- Axis label -->
						<text 
							x="0" 
							:y="getPlotYBounds()[1]-(plotParameters.axisTitlePadding-10)" 
							class="title" 
							:transform="`rotate(${plotParameters.axisTitleRotation} 0 ${getPlotYBounds()[1]-(plotParameters.axisTitlePadding-10)})`">
							{{c.title}}
						</text>
						
						<!-- Axis vertical line -->
						<line x1="0" y1="0" x2="0" :y2="getPlotYBounds()[1]-(plotParameters.axisTitlePadding)"/>
						
						<!-- Axis tick group -->
						<g class="tick" v-for="(tick, index) in c.getTickArray()" :key="index"> <!-- Tick group -->
							<text x="-10" :y="c.scaleLinear(tick)*getAxisLength()" class="tick-string">{{getTickString(tick)}}</text>
							<line x1="0" :y1="c.scaleLinear(tick)*getAxisLength()" x2="-5" :y2="c.scaleLinear(tick)*getAxisLength()"/>	<!-- Top tick -->
						</g>
					</g>
				</g>
			</svg>
		</div>
	</div>
</template>

<script setup>
import { reactive, ref, onMounted, onUpdated, inject } from "vue"
import * as d3 from "d3"

import Category from "@/models/plots/Category"
import DataFilter from "@/models/plots/DataFilter"

// Layout references
const plotCanvas = ref(null)
const componentContainer = ref(null)

const plotParameters = reactive({
	padding: 50,
	horizontalOffset: 200,
	axisTitlePadding: 150,
	axisTitleRotation: 45,
	defaultDataOpacity: 0.8,
	filteredDataOpacity: 0.05,
	hideFiltered: false
})
const plotVariables = reactive({
	mousedown: false,
	currentFilterStartTime: 0,
	currentFilter: null,
	currentFilterCategory: null,
	currentFilterStartValue: 0,
	currentFilterEndValue: 0
})

// Data structures
const categoryNameMap = new Map()
const categories = reactive([])
const data = reactive([])
const filters = reactive({}) // "categoryName" -> [filterA, filterB, ..]
const settings = reactive({
	colorScaleCategory: null,
	colorScale: () => {return "black"}
})
const highlightedCategoryName = ref(null)
const selectedCategoryName = ref(null)

// Event buss listeners and triggers
const eventBus = inject('eventBus')
eventBus.on('PlotTools.readFile', readFile)
eventBus.on('PlotTools.deleteCategory', deleteCategory)
eventBus.on('PlotTools.setFilteredDataOpacity', (v) => {
	plotParameters.filteredDataOpacity = v
})
eventBus.on('PlotTools.setDataOpacity', (v) => {
	plotParameters.defaultDataOpacity = v
})
eventBus.on('PlotTools.editCategory', (cAr) => {
	editCategory(cAr[0], cAr[1])
})
eventBus.on('FilterElement.deleteFilter', deleteFilter)

// Expose methods from this container to parent containers
defineExpose({
	updateContainerSize,
});

function lineGenerator(data) {

	let dataCats = Object.keys(data)
	let dataArray = Array(dataCats.length).fill(null)

	for (let i = 0; i < dataCats.length; i++) {
		let c = categoryNameMap.get(dataCats[i])

		if (!c)  {
			continue
		}

		dataArray[c.position] = {
			x: c.position*plotParameters.horizontalOffset, 
			y: c.scaleLinear(data[c.title])*getAxisLength()
		}
	}

	const lengthPreFilter = dataArray.length
	dataArray = dataArray.filter((obj) => { return obj != null })
	const lengthPostFilter = dataArray.length
	
	return d3.line([])
		.x((d) => {return d.x})
		.y((d) => {return d.y})
		.curve(d3.curveMonotoneX)
		(dataArray)
}

function addRandomCategory() {
	const names = ['Sture', 'Märta', 'Skurt', 'Anna', 'Astrid', 'Anders', 'Kurs', 'Bob', 'Per', 'Mulle Meck', 'Stolle', 'Stig', 'Robin', 'August', 'Lisa', 'Pelle']
	const lb = Math.floor(Math.random() * 100);
	const ub = Math.floor(Math.random() * 100);
	const name = names[Math.floor(Math.random()*names.length)];
	const c = new Category(name, lb, ub)
	addCategory(c)
}

function addCategory(c) {
	let position = 0
	if (categories.length > 0) {
		position = categories[categories.length - 1].position + 1
	}
	categories.push(c)
	updateHorizontalOffset()
	categoryNameMap.set(c.title, c)
	console.log(`Added category ${c.title}`)
}

function editCategory(oldC, newC) {
	const currentC = categoryNameMap.get(oldC.title)
	currentC.morph(newC)
}

function deleteCategory(c) {
	// Delete category from category list
	let deleteIndex = -1
	for (let i = 0; i < categories.length; i++) {
		const cat = categories[i]
		if (c.title !== cat.title) continue
		deleteIndex = i
		break
	}
	console.log(`Deleting category ${categories[deleteIndex].title} at index = ${deleteIndex}`)
	categoryNameMap.set(c.title, null)
	categories.splice(deleteIndex, 1)

	// Adjust positions of other categories
	for (let i=deleteIndex; i < categories.length; i++) {
		const cat = categories[i]
		cat.position--
	}

	// Adjust plot horizontal layout
	plotParameters.horizontalOffset = getPlotXBounds()[1]/Math.max(1,(categories.length-1))	
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
	if (dataPointFilterCheck(dataPoint)) {
		return plotParameters.defaultDataOpacity
	} 

	return plotParameters.filteredDataOpacity
}

function dataPointFilterCheck (dataPoint) {
	/**
	 * Returns true if the data point passes the filter
	 */
	for (let key of Object.keys(filters)) {
		let passed = false

		if (filters[key].length === 0) { 
			passed = true 
		}

		for (let filter of filters[key]) {
			if (filter.filter(dataPoint[key])) {
				passed = true
			} 
		}
		
		if (!passed) return false
	}

	return true
}


function setColorScale (category) {
	settings.colorScaleCategory = category.title
	settings.colorScale = d3.scaleSequential().domain([category.lb, category.ub]).interpolator(d3.interpolateRgbBasis(["red", "green", "blue"]))
}

function getTickString (tickData) {
	if (isNaN(parseFloat(tickData))) {
		// Not a number
		return "String!"
	} else {
		// A number
		return Math.round(tickData * 100) / 100
	}
}

function dragFilterBox(evt) {
	if (!plotVariables.mousedown) return
	plotVariables.currentFilterEndValue = evt.layerY
}

function dragFilterStart (evt, c) {
	plotVariables.mousedown = true; 
	plotVariables.currentFilterCategory = c; 
	plotVariables.currentFilterStartValue = evt.layerY
	plotVariables.currentFilterStartTime = Date.now()
}

function dragFilterDone() {
	const minDragTime = 200 // ms
	if (!plotVariables.mousedown) return
	if (Date.now() - plotVariables.currentFilterStartTime < minDragTime) return

	// Calculate domain extent
	const c = plotVariables.currentFilterCategory
	const y1 = plotVariables.currentFilterStartValue - plotParameters.padding
	const y1Ratio = (y1 / getAxisLength())
	const y2 = plotVariables.currentFilterEndValue - plotParameters.padding
	const y2Ratio = (y2 / getAxisLength())
	const thresholdA = c.getScale().invert(y1Ratio)
	const thresholdB = c.getScale().invert(y2Ratio)

	// Create and add filter
	const filter = new DataFilter(c.title, thresholdA, thresholdB)
	addFilter(filter)

	plotVariables.mousedown = false; 
	plotVariables.currentFilterCategory = null
	plotVariables.currentFilter = null
	plotVariables.currentFilterStartValue = 0
}

function addFilter(f) {
	if (!filters[f.property]) {
		filters[f.property] = []
	}
	filters[f.property].push(f)
	eventBus.emit('PCPlot.addFilter', f)
}

function deleteFilter(filterToDelete) {
	let deleteIndex = -1
	for (let i = 0; i < filters[filterToDelete.property].length; i++) {
		const f = filters[filterToDelete.property][i]
		if (f.id === filterToDelete.id) {
			deleteIndex = i
			console.log("DELETING FILTER WITH ID = "+f.id)
			break;
		}
	}
	if (deleteIndex === -1) {
		console.error('Failed to identify filter to delete.')
	}

	filters[filterToDelete.property].splice(deleteIndex, 1)
	eventBus.emit('PCPlot.deleteFilter', filterToDelete)
}

function selectCategory (c) {
	selectedCategoryName.value = c.title
	setColorScale(c)
	eventBus.emit('PCPlot.selectCategory', c)
}

function updateHorizontalOffset () {
	plotParameters.horizontalOffset = getPlotXBounds()[1]/Math.max(1,(categories.length-1))	
}

function updateContainerSize () {
	const svg = plotCanvas.value
	const x = componentContainer.value.clientWidth;
	const y = componentContainer.value.clientHeight;
	svg.style.width=x+"px"
	svg.style.height=y+"px"

	updateHorizontalOffset()
}


function readFile (evt) {
	const file = evt.target.files[0]
	const reader = new FileReader()
	reader.readAsText(new Blob([file], {"type": file.type}))	
	reader.onloadend = (e) => {
		let csvData = d3.csvParse(e.target.result)
		console.log(csvData.columns)

		const dataToPlot = []

		let maxValMap = new Map()
		let minValMap = new Map()

		for (let row of csvData) {
			let dataPoint = {}
			for (let col of csvData.columns) {
				let value = row[col]

				if (isNaN(parseFloat(value))) {
					// Not numeric
					continue
				} else {
					// Numeric
					value = parseFloat(value)
					

					if (!maxValMap.get(col)) maxValMap.set(col, value)
					if (!minValMap.get(col)) minValMap.set(col, value)

					if (maxValMap.get(col) < value) maxValMap.set(col, value)
					else if (minValMap.get(col) > value) minValMap.set(col, value)
				}

				dataPoint[col] = value
			}
			dataToPlot.push(dataPoint)
		}

		for (let col of csvData.columns) {
			addCategory(new Category(col, minValMap.get(col), maxValMap.get(col)))
		}

		data.push(...dataToPlot)
	}
}

onMounted( () => {
	// Add listener for resize
	window.onresize = updateContainerSize
})

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
			stroke: black;
			stroke-opacity: 0.5;
			fill: purple;
			fill-opacity: 0.3;
		}

		.title {
			font-size: 0.8em;	
			text-anchor: start;
		}

		.tick-string {
			font-size: 0.6em;
			text-anchor: end;
			dominant-baseline: middle;
		}
	}
	.highlighted {

		line {
			stroke-width: 4px;
			stroke: darkblue;
		}
		text {
			stroke-width: 2px;
			fill: darkblue;	
			font-size: 0.8em;	
		}
	}
}



</style>