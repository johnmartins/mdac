<template>
    <g v-if="column">
        <text class="title">{{column}}</text>
        <g :transform="`translate(0 ${tickMargin})`">
            <text 
            class="tick-ub"
            :x="barWidth + tickMargin">
                {{parseFloat(colorCodeUpperBound).toFixed(4)}}
            </text>

            <rect v-for="(color, index) in spectrumArray" 
            :key="index" 
            :fill="color" 
            :y="barHeight*resolution - (index+1) * barHeight" 
            :width="barWidth" 
            :height="barHeight"/>

            <text 
            class="text-lb"
            :x="barWidth + tickMargin" 
            :y="4*resolution">
                {{parseFloat(colorCodeLowerBound).toFixed(4)}}
            </text>
        </g>
    </g>
</template>

<script setup>
import {computed} from "vue"
import { storeToRefs } from "pinia"

import {linspace} from "@/utils/data-utils"
import {useScatterStore} from "../../store/ScatterStore"
import {useDataStore} from "../../store/DataStore"

const scatterStore = useScatterStore()
const {colorCodeUpperBound, colorCodeLowerBound} = storeToRefs(scatterStore)
const dataStore = useDataStore()
const {data} = storeToRefs(dataStore)

const resolution = 30
const barWidth = 20
const barHeight = 4
const tickMargin = 8

const column = computed(() => {
    return scatterStore.getActiveColorCodeColumn()
})

const spectrumArray = computed(() => {
    if (!column.value) return []
    
    let linearScale = linspace(colorCodeLowerBound.value, colorCodeUpperBound.value, resolution)
    let colorScale = []
    for (let value of linearScale) {
        colorScale.push(scatterStore.getSampleColorWithValue(value))
    }
    return colorScale
})


</script>

<style lang="scss" scoped>

text {
    font-size: 0.9em;
}

.tick-ub {
    dominant-baseline: hanging;
}

</style>