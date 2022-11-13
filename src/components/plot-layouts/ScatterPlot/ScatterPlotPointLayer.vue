<template>
    <!-- Excluded data (through user applied filters) -->
    <g>
        <g style="fill: black; opacity: 0.3;" class="scatter-point">
            <circle 
            v-for="(d, index) in data.filter(de => !dataStore.dataPointFilterCheck(de))" :key="index" 
            :cx="getScaledCoordinate(d, selectedPlot.xAxisCategoryName, 'x')"
            :cy="getScaledCoordinate(d, selectedPlot.yAxisCategoryName, 'y')" 
            :fill="getFill(d)"
            :stroke="getStroke(d)"
            :r="getRadius(d)" 
            @click.self="onClick($event, d)"
            />
        </g>
        <!-- Included data -->
        <g style="fill: black;" class="scatter-point">
            <circle 
            v-for="(d, index) in data.filter(dataStore.dataPointFilterCheck)" :key="index"
            :cx="getScaledCoordinate(d, selectedPlot.xAxisCategoryName, 'x')"
            :cy="getScaledCoordinate(d, selectedPlot.yAxisCategoryName, 'y')" 
            :r="getRadius(d)" 
            :fill="getFill(d)"
            :stroke="getStroke(d)"
            @click.self="onClick($event, d)"
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

function onClick (evt, d) {
    console.log(evt)

    const ID = d[dataStore.idCol]
    console.log(`$ID$ = ${ID}`)

    scatterStore.selectedDataID = ID
    scatterStore.selectedDataPoint = d

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

function getFill (d) {
    const ID = d[dataStore.idCol]
    if (ID !== scatterStore.selectedDataID) return;

    return 'whitesmoke'
}

function getStroke (d) {
    const ID = d[dataStore.idCol]
    if (ID !== scatterStore.selectedDataID) return null;

    return 'black'
}

function getRadius (d) {
    const ID = d[dataStore.idCol]
    if (ID !== scatterStore.selectedDataID) return 4
    return 6
}


</script>

<style lang="scss" scoped>

    .scatter-point {
        cursor: pointer;
    }

</style>