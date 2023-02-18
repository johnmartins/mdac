<template>
	<div style="width: 100%; height: 100%;" :style="{paddingTop: `${plotYBounds[0]}px`, paddingLeft: `${plotXBounds[0]}px`}" ref="canvasContainer">
		<canvas ref="pathCanvas" width="400" height="400">



		</canvas>
	</div>

	<!--
    <g stroke-width="1" fill="transparent" :transform="`translate(0 ${plotYBounds[0]})`">
        <g v-if="!optionsStore.hideExcluded">
            <path v-for="(d, index) in data.filter(dp => !dataStore.dataPointFilterCheck(dp))" 
                :key="index" 
                stroke="#bfbfbf"
                :stroke-opacity="optionsStore.excludedDataOpacity"
                :d="lineGenerator(d)"
            />
        </g>
        
        <path v-for="(d, index) in data.filter(dp => dataStore.dataPointFilterCheck(dp))" 
            :key="index" 
            :excluded="true"
            :stroke='getLineColor(d)'
            :stroke-opacity="optionsStore.includedDataOpacity"
            :d="lineGenerator(d)"
        />
    </g>
	-->

</template>

<script setup>
import {onMounted, ref, inject, watch} from "vue"
import { storeToRefs } from "pinia"
import * as d3 from "d3"

import {truncateDecimals} from "@/utils/data-utils"

// Stores
import {useDataStore} from "../../../store/DataStore"
import {usePCPStore} from "../../../store/PCPStore"
import {useOptionsStore} from "../../../store/OptionsStore"

// Store references
const dataStore = useDataStore()
const PCPStore = usePCPStore()
const optionsStore = useOptionsStore()

// Store refs
const {horizontalOffset, axisLength, colorScaleCategory, colorScaleFunction, plotYBounds, plotXBounds} = storeToRefs(PCPStore)
const {data} = storeToRefs(dataStore)

// Layout references
const canvasContainer = ref(null)
const pathCanvas = ref(null)
let ctx = null

// Events
const eventBus = inject('eventBus')
eventBus.on('Layout.contentResize', resizeCanvas)


onMounted( () => {
	ctx = pathCanvas.value.getContext('2d')
	resizeCanvas()
})

watch(() => data.value.filter(dp => !dataStore.dataPointFilterCheck(dp)), () => {
	draw()
})

function draw () {
	console.log("Redrawing plot paths")
	ctx.clearRect(0, 0, canvasContainer.value.offsetWidth, canvasContainer.value.offsetHeight)

	const renderData = (d, color, opacity) => {
		console.log(opacity)
		ctx.beginPath();
		lineGenerator(d)
		ctx.lineWidth = 1;
		ctx.globalAlpha = opacity;
		ctx.strokeStyle = color
		ctx.stroke();
		ctx.closePath();
	}

	// Render excluded data
	if (!optionsStore.hideExcluded) {
		data.value
			.filter(d => !dataStore.dataPointFilterCheck(d))
			.forEach(d => renderData(d, '#bfbfbf', optionsStore.excludedDataOpacity))
	}

	// Render included data
	data.value
		.filter(dataStore.dataPointFilterCheck)
		.forEach(d => renderData(d, getLineColor(d), optionsStore.includedDataOpacity)) 
	
}

function resizeCanvas () {
	// if (activeView.value !== 'pcp') return
	setTimeout( () => {
		const w = canvasContainer.value.offsetWidth
		const h = canvasContainer.value.offsetHeight
		pathCanvas.value.width = w
		pathCanvas.value.height = h

		draw()
	}, 250)

}

function lineGenerator(d) {
	let dataCats = Object.keys(d)
	let dataArray = Array(dataCats.length).fill(null)

	for (let i = 0; i < dataCats.length; i++) {		
		let c = dataStore.getCategoryWithName(dataCats[i])

		// Ignore disabled categories
		if (!c || !c.enabled)  {
			continue
		}

		// Set data point coordinates
		const x = truncateDecimals(dataStore.getTrueCategoryPosition(c.title)*horizontalOffset.value, 1)			// This needs to be moved
		const y = truncateDecimals(c.scaleLinear(d[c.title])*axisLength.value, 1) 

		// Build data array
		dataArray[c.position] = {
			x: x, 
			y: y
		}
	}

	dataArray = dataArray.filter((obj) => { return obj != null })

	let d3CurveType = d3.curveMonotoneX
	if (optionsStore.curveType === 'curve') {
		d3CurveType = d3.curveMonotoneX
	} else if (optionsStore.curveType === 'line') {
		d3CurveType = d3.curveLinear
	}
	
	return d3.line([])
		.x((de) => {return de.x})
		.y((de) => {return de.y})
		.curve(d3CurveType)
		.context(ctx)
		(dataArray)
}

function getLineColor (dataPoint) {
	if (!colorScaleCategory.value) return "black"
	if (dataPoint[colorScaleCategory.value] === null || dataPoint[colorScaleCategory.value] === undefined) return "black"
	return colorScaleFunction.value(dataPoint[colorScaleCategory.value])
}

</script>

<style lang="scss" scoped>

</style>