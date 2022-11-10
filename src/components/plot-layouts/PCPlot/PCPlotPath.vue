<template>


    <path
    v-if="!optionsStore.hideExcluded && !dataStore.dataPointFilterCheck(props.data)"
    stroke="#bfbfbf"
    :stroke-opacity="optionsStore.excludedDataOpacity"
    :d="lineGenerator(props.data)"
    />
        
    <path 
    v-else-if="dataStore.dataPointFilterCheck(props.data)"
    :stroke='getLineColor(props.data)'
    :stroke-opacity="optionsStore.includedDataOpacity"
    :d="lineGenerator(props.data)"
    />


</template>

<script setup>
import { reactive, ref, onMounted, onUpdated, inject, computed, watch} from "vue"
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
const stateStore = useStateStore()

// Store refs
const {horizontalOffset, axisLength, colorScaleCategory, colorScaleFunction} = storeToRefs(PCPStore)

const props = defineProps({
    data: Object   
})

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