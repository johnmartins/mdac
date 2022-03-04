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
        <div class="card mt-3" v-if="selectedCategoryChanged">
            <div class="control-group p-2">
                <strong>Selected category</strong>

                <TextInput :value="selectedCategory.title.toString()">Title</TextInput>
                <TextInput :value="selectedCategory.lb" @change="(v) => {selectedCategoryChanged.lb=parseFloat(v)}">LB</TextInput>
                <TextInput :value="selectedCategory.ub" @change="(v) => {selectedCategoryChanged.ub=parseFloat(v)}">UB</TextInput>
                <TextInput :value="selectedCategory.position" @change="(v) => {selectedCategoryChanged.position=parseInt(v)}">Position</TextInput>
                <TextInput :value="selectedCategory.ticks" @change="(v) => {selectedCategoryChanged.ticks=parseInt(v)}">Ticks</TextInput>

            </div>
            <div class="btn-group px-2 mb-2">
                <button class="btn btn-success btn-sm" @click="editCategory">Update</button>
                <button class="btn btn-warning btn-sm" @click="resetCategory">Reset</button>
                <button class="btn btn-danger btn-sm" @click="deleteCategory">Delete</button>
            </div>

        </div>

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
            <div class="control-group p-2">
                <strong>Options</strong>
                <RangeInput :value="0.8" @change="setDataOpacity">Data opacity</RangeInput>
                <RangeInput :value="0.05" @change="setFilteredDataOpacity">Filtered data opacity</RangeInput>
            </div>
        </div>


    </div>
</template>

<script setup>

import { reactive, ref, onMounted, onUpdated, inject } from "vue"
import TextInput from '@/components/inputs/TextInput.vue'
import RangeInput from '@/components/inputs/RangeInput.vue'
import FilterElement from '@/components/plots/FilterElement'
import Category from '@/models/plots/Category'

const selectedCategory = ref(null)
const selectedCategoryChanged = ref(null)
const filters = reactive([])

// DOM references
const fileDelimiterSelect = ref(null)
const fileInput = ref(null)

// Listeners
const eventBus = inject('eventBus')
eventBus.on('PCPlot.selectCategory', (c) => {
    if (!c) {
         selectedCategory.value = null
         selectedCategoryChanged.value = null
         return
    }

    selectedCategory.value = c
    selectedCategoryChanged.value = new Category(
        c.title, c.lb, c.ub, c.position, c.ticks)
})
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

function deleteCategory () {
    eventBus.emit('PlotTools.deleteCategory', selectedCategory.value)
}

function editCategory () {
    eventBus.emit('PlotTools.editCategory', [selectedCategory.value, selectedCategoryChanged.value])
}

function resetCategory () {
    const resetCat = selectedCategory.value;
    selectedCategory.value = null

    setTimeout(() => {selectedCategory.value = resetCat}, 100)   
}

function setDataOpacity (value) {
    eventBus.emit('PlotTools.setDataOpacity', value)
}

function setFilteredDataOpacity (value) {
    eventBus.emit('PlotTools.setFilteredDataOpacity', value)
}

</script>

<style lang="scss" scoped>
    .plot-tools-container {
        font-size: 0.8rem;
        overflow-y: auto;

        .control-group {
            text-align: left;
            input {
                font-size: 0.8rem;
            }
        }

        .labeled-form {
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;
            align-items: center;
            span {
                font-size: 0.8rem;
                margin-right: 8px;
            }
            select {
                width: 100%;
            }
        }
    }
</style>