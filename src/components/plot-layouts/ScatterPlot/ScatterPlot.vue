<template>
    <div class="component-container">
        <div class="svg-container">
            <svg
            height="100%" 
            width="100%" 
            tabindex="0"
            ref="plotCanvas"
            class="scatter-plot svg-content-responsive"
            style="font-family: monospace;"
            @mousedown.prevent.self="onMouseDown"
            @mouseup.prevent="dragFilterEnd"
            @mousemove="dragFilter"
            >
                <!-- Full plot group -->
                <g v-if="plotVariables.hasRendered"
                :transform="`translate(${scatterStore.paddingLeft} ${scatterStore.paddingTop})`">
                    
                    <!-- Main plot group -->
                    <g class="scatter-container">
                        
                        <g v-if="selectedPlot">
                            <text 
                            :x="(scatterStore.xAxisLength)/2 "
                            :y="-scatterStore.xAxisTitleMargin"
                            >
                            {{selectedPlot.title}}</text>
                        </g>
                        
                        <!-- filter group -->
                        <g>

                            <rect
                            class="filter-box-proto"
                            v-if="filterVariables.mousedown"
                            :x="protoFilterRectAttrs.x"
                            :y="protoFilterRectAttrs.y"
                            :width="protoFilterRectAttrs.width"
                            :height="protoFilterRectAttrs.height"
                            />

                        </g>

                        <!-- x-axis group -->
                        <line 
                        x1="0" :x2="scatterStore.xAxisLength" 
                        :y1="scatterStore.yAxisLength" :y2="scatterStore.yAxisLength" />
                        <g v-if="checkAxisIsDefined('x')">

                            <!-- title -->
                            <text class="scatter-axis-title-x" 
                            :x="scatterStore.xAxisLength/2" 
                            :y="scatterStore.yAxisLength + plotParameters.xAxisTitlePadding"
                            >
                                {{cx.displayTitle}}
                            </text>

                            <!-- ticks -->
                            <g class="tick tick-x" v-for="(tick, index) in cx.getTickArray()" :key="index"> <!-- Tick group -->
                                <text :x="scatterStore.xAxisLength - cx.scaleLinear(tick)*scatterStore.xAxisLength" :y="scatterStore.yAxisLength+ 20" class="tick-string">{{cx.getTickString(tick)}}</text>
                                <line :x1="cx.scaleLinear(tick)*scatterStore.xAxisLength" :y1="scatterStore.yAxisLength" :x2="cx.scaleLinear(tick)*scatterStore.xAxisLength" :y2="scatterStore.yAxisLength+5"/>	<!-- Top tick -->
                            </g>
                        </g>

                        <!-- y-axis group -->
                        <g>
                            <line 
                            x1="0" :x2="0" 
                            :y1="0" :y2="scatterStore.yAxisLength" 
                            />
                            <g v-if="checkAxisIsDefined('y')">
                                <!-- title -->
                                <text class="scatter-axis-title-y" 
                                :x="-scatterStore.yAxisTitleMargin" 
                                :y="scatterStore.yAxisLength/2"
                                :transform="`rotate(-90 ${-scatterStore.yAxisTitleMargin} ${scatterStore.yAxisLength/2})`"
                                >
                                    {{cy.displayTitle}}
                                </text>

                                <!-- ticks -->
                                <g class="tick tick-y" v-for="(tick, index) in cy.getTickArray()" :key="index"> <!-- Tick group -->
                                    <text :x="- 7" :y="+ cy.scaleLinear(tick)*scatterStore.yAxisLength" class="tick-string">{{cy.getTickString(tick)}}</text>
                                    <line x1="0" :y1="cy.scaleLinear(tick)*scatterStore.yAxisLength" x2="-5" :y2="cy.scaleLinear(tick)*scatterStore.yAxisLength"/>	<!-- Top tick -->
                                </g>
                            </g>
                        </g>

                        <!-- data group -->
                        <g v-if="selectedPlot">
                            <ScatterPlotPointLayer />
                        </g>

                    </g>
                    
                    <g class="scatter-plugin-container" :transform="`translate(${scatterStore.xAxisLength + 20} 0)`">
                        <RangeIndicator />
                    </g>
                </g>
            </svg>
        </div>
    </div>

