<template>    
    <div class="card mt-3" v-if="selectedCategoryChanged">
        <div class="control-group p-2">
            <strong>Edit selected category</strong>
            <TextInput :value="selectedCategoryChanged.displayTitle.toString()"
                @change="(v) => {selectedCategoryChanged.displayTitle=v}">Title</TextInput>
            <TextInput :value="selectedCategoryChanged.ub" 
                @change="(v) => {selectedCategoryChanged.ub=parseFloat(v)}">UB</TextInput>
            <TextInput :value="selectedCategoryChanged.lb" 
                @change="(v) => {selectedCategoryChanged.lb=parseFloat(v)}">LB</TextInput>
            <TextInput :value="selectedCategoryChanged.ticks" 
                @change="(v) => {selectedCategoryChanged.ticks=parseInt(v)}">Ticks</TextInput>

            <div class="btn-group" style="width: 100%">
                <button class="btn btn-success btn-sm" @click="editCategory">Update</button>
                <button class="btn btn-warning btn-sm" @click="resetCategory">Reset</button>
                <button class="btn btn-danger btn-sm" @click="deleteCategory">Delete</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUpdated, inject } from "vue"
import { storeToRefs } from "pinia"

import {useDataStore} from "@/store/DataStore"

import TextInput from '@/components/inputs/TextInput'
import Category from '@/models/plots/Category'

const dataStore = useDataStore()

let selectedCategory = ref(null)
let selectedCategoryChanged = ref(null)

const eventBus = inject('eventBus')
eventBus.on('PCPlot.selectCategory', (c) => {
    if (!c) {
         selectedCategory.value = null
         selectedCategoryChanged.value = null
         return
    }
    selectedCategory.value = c

    // Create a temporary new category, and copy all information from the selected category to the temporary category
    let newCat = new Category("$$TEMPORARY_CATEGORY$$", 0, 1, {overwrite: true})
    newCat.morph(c, {migrateReference: false})
    selectedCategoryChanged.value = newCat
})

function deleteCategory () {
    dataStore.deleteCategory(selectedCategory.value)
}

function editCategory () {
    selectedCategory.value.morph(selectedCategoryChanged.value, {migrateReference: false})
    eventBus.emit('EditCategoryForm.editCategory', selectedCategory.value)
}

function resetCategory () {
    selectedCategoryChanged.value.morph(selectedCategory.value, {migrateReference: false})
}


</script>

<style lang="scss" scoped>

</style>