<template>
    <div class="component-container" ref="componentContainer">
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
                    <!-- x-axis group -->
                    <g>
                        <line :x1="plotVariables.xBounds[0]" :x2="plotVariables.xBounds[1]" 
                        :y1="plotVariables.yBounds[1]" :y2="plotVariables.yBounds[1]" />
                    </g>

                    <!-- y-axis group -->
                    <g>
                        <line :x1="plotVariables.xBounds[0]" :x2="plotVariables.xBounds[0]" 
                        :y1="plotVariables.yBounds[0]" :y2="plotVariables.yBounds[1]" />
                    </g>

                    <!-- data group -->
                    <g></g>
                </g>

            </svg>
        </div>

    </div>

</template>

<script setup>
import { ref, reactive, onMounted, inject } from "vue"
import * as d3 from "d3"

const componentContainer = ref(null)
const plotCanvas = ref(null)

const plotParameters = reactive({
    padding: 50,
    axisTitlePadding: 20,
})

const plotVariables = reactive({
    hasRendered: false,
    xBounds: [],
    yBounds: []
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
    console.log(array)
	return array
}

function getPlotXBounds () {
	const array = [plotParameters.padding, plotCanvas.value.getBoundingClientRect().width - plotParameters.padding]
	console.log(array)
    return array
}

function updateContainerSize () {
    plotVariables.xBounds = getPlotXBounds()
    plotVariables.yBounds = getPlotYBounds()
}

</script>

<style lang="scss" scoped>

.component-container {
	height: 100%;
	overflow: hidden;
    border: 2px solid red;
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
}

</style>