<template>
	<!-- This component does not provide any visual elements in the DOM. It only provides the PCP CSV element with an image of the paths/lines -->
	<div style="width: 100%; height: 100%;" :style="{paddingTop: `${plotYBounds[0]}px`, paddingLeft: `${plotXBounds[0]}px`}" ref="canvasContainer" />
</template>

<script setup>
import {onMounted, ref, inject, watch} from "vue"
import { storeToRefs } from "pinia"
import * as d3 from "d3"

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
const {horizontalOffset, axisLength, colorScaleCategory, colorScaleFunction, plotYBounds, plotXBounds, resolution} = storeToRefs(PCPStore)
const {data} = storeToRefs(dataStore)

// Layout references
const canvasContainer = ref(null)

// Events
const eventBus = inject('eventBus')
eventBus.on('Layout.contentResize', resizeCanvas)
eventBus.on('Router.TabChange', (viewName) => {
    if (viewName !== 'pcp') return
	resizeCanvas()
})

// Canvas draw variables
let pathCanvas = document.createElement('canvas')
let ctx = pathCanvas.getContext('2d')
let redrawTimerID = null

onMounted( () => {
	resizeCanvas()
})

watch(() => PCPStore.resolution, () => {
	resizeCanvas()
})

watch([() => data.value.filter(dp => !dataStore.dataPointFilterCheck(dp), 
optionsStore.includedDataOpacity, 
optionsStore.excludedDataOpacity, 
optionsStore.curveType,
stateStore.selectedCategory)], () => {
	restartRedrawCountdown()
})

watch(() => dataStore.enabledCategoriesCount, () => {
	restartRedrawCountdown()
})

function restartRedrawCountdown () {
	let refreshDelay = 250

	if (redrawTimerID) {
		clearTimeout(redrawTimerID)
	}

	redrawTimerID = setTimeout( () => {
		draw()
		redrawTimerID = null
	}, refreshDelay)
}

function draw () {
	stateStore.loadingReason = 'Redrawing PCP canvas'
	const t_draw_start = performance.now()

	setTimeout(() => {
		ctx.clearRect(0, 0, canvasContainer.value.offsetWidth, canvasContainer.value.offsetHeight)
		ctx.setTransform(resolution.value,0,0,resolution.value,0,0);

		const renderData = (d, color, opacity) => {
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

		stateStore.clearLoading()

		const t_draw_end = performance.now()
		console.debug(`Draw time: ${(t_draw_end - t_draw_start)/1000} [s]`)

		const dUrl = pathCanvas.toDataURL()
		const t_draw_post_url = performance.now()
		console.log(`dUrl generated in ${(t_draw_post_url - t_draw_end) / 1000} seconds`)
		PCPStore.pathsDataUrl = dUrl

	}, 50)
}

function resizeCanvas () {
	// if (activeView.value !== 'pcp') return
	setTimeout( () => {
		const w = canvasContainer.value.offsetWidth
		const h = canvasContainer.value.offsetHeight
		pathCanvas.width = w * resolution.value
		pathCanvas.height = h * resolution.value
		pathCanvas.style.width = w + 'px'
		pathCanvas.style.height = h + 'px'
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