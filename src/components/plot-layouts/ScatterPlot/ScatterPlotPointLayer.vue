<template>
    <!-- Excluded data (through user applied filters) -->
    <g>
        <g style="fill: black; opacity: 0.4;" class="scatter-point">
            <circle 
            v-for="(d, index) in data.filter(de => !dataStore.dataPointFilterCheck(de))" :key="index" 
            :cx="getScaledCoordinate(d, selectedPlot.xAxisCategoryName, 'x')"
            :cy="getScaledCoordinate(d, selectedPlot.yAxisCategoryName, 'y')" 
            r="3" 
            @click.self="onClick($event, d, index)"
            />
        </g>
        <!-- Included data -->
        <g style="fill: blue;" class="scatter-point">
            <circle 
            v-for="(d, index) in data.filter(dataStore.dataPointFilterCheck)" :key="index"
            :cx="getScaledCoordinate(d, selectedPlot.xAxisCategoryName, 'x')"
            :cy="getScaledCoordinate(d, selectedPlot.yAxisCategoryName, 'y')" 
            r="3" 
            @click.self="onClick($event, d, index)"
            />
        </g>
    </g>
</template>

<script setup>
import { storeToRefs } from "pinia"

import {truncateDecimals} from "@/utils/data-utils"

import {useDataStore} from "@/store/DataStore"
import {useScatterStore} from "@/store/ScatterStore"

const dataStore = useDataStore()
const scatterStore = useScatterStore()

const {data} = storeToRefs(dataStore)
const {selectedPlot} = storeToRefs(scatterStore)

function onClick (evt, d, index) {

    scatterStore.selectedDataIndex = index

    console.log(index)
    console.log(evt)
    console.log(d)
}

function getScaledCoordinate (dataPoint, categoryName, axis) {
    const c = dataStore.getCategoryWithName(categoryName)
    const value = dataPoint[categoryName]

    if (!value) {
        if (axis !== 'x' && axis !== 'y') {
            throw new Error('Unknown axis setting')
        }
        return axis === 'x' ? 0 : scatterStore.yAxisLength
    }

    const valueScaled = c.scaleLinear(value)

    let coordinate = 0
    if (axis === 'x') {
        coordinate = scatterStore.xAxisLength - valueScaled * (scatterStore.plotXBounds[1] - scatterStore.plotXBounds[0])
    } else if (axis === 'y') {
        coordinate = valueScaled * (scatterStore.plotYBounds[1] - scatterStore.plotYBounds[0])
    } else {
        throw new Error('Unknown axis setting')
    }

    if (isNaN(coordinate)) return 0

    return truncateDecimals(coordinate,2)
}


</script>

<style lang="scss" scoped>

    .scatter-point {
        cursor: pointer;
    }

</style>