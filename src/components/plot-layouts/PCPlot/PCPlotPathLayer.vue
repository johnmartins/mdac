<template>

    <g stroke-width="1" fill="transparent" :transform="`translate(0 50)`"> <!-- <g stroke-width="1" fill="transparent" :transform="`translate(0 ${getPlotYBounds()[0]})`"> -->
        <g v-if="!optionsStore.hideExcluded">
            <path v-for="(d, index) in data.filter(dp => !dataStore.dataPointFilterCheck(dp))" 
                :key="index" 
                stroke="#bfbfbf"
                :stroke-opacity="optionsStore.excludedDataOpacity"
                :d="lineGenerator(d)"
            />
        </g>
        
        <path v-for="(d, index) in data.filter(dp => dataStore.dataPointFilterCheck(dp))" 
            :key="index" 
            :excluded="true"
            :stroke='getLineColor(d)'
            :stroke-opacity="optionsStore.includedDataOpacity"
            :d="lineGenerator(d)"
        />
    </g>

</template>

<script setup>
import { storeToRefs } from "pinia"
import * as d3 from "d3"

import dataUtils from "@/utils/data-utils"

// Stores
import {useDataStore} from "../../../store/DataStore"
import {usePCPStore} from "../../../store/PCPStore"
import {useOptionsStore} from "../../../store/OptionsStore"
import {useStateStore} from "../../../store/StateStore"

// Store references
const dataStore = useDataStore()
const PCPStore = usePCPStore()
const optionsStore = useOptionsStore()

// Store refs
const {horizontalOffset, axisLength, colorScaleCategory, colorScaleFunction} = storeToRefs(PCPStore)
const {data} = storeToRefs(dataStore)

function lineGenerator(d) {
	let dataCats = Object.keys(d)
	let dataArray = Array(dataCats.length).fill(null)

	for (let i = 0; i < dataCats.length; i++) {
		let c = dataStore.getCategoryWithName(dataCats[i])

		if (!c)  {
			continue
		}
		const x = dataUtils.mercilessDecimalDeleter(c.position*horizontalOffset.value, 1)
		const y = dataUtils.mercilessDecimalDeleter(c.scaleLinear(d[c.title])*axisLength.value, 1)

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

function getLineColor (dataPoint) {
	if (!colorScaleCategory.value) return "black"
	if (dataPoint[colorScaleCategory.value] === null || dataPoint[colorScaleCategory.value] === undefined) return "black"
	return colorScaleFunction.value(dataPoint[colorScaleCategory.value])
}

</script>

<style lang="scss" scoped>

</style>