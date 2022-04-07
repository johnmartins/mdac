<template>
    <div class="card mt-3">
        <div class="control-group p-2">
            <strong>Export</strong>
            <div class="labeled-form">
                <span>Format: </span>
                <select ref="formatSelector">
                    <option value="png">Image (PNG)</option>
                    <option value="svg">Vector (SVG)</option>
                </select>
            </div>
            <div class="d-grid gap-2 mt-2">
                <button class="btn btn-sm btn-primary" @click="exportRequest">Download</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, inject } from "vue"

// DOM references
const downloadButton = ref(null)
const formatSelector = ref(null)

const eventBus = inject('eventBus')

function exportRequest(evt) {
    eventBus.emit('ExportForm.exportRequest', formatSelector.value.value)
}

</script>

<style style="scss" scoped>
    
</style>