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
            />
        </g>
    </g>
</template>

<script setup>
import * as d3 from "d3"
import { storeToRefs } from "pinia"

import {truncateDecimals} from "@/utils/data-utils"
import {euclideanDistance} from "@/sadse/similarity"

import {useDataStore} from "@/store/DataStore"
import {useScatterStore} from "@/store/ScatterStore"

const dataStore = useDataStore()
const scatterStore = useScatterStore()

const {data} = storeToRefs(dataStore)
const {selectedPlot, selectedDataPoint, useSimilarityColorCoding, overrideColorCodeColumn, overrideColorCodeFunction, colorCodeUpperBound, colorCodeLowerBound} = storeToRefs(scatterStore)

function setupSimilarityColorScale () {
    if (!useSimilarityColorCoding.value) return
    if (dataStore.inputColumns.length === 0) {
        console.warn('Input cols definition is empty')
        return
    }

    const inputCols = dataStore.inputColumns
    const v = dataStore.getArrayFromDataPoint(selectedDataPoint.value, inputCols, {normalize: true})

    let minDistance = 1
    let maxDistance = 0

    for (let d of data.value) {
        const w = dataStore.getArrayFromDataPoint(d, inputCols, {normalize: true})
        const ed = euclideanDistance(v, w, true)
        d['$SIMILARITY$'] = ed

        minDistance = ed < minDistance ? ed : minDistance
        maxDistance = ed > maxDistance ? ed : maxDistance
    }

    colorCodeUpperBound.value = maxDistance
    colorCodeLowerBound.value = minDistance
    overrideColorCodeColumn.value = '$SIMILARITY$'
    overrideColorCodeFunction.value = d3.scaleSequential()
        .domain([minDistance, maxDistance])
        .interpolator(d3.interpolateRgbBasis(["blue", "green", "yellow", "red"]))

}

/**
 * Triggered when the user clicks on a data point in the scatter plot.
 * @param evt click event
 * @param d data point
 * @ignoreCtrl ignore if the user pressed CTRL-key during click
 */
function onClick (evt, d, ignoreCtrl=false) {
    if (evt.ctrlKey && ignoreCtrl === false) return onCtrlClick(evt, d)

    const ID = d[dataStore.idCol]

    scatterStore.selectedDataID = ID
    scatterStore.selectedDataPoint = d

    setupSimilarityColorScale()
}

/**
 * This method enables the user to make a secondary selection, 
 * used for comparing two data points.
 * @param evt click event
 * @param d data point
 */
function onCtrlClick (evt, d) {
    // If there is no primary selection, then make this a "regular click"
    if (!scatterStore.selectedDataPoint) {
        return onClick(evt, d, true)
    }
    
    const ID = d[dataStore.idCol]

    scatterStore.selectedSecondaryDataID = ID
    scatterStore.selectedSecondaryDataPoint = d
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