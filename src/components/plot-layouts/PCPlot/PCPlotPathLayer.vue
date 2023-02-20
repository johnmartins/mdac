<template>
	<div style="width: 100%; height: 100%;" :style="{paddingTop: `${plotYBounds[0]}px`, paddingLeft: `${plotXBounds[0]}px`}" ref="canvasContainer">
		<canvas ref="pathCanvas">



		</canvas>
	</div>

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
import {useStateStore} from "../../../store/StateStore"

// Store references
const dataStore = useDataStore()
const PCPStore = usePCPStore()
const optionsStore = useOptionsStore()
const stateStore = useStateStore()

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
eventBus.on('Router.TabChange', (viewName) => {
    if (viewName !== 'pcp') return
	restartRedrawCountdown()
})

// Canvas draw variables
let redrawTimerID = null
let scale = 1


onMounted( () => {
	ctx = pathCanvas.value.getContext('2d')
	resizeCanvas()
})

watch([() => data.value.filter(dp => !dataStore.dataPointFilterCheck(dp), 
optionsStore.includedDataOpacity, 
optionsStore.excludedDataOpacity, 
stateStore.selectedCategory)], () => {
	restartRedrawCountdown()
})

watch(() => dataStore.enabledCategoriesCount, () => {
	restartRedrawCountdown()
})

function restartRedrawCountdown () {
	let refreshDelay = 250

	if (redrawTimerID) {
		console.log("reset timer")
		clearTimeout(redrawTimerID)
	}

	redrawTimerID = setTimeout( () => {
		console.log("drawing")
		draw(scale)
		redrawTimerID = null
	}, refreshDelay)
}

function draw (scale) {
	stateStore.loadingReason = 'Redrawing PCP canvas'
	const t0 = performance.now()

	setTimeout(() => {
		const t1 = performance.now()
		ctx.clearRect(0, 0, canvasContainer.value.offsetWidth, canvasContainer.value.offsetHeight)
		ctx.setTransform(scale,0,0,scale,0,0);
		const t2 = performance.now()

		const renderData = (d, color, opacity) => {
			ctx.beginPath();
			lineGenerator(d)
			ctx.lineWidth = 1;
			ctx.globalAlpha = opacity;
			ctx.strokeStyle = color
			ctx.stroke();
			ctx.closePath();
		}

		const t3 = performance.now()
		// Render excluded data
		if (!optionsStore.hideExcluded) {
			data.value
				.filter(d => !dataStore.dataPointFilterCheck(d))
				.forEach(d => renderData(d, '#bfbfbf', optionsStore.excludedDataOpacity))
		}

		const t4 = performance.now()
		// Render included data
		data.value
			.filter(dataStore.dataPointFilterCheck)
			.forEach(d => renderData(d, getLineColor(d), optionsStore.includedDataOpacity)) 

		stateStore.clearLoading()

		const t5 = performance.now()

		console.log(`Total time elapsed for DRAW: ${t5-t0}, internal timeout: ${t5-t1}`)
		console.log(`t54=${t5-t4} t43=${t4-t3} t32=${t3-t2} t21=${t2-t1} t10=${t1-t0}`)
	}, 50)
}

function resizeCanvas () {
	// if (activeView.value !== 'pcp') return
	scale = 1 // < 1: low res, > 1: high res
	setTimeout( () => {
		const w = canvasContainer.value.offsetWidth
		const h = canvasContainer.value.offsetHeight
		pathCanvas.value.width = w * scale
		pathCanvas.value.height = h * scale
		pathCanvas.value.style.width = w + 'px'
		pathCanvas.value.style.height = h + 'px'
		restartRedrawCountdown()
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
		const x = dataStore.getTrueCategoryPosition(c.title)*horizontalOffset.value
		const y = c.scaleLinear(d[c.title])*axisLength.value

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