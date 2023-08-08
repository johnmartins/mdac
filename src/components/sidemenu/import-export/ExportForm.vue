<template>
    <SidebarSection 
        title="Export" 
        :start-maximized="false"
    >
        <div class="control-group">
            <strong>Plot export</strong>
            <div class="labeled-form">
                <span>Format: </span>
                <select ref="formatSelector">
                    <option value="png">Image (PNG)</option>
                    <option value="svg">Vector graphics (SVG)</option>
                </select>
            </div>
            <div class="d-grid gap-2 mt-2">
                <button @click="exportRequest">Download</button>
            </div>
        </div>
        <div class="control-group">
            <strong>Data export</strong>
            <div style="display: flex; justify-content: space-between; flex-direction: row;">
                <!-- Checkbox filtered data -->
                <span for="">Include filtered data</span>
                <input ref="filteredDataCheckbox" v-model="includeFilteredData" type="checkbox">
            </div>
            <div class="d-grid gap-2 mt-2">
                <button @click="exportDataRequest(includeFilteredData)">Download CSV</button>
            </div>
        </div>
    </SidebarSection>
</template>

<script setup>
import { ref, inject } from "vue"

import SidebarSection from "@/components/layouts/SidebarSection.vue"

import { useDataStore } from "@/store/DataStore"

const dataStore = useDataStore()

// DOM references
const filteredDataCheckbox = ref(null)
const formatSelector = ref(null)

// State
const includeFilteredData = ref(false)

const eventBus = inject('eventBus')

function exportRequest (evt) {
    eventBus.emit('ExportForm.exportFigureRequest', formatSelector.value.value)
}

function exportDataRequest (includeFiltered) {
    // Get data
    let data = []
    if (includeFiltered) {
        data = dataStore.data
    } else {
        data = dataStore.data.filter(dataStore.dataPointFilterCheck)
    }

    // Parse and convert to CSV
    let csvRowArray = []

    // Add header
    let headerStrArray = []
    for (let c of dataStore.categories) {
        headerStrArray.push(c.displayTitle)
    }
    csvRowArray.push(headerStrArray.join(";"))

    // Add data
    for (let d of data) {
        let valueStrArray = []

        for (let c of dataStore.categories) {   // TODO: This is slow
            let valueStr = ""
            let value = d[c.title]

            if (!value) { 
                valueStrArray.push(valueStr) 
                continue
            }
            if (c.usesCategoricalData) {
                valueStrArray.push("\"" + String(value) + "\"")
                continue
            }

            valueStrArray.push(value)
        }

        csvRowArray.push(valueStrArray.join(";"))
    }

    const csvStr = csvRowArray.join("\n")
    
    // Download csvStr as csv-file
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob);
    a.download = 'mdac-data.json';
    a.click();
}

</script>

<style style="scss" scoped>
    
</style>