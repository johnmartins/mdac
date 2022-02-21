<template>
    <div class="container plot-tools-container">
        <div class="card mt-3">
            <div class="control-group p-2">
                <strong>Data source</strong>
                <input class="form-control form-control-sm" id="formFileSm" type="file" @change="readFile">
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
            <div class="btn-group">
                <button class="btn btn-success btn-sm" @click="editCategory">Update</button>
                <button class="btn btn-warning btn-sm" @click="resetCategory">Reset</button>
                <button class="btn btn-danger btn-sm" @click="deleteCategory">Delete</button>
            </div>

            <div class="control-group p-2">
                <strong>Add filter</strong>
            </div>

        </div>

        <div class="card mt-3">
            <div class="control-group p-2">
                <strong>Filters</strong>

            </div>
        </div>


    </div>
</template>

<script setup>

import { reactive, ref, onMounted, onUpdated, inject } from "vue"
import TextInput from '@/components/inputs/TextInput.vue'
import Category from '@/models/plots/Category'

const selectedCategory = ref(null)
const selectedCategoryChanged = ref(null)

// Listeners
const eventBus = inject('eventBus')
eventBus.on('PCPlot.selectCategory', (c) => {
    selectedCategory.value = c
    selectedCategoryChanged.value = new Category(
        c.title, c.lb, c.ub, c.position, c.ticks)
})

function readFile (evt) {
    eventBus.emit('PlotTools.readFile', (evt))
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

</script>

<style lang="scss" scoped>
    .plot-tools-container {
        .control-group {
            text-align: left;
            strong {
                font-size: 0.8em;
            }
        }
    }
</style>