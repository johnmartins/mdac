<template>
  <div class="plot" style="height: 100% overflow: hidden">
		<svg id="plot-id" width="100%" height="100%" ref="plotCanvas">

			<!-- Plot boundaries -->
			<text x="50%" y="20" class="title" text-anchor="middle">{{metaData.title}}</text>

			<g class="canvas-axis-group" ref="canvasAxisGroup"></g>
			<g class="canvas-axis-group" ref="canvasLineGroup"></g>

		</svg>
	</div>
</template>

<script setup>
import { reactive, ref, onMounted, onUpdated } from "vue"

import * as d3 from "d3"

// DOM Elements
const plotCanvas = ref(null)
const canvasAxisGroup = ref(null)
const canvasLineGroup = ref(null)

const dataSet = reactive(
	[
		{
			title: "Max Deformation",
			data: [0.02, 0.04, 0.03, 0.01],
			lb: 0,
			ub: 1
		},
		{
			title: "Buckling factor",
			data: [5, 60, 20, 50]
		},
		{
			title: "Weight",
			data: [45, 50, 60, 30]
		},
		{
			title: "Aero blockage",
			data: [20, 22, 25, 21]
		},
	]
)

const metaData = reactive({
	title: "Plot Title",
})

function renderPlot() {
	renderAxisArray()
}

function renderAxisArray() {
	console.log("Rendering axis")

	// Wipe existing content from group
	canvasAxisGroup.value.innerHTML = ""	

	// Go through the dataset and create an axis for each subgroup
	let axisRenderCount = 0;
	for (let i = 0; i < dataSet.length; i++) {
		const d = dataSet[i]

		// Set upper range
		let ub = null;
		if ( typeof d.ub !== 'undefined') {
			ub = d.ub
		} else {
			ub = d3.max(d.data)
		}

		// Set lower range
		let lb = null
		if (typeof d.lb !== 'undefined') {
			lb = d.lb
		} else {
			lb = d3.min(d.data)
		}

		createAxis(d.title, [ub, lb], i)
		axisRenderCount++
	}
}

function createAxis(title, domainVector, axisIndex) {
	// Parameters
	const padding = 50
	const height = plotCanvas.value.getBoundingClientRect().height - (2*padding)
	const width = plotCanvas.value.getBoundingClientRect().width - (2*padding)
	let verticalOffset = width / (dataSet.length-1) // Width of available space / number of data series
	const axisOffset = axisIndex*verticalOffset

	// Select SVG DOM element
	const svg = d3.select(canvasAxisGroup.value)

	// Create axis scale
	const scale = d3.scaleLinear()
	.domain(domainVector)
	.range([0, height])
	const axis = d3.axisLeft().scale(scale)
	// Draw axis
	svg
		.append("g")	// Axis group
		.attr("transform", `translate(${padding+axisOffset}, ${padding})`)
		.call(axis)
		.append("text")		// Axis text
		.style("text-anchor", "middle")
		.text(title)
		.attr("y", height + 15)
		.style("fill", "black")
}

onMounted ( () => {
	renderPlot()
})


</script>

<style scoped lang="scss">

$font-color: black;
$background-color: white;

.plot {
	background: $background-color;
	width: 100%;
	height: 100%;

	text {
		fill: $font-color;
	}
}
</style>