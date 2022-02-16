<template>
	<div class="component-container" ref="componentContainer">
		<button @click="addCategory">Add axis</button>
		<div style="height: 100%;" class="svg-container" ref="svgContainer">
			<svg class="pcp-plot svg-content-responsive" height="100%" width="100%" ref="plotCanvas">

				<g 
					class="axis" 
					v-for="c in categories" 
					:key="c.position" 
					:transform="`translate(${c.position*plotParameters.horizontalOffset + plotParameters.padding} ${getPlotYBounds()[0]})`">	<!-- Axis group -->
					
					<text 
						x="0" 
						:y="getPlotYBounds()[1]-(plotParameters.axisTitlePadding-10)" 
						class="title" 
						:transform="`rotate(${plotParameters.axisTitleRotation} 0 ${getPlotYBounds()[1]-(plotParameters.axisTitlePadding-10)})`">
						{{c.title}}
					</text>
					
					<line x1="0" y1="0" x2="0" :y2="getPlotYBounds()[1]-(plotParameters.axisTitlePadding)" stroke-width="1" stroke="black"/>

					<g class="tick" v-for="(tick, tickIndex) in c.ticks" :key="tickIndex"> <!-- Tick group -->
						<text x="-10" :y="c.scaleLinear(tick)*getAxisLength()" class="tick-string">{{tick}}</text>
						<line x1="0" :y1="c.scaleLinear(tick)*getAxisLength()" x2="-5" :y2="c.scaleLinear(tick)*getAxisLength()" stroke-width="1" stroke="black"/>	<!-- Top tick -->
					</g>
				</g>
			</svg>
		</div>
	</div>
</template>

<script setup>
import { reactive, ref, onMounted, onUpdated } from "vue"
import * as d3 from "d3"

const plotCanvas = ref(null)
const svgContainer = ref(null)
const componentContainer = ref(null)

const plotParameters = {
	padding: 50,
	horizontalOffset: 200,
	axisTitlePadding: 200,
	axisTitleRotation: 45
}

const categories = reactive([])

function addCategory() {
	let position = 0
	if (categories.length > 0) {
		position = categories[categories.length - 1].position + 1
	}

	categories.push({
		position: position,
		title: "Very long category name wow",
		ticks: [20, 15, 10, 5, 0],
		scaleLinear: d3.scaleLinear().range([0, 1]).domain([20, 0]),
		ub: 20,
		lb: 0
	})

	const scale = d3.scaleLinear().range([0, 1]).domain([0, 20])
	console.log(scale(10))

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

	addCategory()
})

</script>

<style lang="scss" scoped>

.component-container {
	height: 100%;
	overflow: hidden;
}

.pcp-plot {
	.axis {
		.title {
			stroke: transparent;
			fill: black;
			font-size: 1em;	
			text-anchor: start;
		}

		.tick-string {
			stroke: transparent;
			fill: black;
			font-size: 0.8em;
			text-anchor: end;
			dominant-baseline: middle;
		}
	}
}



</style>