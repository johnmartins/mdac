<template>
    <g v-if="PCPStore.renderingType === 'vector'" stroke-width="1" fill="transparent" :transform="`translate(0 ${plotYBounds[0]})`">
        <g v-if="!optionsStore.hideExcluded">
            <path
                v-for="(d, index) in data.filter(dp => !dataStore.dataPointFilterCheck(dp))" 
                :key="index" 
                stroke="#bfbfbf"
                :stroke-opacity="optionsStore.excludedDataOpacity"
                :d="lineGenerator(d)"
            />
        </g>
        
        <path
            v-for="(d, index) in data.filter(dp => dataStore.dataPointFilterCheck(dp))" 
            :key="index" 
            :excluded="true"
            :stroke="getLineColor(d)"
            :stroke-opacity="optionsStore.includedDataOpacity"
            :d="lineGenerator(d)"
        />
    </g>
</template>

<script setup>
import { storeToRefs } from "pinia"
import * as d3 from "d3"

import {truncateDecimals} from "@/utils/data-utils"

// Stores
import {useDataStore} from "../../../store/DataStore"
import {usePCPStore} from "../../../store/PCPStore"
import {useOptionsStore} from "../../../store/OptionsStore"

// Store references
const dataStore = useDataStore()
const PCPStore = usePCPStore()
const optionsStore = useOptionsStore()

// Store refs
const {horizontalOffset, axisLength, plotYBounds} = storeToRefs(PCPStore)
const {data} = storeToRefs(dataStore)

function lineGenerator(d) {
    let dataCats = Object.keys(d)
    let dataArray = Array(dataCats.length).fill(null)

    for (let i = 0; i < dataCats.length; i++) {		
        let c = dataStore.getCategoryWithName(dataCats[i])

        // Ignore disabled categories
        if (!c || !c.enabled)  {
            continue
        }

        // Set data point coordinates
        const x = truncateDecimals(dataStore.getTrueCategoryPosition(c.title)*horizontalOffset.value, 1)			// This needs to be moved
        const y = truncateDecimals(c.scaleLinear(d[c.title])*axisLength.value, 1)

        // Build data array
        dataArray[c.position] = {
            x: x, 
            y: y
        }
    }

    dataArray = dataArray.filter((obj) => { return obj != null })

    let d3CurveType = d3.curveMonotoneX
    if (optionsStore.curveType === 'curve') {
        d3CurveType = d3.curveMonotoneX
    } else if (optionsStore.curveType === 'line') {
        d3CurveType = d3.curveLinear
    }
	
    return d3.line([])
        .x((de) => {return de.x})
        .y((de) => {return de.y})
        .curve(d3CurveType)
        (dataArray)
}

function getLineColor (d) {
    return optionsStore.getSampleColor(d)
}

</script>

<style lang="scss" scoped>

</style>