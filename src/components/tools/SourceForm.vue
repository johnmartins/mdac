<template>
    <div class="card mt-3">
        <div class="control-group p-2">
            <strong>Data source</strong>
			<input 
			style="width: 100%;"
			class="mb-2" 
			id="formFileSm" 
			type="file" 
			accept=".csv"
			ref="fileInput" 
			@change="readFile">

            <div class="labeled-form">                
                <span>Delimiter:</span>
                <select name="delimiter" id="formFileDelimiter" ref="fileDelimiterSelect" @change="readFile">
                    <option value="auto" selected>Auto (default)</option>
					<option value=",">Comma ","</option>
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

function detectDelimiter (data) {
	const rows = data.split('\n')
	const defaultSearchLength = 10
	const searchLength = rows.length < defaultSearchLength ? rows.length : defaultSearchLength

	const getMatches = function (row, re) {
		let matchArray = row.match(re)
		if (!matchArray) return 0
		return matchArray.length
	}

	let [commas, tabs, semicolons] = [0, 0, 0]

	for (let i = 0; i < searchLength; i++) {
		let row = rows[i]
		commas += getMatches(row, /,/g)
		tabs += getMatches(row, /\t/g)
		semicolons += getMatches(row, /;/g)
	}

	// Find most recurring delimiter and return it
	let mostRecurring = Math.max(commas, tabs, semicolons)
	if (mostRecurring === commas) return ","
	if (mostRecurring === tabs) return "\t"
	if (mostRecurring === semicolons) return ";"
	
	console.error("Failed to identify delimitor. Defaulting to comma.")
	return ","
}

function readFile () {
	// Parse form data
    const file = fileInput.value.files[0] 
    let delimiter = fileDelimiterSelect.value.value
	if (delimiter === "\\t") delimiter = "\t";
	// Reset existing data state (in case another file was previously loaded)
	dataStore.wipeAllData()
	// Read the CSV file
	const reader = new FileReader()
	reader.readAsText(new Blob([file], {"type": file.type}))	
	reader.onloadend = (e) => {
		// If auto delimit detection, parse and return likely delimiter
		if (delimiter === "auto") delimiter = detectDelimiter(e.target.result)
		// Parse CSV based on selected delimiter
		const dataFormat = d3.dsvFormat(delimiter)
		let csvData = dataFormat.parse(e.target.result)
		// Allocate variables for CSV data parsing
		const dataToPlot = []
		let maxValMap = new Map()
		let minValMap = new Map()
		// Loop through rows and columns in CSV and handle the data
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
					// Set initial min/max values (if it has not yet been set)
					if (isNaN(maxValMap.get(col))) maxValMap.set(col, value)
					if (isNaN(minValMap.get(col))) minValMap.set(col, value)
					// Update min/max values if necessary
					if (maxValMap.get(col) < value) maxValMap.set(col, value)
					else if (minValMap.get(col) > value) minValMap.set(col, value)
				}
				// Update data point with value from currently parsed column
				dataPoint[col] = value
			}
			dataToPlot.push(dataPoint)
		}
		// Loop through columns and create Categories used by the plots
		for (let col of csvData.columns) {
			dataStore.addCategory(new Category(col, minValMap.get(col), maxValMap.get(col)))
		}
		// Commit the extracted data to the data store. This triggers the visualization.
		dataStore.setData(dataToPlot)
		eventBus.emit('SourceForm.readData', data.value)
	}
}

</script>

<style lang="scss" scoped>

</style>