</template>

<script setup>
import { ref, reactive, inject, computed } from "vue"
import { storeToRefs } from "pinia"
import { saveSvgAsPng } from "save-svg-as-png"

import {useStateStore} from "@/store/StateStore"
import {useDataStore} from "@/store/DataStore"
import {useScatterStore} from "@/store/ScatterStore"
import SingleRangeFilter from "@/models/filters/SingleRangeFilter"
import {getTrueEventCoordinates} from "@/utils/svg-utils"
import CategoricFilter from "@/models/filters/CategoricFilter"

// Components
import ScatterPlotPointLayer from "./ScatterPlotPointLayer.vue"
import RangeIndicator from "@/components/plot-features/RangeIndicator"


const dataStore = useDataStore()
const scatterStore = useScatterStore()
const stateStore = useStateStore()

const {selectedPlot} = storeToRefs(scatterStore)
const {activeView} = storeToRefs(stateStore)

// Plot references
const plotCanvas = ref(null)
const cx = computed (() => selectedPlot.value ? dataStore.getCategoryWithName(selectedPlot.value.xAxisCategoryName) : null)
const cy = computed (() => selectedPlot.value ? dataStore.getCategoryWithName(selectedPlot.value.yAxisCategoryName) : null)
const plotParameters = reactive({
    xAxisTitlePadding: 40,
    yAxisTitlePadding: 40,
})
const plotVariables = reactive({
    hasRendered: false,
    xBounds: [],    // 2D vector with x limits
    yBounds: []     // 2D vector with y limits
})
const filterVariables = reactive({
    mousedown: false,
    startTime: 0,
    startValue: {x:0, y:0},
    endValue: {x:0, y:0}
})

const protoFilterRectAttrs = computed( () => {
    // X axis
    const x = Math.min(filterVariables.startValue.x, filterVariables.endValue.x) - getPlotXBounds()[0]
    const width = Math.abs(filterVariables.startValue.x - filterVariables.endValue.x)
    // Y Axis
    const y = Math.min(filterVariables.startValue.y, filterVariables.endValue.y) - getPlotYBounds()[0]
    const height = Math.abs(filterVariables.startValue.y - filterVariables.endValue.y)

    return {
        x: x, 
        y: y,
        width: width,
        height: height
    }
})


const eventBus = inject('eventBus')
eventBus.on('Router.TabChange', (viewName) => {
    if (viewName === 'scatter') {
        plotVariables.hasRendered = true
        updateContainerSize()
    }
})
eventBus.on('Layout.contentResize', updateContainerSize)
eventBus.on('ExportForm.exportRequest', handleExportRequest)

function onMouseDown (evt) {
    clearSelections()
    dragFilterStart(evt)
}

function clearSelections() {
    scatterStore.resetDataSelection()
}

function dragFilterStart (evt) {
    if (!selectedPlot.value) return;
    if (!cx.value || !cy.value) return;
    const loc = getTrueEventCoordinates(evt, plotCanvas.value)
    filterVariables.mousedown = true
    filterVariables.startValue.x = loc.x 
    filterVariables.startValue.y = loc.y
    filterVariables.startTime = Date.now()
}

