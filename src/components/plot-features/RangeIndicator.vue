<template>
    <g v-if="column" class="range-indicator">
        <text 
            :style="{fontSize: `${optionsStore.titleSize}em`}"
            class="title"
        >
            {{ column }}
        </text>
        <g :transform="`translate(0 ${tickMargin})`">
            <text 
                class="tick-ub"
                :style="{fontSize: `${optionsStore.tickSize}em`}"
                :x="barWidth + tickMargin"
            >
                {{ parseFloat(colorCodeUpperBound).toFixed(4) }}
            </text>

            <rect
                v-for="(color, index) in spectrumArray" 
                :key="index" 
                :fill="color" 
                :y="barHeight*resolution - (index+1) * barHeight" 
                :width="barWidth" 
                :height="barHeight"
            />

            <text 
                class="text-lb"
                :style="{fontSize: `${optionsStore.tickSize}em`}"
                :x="barWidth + tickMargin" 
                :y="4*resolution"
            >
                {{ parseFloat(colorCodeLowerBound).toFixed(4) }}
            </text>
        </g>
    </g>
</template>

<script setup>
import {computed} from "vue"
import { storeToRefs } from "pinia"

import {linspace} from "@/utils/data-utils"
import {useOptionsStore} from "../../store/OptionsStore"
import {useDataStore} from "../../store/DataStore"

const optionsStore = useOptionsStore()
const {colorCodeUpperBound, colorCodeLowerBound} = storeToRefs(optionsStore)
const dataStore = useDataStore()
const {data} = storeToRefs(dataStore)

const resolution = 30
const barWidth = 20
const barHeight = 4
const tickMargin = 8

const column = computed(() => {
    return optionsStore.getActiveColorCodeColumn()
})

const spectrumArray = computed(() => {
    if (!column.value) return []
    
    let linearScale = linspace(colorCodeLowerBound.value, colorCodeUpperBound.value, resolution)
    let colorScale = []
    for (let value of linearScale) {
        colorScale.push(optionsStore.getSampleColorWithValue(value))
    }
    return colorScale
})


</script>

<style lang="scss" scoped>

.tick-ub {
    dominant-baseline: hanging;
}

.range-indicator {
    text {
        font-family: monospace;
    }
}

</style>