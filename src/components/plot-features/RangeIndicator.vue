<template>
    <g v-if="category && !category.usesCategoricalData" :transform="`translate(200 200)`">
        <text class="title">{{category.displayTitle}}</text>
        <g v-if="category" :transform="`translate(0 ${tickMargin})`">
            <text 
            class="tick-ub"
            :x="barWidth + tickMargin">
                {{category.getTickString(category.ub)}}
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
                {{category.getTickString(category.lb)}}
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
// const {} = storeToRefs(scatterStore)
const dataStore = useDataStore()
const {data} = storeToRefs(dataStore)

const resolution = 30
const barWidth = 20
const barHeight = 4
const tickMargin = 8

const category = computed(() => {
    return scatterStore.getActiveColorCodeColumn()
})

const spectrumArray = computed(() => {
    console.log(category.value)
    if (!category) return []
    let linearScale = linspace(category.value.lb, category.value.ub, resolution)
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