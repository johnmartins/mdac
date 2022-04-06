<template>    
    <div class="card mt-3" v-if="selectedCategoryChanged">
        <div class="control-group p-2">
            <strong>Edit selected category</strong>
            <TextInput :value="selectedCategoryChanged.titlePreviewed.toString()"
                @change="(v) => {selectedCategoryChanged.titlePreviewed=v}">Title</TextInput>
            <TextInput :value="selectedCategoryChanged.ub" 
                @change="(v) => {selectedCategoryChanged.ub=parseFloat(v)}">UB</TextInput>
            <TextInput :value="selectedCategoryChanged.lb" 
                @change="(v) => {selectedCategoryChanged.lb=parseFloat(v)}">LB</TextInput>
            <TextInput :value="selectedCategoryChanged.ticks" 
                @change="(v) => {selectedCategoryChanged.ticks=parseInt(v)}">Ticks</TextInput>
        </div>
        <div class="btn-group px-2 mb-2">
            <button class="btn btn-success btn-sm" @click="editCategory">Update</button>
            <button class="btn btn-warning btn-sm" @click="resetCategory">Reset</button>
            <button class="btn btn-danger btn-sm" @click="deleteCategory">Delete</button>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUpdated, inject } from "vue"

import TextInput from '@/components/inputs/TextInput'
import Category from '@/models/plots/Category'

let selectedCategory = ref(null)
let selectedCategoryChanged = ref(null)

const eventBus = inject('eventBus')
eventBus.on('PCPlot.selectCategory', (c) => {
    console.log("...")
    if (!c) {
         selectedCategory.value = null
         selectedCategoryChanged.value = null
         return
    }
    selectedCategory.value = c
    let newCat = new Category()
    newCat.morph(c)
    selectedCategoryChanged.value = newCat
})

function deleteCategory () {
    eventBus.emit('PlotTools.deleteCategory', selectedCategory.value)
}

function editCategory () {
    selectedCategory.value.morph(selectedCategoryChanged.value)
    console.log(selectedCategoryChanged.value)
    console.log(selectedCategory.value)
}

function resetCategory () {
    selectedCategoryChanged.value.morph(selectedCategory.value)
}


</script>

<style lang="scss" scoped>

</style>