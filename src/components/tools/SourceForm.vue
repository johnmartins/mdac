<template>
    <div class="card mt-3">
        <div class="control-group p-2">
            <strong>Data source</strong>
            <input class="form-control form-control-sm mb-2" id="formFileSm" type="file" ref="fileInput" @change="readFile">

            <div class="labeled-form">                
                <span>Delimiter:</span>
                <select name="delimiter" id="formFileDelimiter" ref="fileDelimiterSelect" @change="readFile">
                    <option value="," selected>Comma ","</option>
                    <option value=";">Semi-colon ";"</option>
                    <option value="\t">Tab "\t"</option>
                </select>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, inject } from "vue"
import { storeToRefs } from "pinia"
import * as d3 from "d3"

import {useDataStore} from "@/store/DataStore"

import Category from "@/models/plots/Category"

// DOM references
const fileDelimiterSelect = ref(null)
const fileInput = ref(null)

const dataStore = useDataStore()
const {data, filters, categories} = storeToRefs(dataStore)

// Listeners
const eventBus = inject('eventBus')

function readFile () {
    const file = fileInput.value.files[0] 
    const delimiter = fileDelimiterSelect.value.value
    
	if (delimiter === "\\t") delimiter = "\t";
	dataStore.wipeAllData()

	// Read the CSV file
	const reader = new FileReader()
	reader.readAsText(new Blob([file], {"type": file.type}))	
	reader.onloadend = (e) => {
		const dataFormat = d3.dsvFormat(delimiter)
		let csvData = dataFormat.parse(e.target.result)

		const dataToPlot = []

		let maxValMap = new Map()
		let minValMap = new Map()

		for (let row of csvData) {
			let dataPoint = {}
			for (let col of csvData.columns) {
				let value = row[col]

				if (isNaN(parseFloat(value))) {
					// Not numeric
					continue
				} else {
					// Numeric
					value = parseFloat(value)

					if (isNaN(maxValMap.get(col))) maxValMap.set(col, value)
					if (isNaN(minValMap.get(col))) minValMap.set(col, value)

					if (maxValMap.get(col) < value) maxValMap.set(col, value)
					else if (minValMap.get(col) > value) minValMap.set(col, value)
				}

				dataPoint[col] = value
			}
			dataToPlot.push(dataPoint)
		}

		for (let col of csvData.columns) {
			dataStore.addCategory(new Category(col, minValMap.get(col), maxValMap.get(col)))
		}

		dataStore.setData(dataToPlot)
		eventBus.emit('SourceForm.readData', data.value)
	}
}

</script>

<style>

</style>