<template>
    <div class="card mt-3">
        <div class="control-group p-2">
            <strong>Plot export</strong>
            <div class="labeled-form">
                <span>Format: </span>
                <select ref="formatSelector">
                    <option value="png">Image (PNG)</option>
                    <option value="svg">Vector graphics (SVG)</option>
                </select>
            </div>
            <div class="d-grid gap-2 mt-2">
                <button class="btn btn-sm btn-primary" @click="exportRequest">Download</button>
            </div>
        </div>
        <div class="control-group p-2">
            <strong>Data export</strong>
            <div style="display: flex; justify-content: space-between; flex-direction: row;">
                <!-- Checkbox filtered data -->
                <span for="">Include filtered data</span>
                <input ref="filteredDataCheckbox" v-model="includeFilteredData" type="checkbox">
            </div>
            <div class="d-grid gap-2 mt-2">
                <button class="btn btn-sm btn-primary" @click="exportDataRequest">Download CSV</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, inject } from "vue"

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

function exportDataRequest (evt) {
    // Fetch data
    console.log(dataStore.data)

    // Parse and convert to CSV


}

</script>

<style style="scss" scoped>
    
</style>