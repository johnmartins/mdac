<template>
	<div class="component-container" ref="componentContainer">
		<div>
			Import CSV file: 
			<input @change="readFile" type="file" />
		</div>
		<div style="height: 100%;" class="svg-container" ref="svgContainer">
			<svg 
			class="pcp-plot svg-content-responsive" height="100%" width="100%" ref="plotCanvas">
				
				<!-- Full graphics group -->
				<g
				:transform="`translate(${plotParameters.padding} 0)`"> 
				
					<!-- Data line generator -->
					<path 
					fill="transparent" 
					stroke-width="1"
					:stroke="getLineColor(d)"
					:transform="`translate(0 ${getPlotYBounds()[0]})`"
					v-for="(d, index) in data" :key="index" :d="lineGenerator(d)" />

					<!-- Axis group -->
					<g 
						class="axis" 
						v-for="c in categories" 
						@click="selectCategory(c)"
						@mouseover="highlightedCategoryName = c.title"
						@mouseleave="highlightedCategoryName = null"
						v-bind:class="{highlighted: highlightedCategoryName == c.title}"
						:key="c.position" 
						:transform="`translate(${c.position*plotParameters.horizontalOffset} ${getPlotYBounds()[0]})`">	<!-- Axis group -->
						
						<text 
							x="0" 
							:y="getPlotYBounds()[1]-(plotParameters.axisTitlePadding-10)" 
							class="title" 
							:transform="`rotate(${plotParameters.axisTitleRotation} 0 ${getPlotYBounds()[1]-(plotParameters.axisTitlePadding-10)})`">
							{{c.title}}
						</text>
						
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
import { reactive, ref, onMounted, onUpdated } from "vue"
import * as d3 from "d3"

import Category from "../../models/plots/Category"

const plotCanvas = ref(null)
const svgContainer = ref(null)
const componentContainer = ref(null)

const plotParameters = {
	padding: 50,
	horizontalOffset: 200,
	axisTitlePadding: 150,
	axisTitleRotation: 45
}

const categories = reactive([])
const data = reactive([])
const settings = reactive({
	colorScaleCategory: null,
	colorScale: () => {return "black"}
})
const highlightedCategoryName = ref(null)

const categoryNameMap = new Map()

function lineGenerator(data) {

	let dataCats = Object.keys(data)
	let dataArray = Array(dataCats.length).fill(null)

	for (let i = 0; i < dataCats.length; i++) {
		let c = categoryNameMap.get(dataCats[i])

		if (!c)  {
			console.error("Category not found")
			console.error(data)
			return
		}

		dataArray[c.position] = {
			x: c.position*plotParameters.horizontalOffset, 
			y: c.scaleLinear(data[c.title])*getAxisLength()
		}
	}

	const lengthPreFilter = dataArray.length
	dataArray = dataArray.filter((obj) => { return obj != null })
	const lengthPostFilter = dataArray.length

	if (lengthPostFilter < lengthPreFilter)	{
		console.error("Warning! Undefined categories in data-set.")
	}
	
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
	plotParameters.horizontalOffset = getPlotXBounds()[1]/Math.max(1,(categories.length-1))	
	categoryNameMap.set(c.title, c)
	console.log(`Added category ${c.title}`)
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

function getLineColor (data) {
	if (!settings.colorScaleCategory) return "black"
	if (!data[settings.colorScaleCategory]) return "black"
	return settings.colorScale(data[settings.colorScaleCategory])
}

function setColorScale (category) {
	settings.colorScaleCategory = category.title
	settings.colorScale = d3.scaleSequential().domain([category.lb, category.ub]).interpolator(d3.interpolateRgbBasis(["red", "green", "blue"]))
	//settings.colorScale = d3.scaleLinear().domain([category.lb, category.ub]).range(['red', 'blue'])
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

function highlightCategory (c) {

}

function clearHighlightCategory (c) {

}

function selectCategory (c) {
	setColorScale(c)
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

	function updateWindow () {
		const svg = plotCanvas.value
		const x = componentContainer.value.clientWidth;
		const y = componentContainer.value.clientHeight;
		svg.style.width=x+"px"
		svg.style.height=y+"px"
	}

	window.onresize = updateWindow
	
	/**
	// Test categories
	addCategory(new Category("maxdef", 0, 1))
	addCategory(new Category("volume", 0, 200))
	addCategory(new Category("bf", 0, 20))
	addCategory(new Category("aeroblock", 0, 100))
	setColorScale(categoryNameMap.get("maxdef"))

	// Test data
	data.push(
	{
		"maxdef": 0.1,
		"volume": 200,
		"bf": 10,
		"aeroblock": 25
	},
	{
		"maxdef": 0.5,
		"volume": 150,
		"bf": 20,
		"aeroblock": 70
	})	
	*/ 
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
			stroke-width: 2px;
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