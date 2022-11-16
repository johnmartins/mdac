<template>
    <div class="component-container">
        <div class="svg-container">
            <svg
            height="100%" 
            width="100%" 
            tabindex="0"
            ref="plotCanvas"
            class="scatter-plot svg-content-responsive"
            @mousedown.prevent.self="onMouseDown"
            @mouseup.prevent="dragFilterEnd"
            @mousemove="dragFilter"
            >
                <!-- Full plot group -->
                <g v-if="plotVariables.hasRendered">
                    <g v-if="selectedPlot">
                        <text 
                        :x="(scatterStore.plotXBounds[1] + scatterStore.padding)/2 "
                        :y="scatterStore.plotYBounds[0]-plotParameters.xAxisTitlePadding"
                        >
                        {{selectedPlot.title}}</text>
                    </g>
                    <!-- filter group -->
                    <g
                    :transform="`translate(${plotParameters.padding} ${plotParameters.padding})`"
                    > 

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
                    <g
                    :transform="`translate(${scatterStore.padding} ${scatterStore.padding})`"> 
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
                            <g class="tick" v-for="(tick, index) in cx.getTickArray()" :key="index"> <!-- Tick group -->
                                <text :x="scatterStore.xAxisLength - cx.scaleLinear(tick)*scatterStore.xAxisLength" :y="scatterStore.yAxisLength+ 20" class="tick-string">{{cx.getTickString(tick)}}</text>
                                <line :x1="cx.scaleLinear(tick)*scatterStore.xAxisLength" :y1="scatterStore.yAxisLength" :x2="cx.scaleLinear(tick)*scatterStore.xAxisLength" :y2="scatterStore.yAxisLength+5"/>	<!-- Top tick -->
                            </g>
                        </g>
                    </g>

                    <!-- y-axis group -->
                    <g
                    :transform="`translate(${plotParameters.padding} ${plotParameters.padding})`"> 
                        <line 
                        x1="0" :x2="0" 
                        :y1="0" :y2="scatterStore.yAxisLength" 
                        />
                        <g v-if="checkAxisIsDefined('y')">
                            <!-- title -->
                            <text class="scatter-axis-title-y" 
                            :x="- plotParameters.yAxisTitlePadding" 
                            :y="scatterStore.yAxisLength/2"
                            :transform="`rotate(-90 ${- plotParameters.yAxisTitlePadding} ${scatterStore.yAxisLength/2})`"
                            >
                                {{cy.displayTitle}}
                            </text>

                            <!-- ticks -->
                            <g class="tick" v-for="(tick, index) in cy.getTickArray()" :key="index"> <!-- Tick group -->
                                <text :x="- 7" :y="+ cy.scaleLinear(tick)*scatterStore.yAxisLength" class="tick-string" style="text-anchor: end;">{{cy.getTickString(tick)}}</text>
                                <line x1="0" :y1="cy.scaleLinear(tick)*scatterStore.yAxisLength" x2="-5" :y2="cy.scaleLinear(tick)*scatterStore.yAxisLength"/>	<!-- Top tick -->
                            </g>
                        </g>
                    </g>

                    <!-- data group -->
                    <g v-if="selectedPlot"
                    :transform="`translate(${scatterStore.padding} ${scatterStore.padding})`">
                        <ScatterPlotPointLayer />
                    </g>
                </g>
            </svg>
        </div>
    </div>

</template>

<script setup>
import { ref, reactive, inject, computed } from "vue"
import { storeToRefs } from "pinia"

import {useDataStore} from "@/store/DataStore"
import {useScatterStore} from "@/store/ScatterStore"
import SingleRangeFilter from "@/models/filters/SingleRangeFilter"
import {getTrueEventCoordinates} from "@/utils/svg-utils"
import CategoricFilter from "@/models/filters/CategoricFilter"

// Components
import ScatterPlotPointLayer from "./ScatterPlotPointLayer.vue"

const dataStore = useDataStore()
const scatterStore = useScatterStore()
const {selectedPlot} = storeToRefs(scatterStore)

// Plot references
const plotCanvas = ref(null)
const cx = computed (() => selectedPlot.value ? dataStore.getCategoryWithName(selectedPlot.value.xAxisCategoryName) : null)
const cy = computed (() => selectedPlot.value ? dataStore.getCategoryWithName(selectedPlot.value.yAxisCategoryName) : null)
const plotParameters = reactive({
    padding: 120,
    xAxisTitlePadding: 40,
    yAxisTitlePadding: 80,
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
	const x1 = filterVariables.startValue.x - scatterStore.padding
	const x2 = filterVariables.endValue.x - scatterStore.padding
    let x1Ratio = 1-(x1 / scatterStore.xAxisLength)
	let x2Ratio = 1-(x2 / scatterStore.xAxisLength)
    const y1 = filterVariables.startValue.y - scatterStore.padding
	const y2 = filterVariables.endValue.y - scatterStore.padding
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
	const array = [scatterStore.padding, plotCanvas.value.getBoundingClientRect().height - scatterStore.padding]
	return array
}

function getPlotXBounds () {
	const array = [scatterStore.padding, plotCanvas.value.getBoundingClientRect().width - scatterStore.padding]
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
}

</style>