<template>
    <div class="container plot-tools-container">
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

        <EditCategoryForm />

        <div class="card mt-3">
            <div class="control-group p-2">
                <strong>Filters</strong>
                
                <div v-if="filters.length > 0">
                    <FilterElement v-for="filter in filters" :key="filter.id" :filter="filter"/>
                </div>
                <div v-else>
                    <span style="font-size: 0.8em;">No filters have been applied</span>
                </div>
                

            </div>
        </div>

        <div class="card mt-3">
            <OptionsForm />
        </div>

        <div class="card mt-3">
            <ExportForm />
        </div>
    </div>
</template>

<script setup>

import { reactive, ref, inject } from "vue"
import FilterElement from '@/components/plots/FilterElement'
import ExportForm from '@/components/forms/ExportForm'
import OptionsForm from '@/components/forms/OptionsForm'
import EditCategoryForm from '@/components/forms/EditCategoryForm'

const selectedCategory = ref(null)
const filters = reactive([])

// DOM references
const fileDelimiterSelect = ref(null)
const fileInput = ref(null)

// Listeners
const eventBus = inject('eventBus')
eventBus.on('PCPlot.selectCategory', (c) => selectedCategory.value = c)
eventBus.on('PCPlot.addFilter', (f) => {
    filters.push(f)
})
eventBus.on('PCPlot.deleteFilter', (f) => {
    let deleteIndex = -1
    for (let i = 0; i < filters.length; i++) {
        if (filters[i].id === f.id) {
            deleteIndex = i
            break
        }
    }
    filters.splice(deleteIndex, 1)
})

function readFile () {
    eventBus.emit('PlotTools.readFile', {file: fileInput.value.files[0], delimiter: fileDelimiterSelect.value.value})
}

</script>

<style lang="scss" scoped>
    .plot-tools-container {
        font-size: 0.8rem;
        overflow-y: auto;
    }
</style>