<template>
    <SidebarSection
        title="Import data"
        :start-maximized="true"
    >
        <div class="control-group">
            <strong>Data source</strong>
            <input 
                id="formFileSm"
                ref="fileInput" 
                style="width: 100%;" 
                class="mb-2" 
                type="file"
                accept=".csv" 
                @change="readFile"
            >

            <div class="labeled-form">                
                <span>Delimiter:</span>
                <select id="formFileDelimiter" ref="fileDelimiterSelect" name="delimiter" @change="readFile">
                    <option value="auto" selected>Auto (default)</option>
                    <option value=",">Comma ","</option>
                    <option value=";">Semi-colon ";"</option>
                    <option value="\t">Tab "\t"</option>
                </select>
            </div>
        </div>
    </SidebarSection>
</template>

<script setup>
import { ref, inject } from "vue"
import { storeToRefs } from "pinia"
import * as d3 from "d3"

import {useStateStore} from "@/store/StateStore"
import {useDataStore} from "@/store/DataStore"
import {useScatterStore} from "@/store/ScatterStore"
import {usePCPStore} from "@/store/PCPStore"
import {useLayoutStore} from "@/store/LayoutStore"
import {useOptionsStore} from "@/store/OptionsStore"
import {isNumeric} from "@/utils/data-utils"

import SidebarSection from "@/components/layouts/SidebarSection.vue"

import Category from "@/models/plots/Category"
import Popup from '@/models/layout/Popup'

// DOM references
const fileDelimiterSelect = ref(null)
const fileInput = ref(null)

const scatterStore = useScatterStore()
const dataStore = useDataStore()
const stateStore = useStateStore()
const layoutStore = useLayoutStore()
const pcpStore = usePCPStore()
const optionsStore = useOptionsStore()
const {data} = storeToRefs(dataStore)

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
	
    throw new Error("Failed to identify delimitor automatically.")
}

function readFile () {
    // Read the CSV file
    const file = fileInput.value.files[0] 
    if (!file) return
    stateStore.setLoading('Parsing imported file..')
    // Reset existing data state (in case another file was previously loaded)
    scatterStore.resetDataSelection() // TODO: This should ideally be in the state store.
    optionsStore.resetColorCoding()
    dataStore.wipeAllData()
    const reader = new FileReader()
    reader.readAsText(new Blob([file], {"type": file.type}))	
    reader.onloadend = (res) => {
        parseCSV(res)
        stateStore.clearLoading()
    } 
}

function _parseNumericValue (value, col, minValMap, maxValMap) {
    // Numeric data
    value = parseFloat(value)

    // Set initial min/max values (if it has not yet been set)
    if (isNaN(maxValMap.get(col))) maxValMap.set(col, value)
    if (isNaN(minValMap.get(col))) minValMap.set(col, value)

    // Update min/max values if necessary
    if (maxValMap.get(col) < value) maxValMap.set(col, value)
    else if (minValMap.get(col) > value) minValMap.set(col, value)
}

function _parseStringValue (value, col, categoricalDataMap) {
    if (!categoricalDataMap.get(col)) {
        categoricalDataMap.set(col, new Set())
    }
    categoricalDataMap.get(col).add(value)
}

function parseCSV (fileReaderRes) {
    // Parse form data
    let delimiter = fileDelimiterSelect.value.value
    if (delimiter === "\\t") delimiter = "\t";

    // If auto delimit detection, parse and return likely delimiter
    if (delimiter === "auto") delimiter = detectDelimiter(fileReaderRes.target.result)

    // Parse CSV based on selected delimiter
    const dataFormat = d3.dsvFormat(delimiter)
    let csvData = dataFormat.parse(fileReaderRes.target.result)

    // Allocate variables for CSV data parsing
    const dataToPlot = []
    const maxValMap = new Map()	// Maps column name to maximum value in that column
    const minValMap = new Map()	// Maps column name to minimum value in that column
    const categoricalDataMap = new Map()	// Maps column name to a set of all possible categories in that column (categorical data)

    const numericalColumnsSet = new Set()
    const categoricalColumnsSet = new Set()

    // Loop through rows and columns in CSV and handle the data
    for (let i = 0; i < csvData.length; i++) {
        let row = csvData[i]
        let dataPoint = {}
        for (let col of csvData.columns) {
            let value = row[col]

            if (value === "") {
                continue
            } else if (!isNumeric(value) && !numericalColumnsSet.has(col)) {
                _parseStringValue(value, col, categoricalDataMap)
                categoricalColumnsSet.add(col)

            } else if (isNumeric(value) && !categoricalColumnsSet.has(col)) {
                _parseNumericValue(value, col, minValMap, maxValMap)
                numericalColumnsSet.add(col)

            } else {
                // If the data makes no sense then skip it to avoid problems downstream.
                console.warn(`Ignored data in col = "${col}", with value = "${value}". Ambiguous column type (numeric or categoric?).`)
                continue
            }

            // Update data point with value from currently parsed column
            dataPoint[col] = value
        }

        dataPoint[dataStore.idCol] = i
        dataToPlot.push(dataPoint)
    }
	
    // Loop through columns and create Categories used by the plots
    const maxUniqueCategoryValues = 50 // if this value is exceeded, then the category is disabled by default to prevent waste of computational resources.
    for (let col of csvData.columns) {
        if (numericalColumnsSet.has(col)) {
            dataStore.addCategory(new Category(col, minValMap.get(col), maxValMap.get(col)))
        } else if (categoricalColumnsSet.has(col)) {
            const categoricalDataCol = new Category(col, 0, 1, {
                ticks: categoricalDataMap.get(col).length, 
                usesCategoricalData: true,
                availableCategoricalValues: Array.from(categoricalDataMap.get(col))})

            // If the number of unique categories exceed the default max limit, then the category is disabled.
            // This is done to prevent wasting computational resources when the user accidentally imports large sets of unique categorical data.
            if (categoricalDataCol.availableCategoricalValues.length > maxUniqueCategoryValues) {
                // Disable category
                categoricalDataCol.enabled =  false
                // Warn the user
                const warningPopup = new Popup('warning', 
                    `Disabled column: ${categoricalDataCol.displayTitle}`,
                    `Column with title "${categoricalDataCol.displayTitle}" has been disabled. This is because it contained a large set of unique categorical data, which costs a lot of computational resources to render. 
					\nIf you want to visualize this data anyway, you can enable it in the "data settings" view.`)
                layoutStore.queuePopup(warningPopup)
            }
			
            dataStore.addCategory(categoricalDataCol)
        } else {
            // What's this? Ah.. it is probably not important. Let's launch it into space
            console.warn(`Ignored column ${col}. Unknown column type (numeric or categoric?).`)
            continue
        }
		
    }
	
    // Update the PCP to use an appropriate resolution
    pcpStore.detectAppropriateGraphicsSettings(csvData.length) 

    // Commit the extracted data to the data store. This triggers the visualization.
    setTimeout(() => {
        dataStore.setData(dataToPlot)
        eventBus.emit('SourceForm.readData', data.value)
    }, 200)
	
} 

</script>

<style lang="scss" scoped>

</style>
