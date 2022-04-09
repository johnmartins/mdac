<template>
    <div class="component-container">
        <div class="svg-container">
            A scatter plot: 
            <svg
            height="100%" 
            width="100%" 
            tabindex="0"
            ref="plotCanvas"
            class="scatter-plot"
            >

                <!-- Full plot group -->
                <g>
                    <!-- x-axis group -->
                    <g>
                        <line x1=100 x2=500 y1=100 y2=100 />
                    </g>

                    <!-- y-axis group -->
                    <g>
                        <line x1=100 x2=100 y1=100 y2=500 />
                    </g>

                    <!-- data group -->
                    <g></g>
                </g>

            </svg>
        </div>

    </div>

</template>

<script setup>
import * as d3 from "d3"

</script>

<style lang="scss" scoped>

.component-container {
	height: 100%;
	overflow: hidden;
}

.svg-container {
    height: 100%;
}

.scatter-plot {
    line {
        stroke: black;
        fill: transparent;
    }
}

</style>