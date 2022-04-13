<template>
    <div class="component-container">
        <div class="svg-container">
            <svg
            height="100%" 
            width="100%" 
            tabindex="0"
            ref="plotCanvas"
            class="scatter-plot svg-content-responsive"
            >
                <!-- Full plot group -->
                <g v-if="plotVariables.hasRendered">
                    <g v-if="selectedPlot">
                        <text 
                        :x="(plotVariables.xBounds[1] + plotParameters.padding)/2 "
                        :y="plotVariables.yBounds[0]-plotParameters.axisTitlePadding"
                        >
                        {{selectedPlot.title}}</text>
                    </g>
                    <!-- x-axis group -->
                    <g>
                        <line 
                        :x1="plotVariables.xBounds[0]" :x2="plotVariables.xBounds[1]" 
                        :y1="plotVariables.yBounds[1]" :y2="plotVariables.yBounds[1]" />
                        <g v-if="checkAxisIsDefined('x')">
                            <text class="scatter-axis-title-x" 
                            v-if="dataStore.getCategoryWithName(selectedPlot.xAxisCategoryName) !== null"
                            :x="plotVariables.xBounds[1]/2 + plotParameters.axisTitlePadding" 
                            :y="plotVariables.yBounds[1] + plotParameters.axisTitlePadding"
                            >
                            {{dataStore.getCategoryWithName(selectedPlot.xAxisCategoryName).displayTitle}}
                            </text>
                        </g>
                    </g>

                    <!-- y-axis group -->
                    <g>
                        <line 
                        :x1="plotVariables.xBounds[0]" :x2="plotVariables.xBounds[0]" 
                        :y1="plotVariables.yBounds[0]" :y2="plotVariables.yBounds[1]" 
                        />
                        <g v-if="selectedPlot">
                            <text class="scatter-axis-title-y" 
                            v-if="checkAxisIsDefined('y')"
                            :x="plotVariables.xBounds[0] - plotParameters.axisTitlePadding*2" 
                            :y="plotVariables.yBounds[1]/2"
                            :transform="`rotate(-90 ${plotVariables.xBounds[0] - plotParameters.axisTitlePadding} ${plotVariables.yBounds[1]/2})`"
                            >
                            {{dataStore.getCategoryWithName(selectedPlot.yAxisCategoryName).displayTitle}}
                            </text>
                        </g>
                    </g>

                    <!-- data group -->
                    <g v-if="selectedPlot">
                        <g v-for="(d, index) in data" :key="index">
                            <circle 
                            :cx="getScaledCoordinate(d, selectedPlot.xAxisCategoryName, 'x')"
                            :cy="getScaledCoordinate(d, selectedPlot.yAxisCategoryName, 'y')" 
                            r="5" />
                        </g>
                    </g>
                </g>

            </svg>
        </div>

    </div>

</template>

<script setup>
import { ref, reactive, onMounted, inject } from "vue"
import * as d3 from "d3"
import { storeToRefs } from "pinia"
import {useDataStore} from "@/store/DataStore"
import {useScatterStore} from "@/store/ScatterStore"

const dataStore = useDataStore()
const {data, filters, categories} = storeToRefs(dataStore)
const scatterStore = useScatterStore()
const {selectedPlot} = storeToRefs(scatterStore)

const plotCanvas = ref(null)

const plotParameters = reactive({
    padding: 50,
    axisTitlePadding: 25,
})

const plotVariables = reactive({
    hasRendered: false,
    xBounds: [],    // 2D vector with x limits
    yBounds: []     // 2D vector with y limits
})

const eventBus = inject('eventBus')
eventBus.on('Router.TabChange', (viewName) => {
    if (viewName === 'scatter') {
        plotVariables.hasRendered = true
        updateContainerSize()
    }
})
eventBus.on('Layout.contentResize', updateContainerSize)

function getPlotYBounds () {
	const array = [plotParameters.padding, plotCanvas.value.getBoundingClientRect().height - plotParameters.padding]
	return array
}

function getPlotXBounds () {
	const array = [plotParameters.padding, plotCanvas.value.getBoundingClientRect().width - plotParameters.padding]
    return array
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
        return axis === 'x' ? plotVariables.xBounds[0] : plotVariables.yBounds[1]
    }

    const valueScaled = c.scaleLinear(value)

    let coordinate = 0
    if (axis === 'x') {
        coordinate = plotVariables.xBounds[1] - valueScaled * (plotVariables.xBounds[1] - plotVariables.xBounds[0])
    } else if (axis === 'y') {
        coordinate = plotVariables.yBounds[0] + valueScaled * (plotVariables.yBounds[1] - plotVariables.yBounds[0])
        // coordinate = valueScaled * (plotVariables.yBounds[1] - plotVariables.yBounds[0]) - plotVariables.yBounds[0]
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
        if (!dataStore.getCategoryWithName(selectedPlot.value.xAxisCategoryName).displayTitle) return false

    } else if (axis === 'y') {
        if (!selectedPlot.value.yAxisCategoryName) return false
        if (!dataStore.getCategoryWithName(selectedPlot.value.yAxisCategoryName).displayTitle) return false
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
}

</style>