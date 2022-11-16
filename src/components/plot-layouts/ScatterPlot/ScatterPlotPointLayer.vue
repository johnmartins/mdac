<template>
    <!-- Excluded data (through user applied filters) -->
    <g>
        <g class="scatter-point">
            <circle 
            v-for="(d, index) in data.filter(de => !dataStore.dataPointFilterCheck(de))" :key="index" 
            :cx="getScaledCoordinate(d, selectedPlot.xAxisCategoryName, 'x')"
            :cy="getScaledCoordinate(d, selectedPlot.yAxisCategoryName, 'y')" 
            :fill="getFill(d)"
            :stroke="getStroke(d)"
            :r="getRadius(d)" 
            :opacity="getOpacity(d)"
            @click.self="onClick($event, d)"
            @click.shift.self="onShiftClick($event, d)"
            />
        </g>
        <!-- Included data -->
        <g class="scatter-point">
            <circle 
            v-for="(d, index) in data.filter(dataStore.dataPointFilterCheck)" :key="index"
            :cx="getScaledCoordinate(d, selectedPlot.xAxisCategoryName, 'x')"
            :cy="getScaledCoordinate(d, selectedPlot.yAxisCategoryName, 'y')" 
            :r="getRadius(d)" 
            :fill="getFill(d)"
            :stroke="getStroke(d)"
            @click.self="onClick($event, d)"
            @click.shift.self="onShiftClick($event, d)"
            />
        </g>
    </g>
</template>

<script setup>
import * as d3 from "d3"
import { storeToRefs } from "pinia"

import {truncateDecimals, getArrayFromDataPoint} from "@/utils/data-utils"
import {euclideanDistance} from "@/sadse/similarity"

import {useDataStore} from "@/store/DataStore"
import {useScatterStore} from "@/store/ScatterStore"

const dataStore = useDataStore()
const scatterStore = useScatterStore()

const {data} = storeToRefs(dataStore)
const {selectedPlot, selectedDataPoint, useSimilarityColorCoding, overrideColorCodeColumn, overrideColorCodeFunction} = storeToRefs(scatterStore)

function setupSimilarityColorScale () {
    if (!useSimilarityColorCoding.value) return

    const inputCols = ['VANE_TOTAL_COUNT', 'VANE_LEAN', 'T_VANE_REG', 'T_VANE_MNT', 'T_HUB_REG', 'T_HUB_MNT', 'T_OUTER_REG', 'T_OUTER_MNT']
    const filteredData = data.value.filter((d) => d['FIDELITY'] == 'SIMULATED')

    const v = getArrayFromDataPoint(selectedDataPoint.value, inputCols)

    let minDistance = 1
    let maxDistance = 0

    for (let d of filteredData) {
        const w = getArrayFromDataPoint(d, inputCols)
        const ed = euclideanDistance(v, w, true)
        d['$SIMILARITY$'] = ed

        minDistance = ed < minDistance ? ed : minDistance
        maxDistance = ed > maxDistance ? ed : maxDistance
    }

    overrideColorCodeColumn.value = '$SIMILARITY$'
    overrideColorCodeFunction.value = d3.scaleSequential()
        .domain([minDistance, maxDistance])
        .interpolator(d3.interpolateRgbBasis(["blue", "green", "yellow", "red"]))

}

function onClick (evt, d) {
    if (evt.ctrlKey) return onCtrlClick(evt, d)

    const ID = d[dataStore.idCol]
    console.log(`$ID$ = ${ID}`)

    scatterStore.selectedDataID = ID
    scatterStore.selectedDataPoint = d

    setupSimilarityColorScale()
}

function onCtrlClick (evt, d) {
    console.log("CTRL click")
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
    if (ID === scatterStore.selectedDataID) return 'white'

    return scatterStore.getSampleColor(d)
}

function getStroke (d) {
    const ID = d[dataStore.idCol]
    if (ID === scatterStore.selectedDataID) return 'black';

    return null
}

function getRadius (d) {
    const ID = d[dataStore.idCol]
    if (ID !== scatterStore.selectedDataID) return 5
    return 7
}

function getColor (d) {
	return scatterStore.getSampleColor(d)
}

function getOpacity (d) {
    const ID = d[dataStore.idCol]
    if (ID !== scatterStore.selectedDataID) return 0.1
    return 1
}


</script>

<style lang="scss" scoped>

    .scatter-point {
        cursor: pointer;
        fill: white;
        stroke: black;
    }

</style>