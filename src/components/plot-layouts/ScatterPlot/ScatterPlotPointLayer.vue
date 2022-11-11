<template>
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
</template>

<script setup>
import { storeToRefs } from "pinia"

import {useDataStore} from "@/store/DataStore"
import {useScatterStore} from "@/store/ScatterStore"

const dataStore = useDataStore()
const scatterStore = useScatterStore()

const {data, filters, categories} = storeToRefs(dataStore)
const {selectedPlot} = storeToRefs(scatterStore)

function getScaledCoordinate (data, categoryName, axis) {
    if (axis === 'x') {
        console.log('get coordinate')
    }

    const c = dataStore.getCategoryWithName(categoryName)
    const value = data[categoryName]

    if (!value) {
        if (axis !== 'x' && axis !== 'y') {
            throw new Error('Unknown axis setting')
        }
        return axis === 'x' ? 0 : scatterStore.getYAxisLength
    }

    const valueScaled = c.scaleLinear(value)

    let coordinate = 0
    if (axis === 'x') {
        coordinate = scatterStore.getXAxisLength - valueScaled * (scatterStore.plotXBounds[1] - scatterStore.plotXBounds[0])
    } else if (axis === 'y') {
        coordinate = valueScaled * (scatterStore.plotYBounds[1] - scatterStore.plotYBounds[0])
    } else {
        throw new Error('Unknown axis setting')
    }

    if (isNaN(coordinate)) return 0

    return coordinate
}


</script>

<style lang="scss" scoped>

</style>