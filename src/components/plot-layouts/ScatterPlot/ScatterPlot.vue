<template>
    <div class="component-container">
        <div class="svg-container">
            <svg
            height="100%" 
            width="100%" 
            tabindex="0"
            ref="plotCanvas"
            class="scatter-plot svg-content-responsive"
            @mousedown.prevent="dragFilterStart"
            @mouseup.prevent="dragFilterEnd"
            @mousemove="dragFilter"
            >
                <!-- Full plot group -->
                <g v-if="plotVariables.hasRendered">
                    <g v-if="selectedPlot">
                        <text 
                        :x="(plotVariables.xBounds[1] + plotParameters.padding)/2 "
                        :y="plotVariables.yBounds[0]-plotParameters.xAxisTitlePadding"
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
                    :transform="`translate(${plotParameters.padding} ${plotParameters.padding})`"> 
                        <line 
                        x1="0" :x2="getXAxisLength()" 
                        :y1="getYAxisLength()" :y2="getYAxisLength()" />
                        <g v-if="checkAxisIsDefined('x')">

                            <!-- title -->
                            <text class="scatter-axis-title-x" 
                            :x="getXAxisLength()/2" 
                            :y="getYAxisLength() + plotParameters.xAxisTitlePadding"
                            >
                                {{cx.displayTitle}}
                            </text>

                            <!-- ticks -->
                            <g class="tick" v-for="(tick, index) in cx.getTickArray()" :key="index"> <!-- Tick group -->
                                <text :x="getXAxisLength() - cx.scaleLinear(tick)*getXAxisLength()" :y="getYAxisLength()+ 20" class="tick-string">{{cx.getTickString(tick)}}</text>
                                <line :x1="cx.scaleLinear(tick)*getXAxisLength()" :y1="getYAxisLength()" :x2="cx.scaleLinear(tick)*getXAxisLength()" :y2="getYAxisLength()+5"/>	<!-- Top tick -->
                            </g>
                        </g>
                    </g>

                    <!-- y-axis group -->
                    <g
                    :transform="`translate(${plotParameters.padding} ${plotParameters.padding})`"> 
                        <line 
                        x1="0" :x2="0" 
                        :y1="0" :y2="getYAxisLength()" 
                        />
                        <g v-if="checkAxisIsDefined('y')">
                            <!-- title -->
                            <text class="scatter-axis-title-y" 
                            :x="- plotParameters.yAxisTitlePadding" 
                            :y="getYAxisLength()/2"
                            :transform="`rotate(-90 ${- plotParameters.yAxisTitlePadding} ${getYAxisLength()/2})`"
                            >
                                {{cy.displayTitle}}
                            </text>

                            <!-- ticks -->
                            <g class="tick" v-for="(tick, index) in cy.getTickArray()" :key="index"> <!-- Tick group -->
                                <text :x="- 7" :y="+ cy.scaleLinear(tick)*getYAxisLength()" class="tick-string" style="text-anchor: end;">{{cy.getTickString(tick)}}</text>
                                <line x1="0" :y1="cy.scaleLinear(tick)*getYAxisLength()" x2="-5" :y2="cy.scaleLinear(tick)*getYAxisLength()"/>	<!-- Top tick -->
                            </g>
                        </g>
                    </g>

                    <!-- data group -->
                    <g v-if="selectedPlot"
                    :transform="`translate(${plotParameters.padding} ${plotParameters.padding})`">
                        <!-- Excluded data (through user applied filters) -->
                        <g v-for="(d, index) in data.filter(de => !dataStore.dataPointFilterCheck(de))" :key="index" style="fill: black; opacity: 0.4;">
                            <circle 
                            :cx="getScaledCoordinate(d, selectedPlot.xAxisCategoryName, 'x')"
                            :cy="getScaledCoordinate(d, selectedPlot.yAxisCategoryName, 'y')" 
                            r="3" />
                        </g>
                        <!-- Included data -->
                        <g v-for="(d, index) in data.filter(dataStore.dataPointFilterCheck)" :key="index" style="fill: blue;">
                            <circle 
                            :cx="getScaledCoordinate(d, selectedPlot.xAxisCategoryName, 'x')"
                            :cy="getScaledCoordinate(d, selectedPlot.yAxisCategoryName, 'y')" 
                            r="3" />
                        </g>
                    </g>
                </g>
            </svg>
        </div>
    </div>

</template>

<script setup>
import { ref, reactive, onMounted, inject, computed } from "vue"
import * as d3 from "d3"
import { storeToRefs } from "pinia"

import {useDataStore} from "@/store/DataStore"
import {useScatterStore} from "@/store/ScatterStore"
import SingleRangeFilter from "@/models/filters/SingleRangeFilter"
import {getTrueEventCoordinates} from "@/utils/svg-utils"
import CategoricFilter from "@/models/filters/CategoricFilter"

const dataStore = useDataStore()
const {data, filters, categories} = storeToRefs(dataStore)
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
    deltaTime: 0,
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

function dragFilterStart (evt) {
    if (!selectedPlot.value) return;
    if (!cx.value || !cy.value) return;
    const loc = getTrueEventCoordinates(evt, plotCanvas.value)
    filterVariables.mousedown = true
    filterVariables.startValue.x = loc.x 
    filterVariables.startValue.y = loc.y
}

function dragFilterEnd (evt) {
    if (!filterVariables.mousedown) return;

    // First of, delete all existing filters
    dataStore.clearFilters()

    // Categories
    const cx = dataStore.getCategoryWithName(selectedPlot.value.xAxisCategoryName)
    const cy = dataStore.getCategoryWithName(selectedPlot.value.yAxisCategoryName)

    // Proto filter coordinates
	const x1 = filterVariables.startValue.x - plotParameters.padding
	const x2 = filterVariables.endValue.x - plotParameters.padding
    let x1Ratio = 1-(x1 / getXAxisLength())
	let x2Ratio = 1-(x2 / getXAxisLength())
    const y1 = filterVariables.startValue.y - plotParameters.padding
	const y2 = filterVariables.endValue.y - plotParameters.padding
    let y1Ratio = (y1 / getYAxisLength())
	let y2Ratio = (y2 / getYAxisLength())

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
	const array = [plotParameters.padding, plotCanvas.value.getBoundingClientRect().height - plotParameters.padding]
	return array
}

function getPlotXBounds () {
	const array = [plotParameters.padding, plotCanvas.value.getBoundingClientRect().width - plotParameters.padding]
    return array
}

function getXAxisLength () {
    return plotVariables.xBounds[1] - plotParameters.padding
}

function getYAxisLength () {
    return plotVariables.yBounds[1] - plotParameters.padding
}

function updateContainerSize () {
    plotVariables.xBounds = getPlotXBounds()
    plotVariables.yBounds = getPlotYBounds()
}

function getScaledCoordinate (data, categoryName, axis) {
    const c = dataStore.getCategoryWithName(categoryName)
    const value = data[categoryName]

    if (!value) {
        if (axis !== 'x' && axis !== 'y') {
            throw new Error('Unknown axis setting')
        }
        return axis === 'x' ? 0 : getYAxisLength()
    }

    const valueScaled = c.scaleLinear(value)

    let coordinate = 0
    if (axis === 'x') {
        coordinate = getXAxisLength() - valueScaled * (plotVariables.xBounds[1] - plotVariables.xBounds[0])
    } else if (axis === 'y') {
        coordinate = valueScaled * (plotVariables.yBounds[1] - plotVariables.yBounds[0])
    } else {
        throw new Error('Unknown axis setting')
    }

    if (isNaN(coordinate)) return 0

    return coordinate
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