function dragFilterEnd (evt) {
    const filterTolerance = 200 // ms

    // Ensure that filters are created intentionally
    if (!filterVariables.mousedown || (Date.now() - filterVariables.startTime) < filterTolerance) {
        dragFilterReset();
        return
    } 
    
    // Then, delete all existing filters
    dataStore.clearFilters()

    // Categories
    const cx = dataStore.getCategoryWithName(selectedPlot.value.xAxisCategoryName)
    const cy = dataStore.getCategoryWithName(selectedPlot.value.yAxisCategoryName)

    // Proto filter coordinates
	const x1 = filterVariables.startValue.x - scatterStore.paddingLeft
	const x2 = filterVariables.endValue.x - scatterStore.paddingLeft
    let x1Ratio = 1-(x1 / scatterStore.xAxisLength)
	let x2Ratio = 1-(x2 / scatterStore.xAxisLength)
    const y1 = filterVariables.startValue.y - scatterStore.paddingTop
	const y2 = filterVariables.endValue.y - scatterStore.paddingTop
    let y1Ratio = (y1 / scatterStore.yAxisLength)
	let y2Ratio = (y2 / scatterStore.yAxisLength)

    createFilter(cx, x1Ratio, x2Ratio)
    createFilter(cy, y1Ratio, y2Ratio)

    dragFilterReset()
}

function createFilter (category, axisRatio1, axisRatio2) {
    dataStore.addFilter(category.usesCategoricalData ? 
        CategoricFilter.createFromRatios(category, axisRatio1, axisRatio2) : 
        SingleRangeFilter.createFromRatios(category, axisRatio1, axisRatio2)
    )
}

function dragFilter (evt) {
    const loc = getTrueEventCoordinates(evt, plotCanvas.value)
    filterVariables.endValue.x = loc.x
    filterVariables.endValue.y = loc.y
}

function dragFilterReset () {
    filterVariables.mousedown = false
    filterVariables.startTime = 0
    filterVariables.endTime = 0
    filterVariables.startValue = {x: 0, y: 0}
    filterVariables.endValue = {x: 0, y: 0}
}

function getPlotYBounds () {
	const array = [scatterStore.paddingTop, plotCanvas.value.getBoundingClientRect().height - scatterStore.paddingBottom]
	return array
}

function getPlotXBounds () {
	const array = [scatterStore.paddingLeft, plotCanvas.value.getBoundingClientRect().width - scatterStore.paddingRight]
    return array
}

function updateContainerSize () {
    scatterStore.plotXBounds = getPlotXBounds()
    scatterStore.plotYBounds = getPlotYBounds()
}

function checkAxisIsDefined (axis) {
    if (axis !== 'x' && axis !== 'y') {
        throw new Error('No such axis')
    }

    if (!selectedPlot.value) return false

    if (axis === 'x') {
        if (!selectedPlot.value.xAxisCategoryName) return false
        if (!dataStore.getCategoryWithName(selectedPlot.value.xAxisCategoryName)) return false

    } else if (axis === 'y') {
        if (!selectedPlot.value.yAxisCategoryName) return false
        if (!dataStore.getCategoryWithName(selectedPlot.value.yAxisCategoryName)) return false
    }

    return true
}

function handleExportRequest (format) {
	if (activeView.value !== 'scatter') return

    if (format === 'png') {
		exportPNG()
	} 
	else {
		throw new Error('Unknown format in export request')
	}
}

function exportPNG () {
	const csvElement = plotCanvas.value
	saveSvgAsPng(csvElement, 'ScatterPlot.png', {encoderOptions: 1, backgroundColor: 'white', scale: 2})
}

</script>

<style lang="scss" scoped>

.component-container {
	height: 100%;
	overflow: hidden;
}

.svg-container {
    height: 100%;
    overflow: hidden;
}

.scatter-plot {
    line {
        stroke: black;
        fill: transparent;
    }
    text {
        fill: black;
        stroke: transparent;
        dominant-baseline: middle; // Used for vertical alignment
        text-anchor: middle;
    }
    .scatter-proto-filter {
        stroke: black;
        stroke-opacity: 0.8;
        fill: yellow;
        fill-opacity: 0.8;
    }

    .tick-y text {
        text-anchor: end;
    }
}


</style>