<template>
    <div class="card mt-3" v-if="selectedPlot">
        <div class="control-group p-2">
            <strong>Plot configuration</strong>
            <div class="labeled-form">                
                <span>Title:</span>
                <input type="text" ref="yAxisSelector" v-model="selectedPlot.title" @change="onTitleChange">
            </div>
            <div class="labeled-form mt-1">                
                <span>X-axis:</span>
                <select ref="xAxisSelector" v-model="selectedPlot.xAxisCategoryName" @change="onAxisChange">
                    <option :value="null" selected>None</option>
                    <option v-for="category in categories" :value="category.title" :key="category.id"> {{category.displayTitle}}</option>
                </select>
            </div>
            <div class="labeled-form mt-1">                
                <span>Y-axis:</span>
                <select ref="yAxisSelector" v-model="selectedPlot.yAxisCategoryName" @change="onAxisChange">
                    <option :value="null" selected>None</option>
                    <option v-for="category in categories" :value="category.title" :key="category.id"> {{category.displayTitle}}</option>
                </select>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue"
import { storeToRefs } from "pinia"
import {useDataStore} from "@/store/DataStore"
import {useScatterStore} from "@/store/ScatterStore"

const dataStore = useDataStore()
const {data, filters, categories} = storeToRefs(dataStore)
const scatterStore = useScatterStore()
const {selectedPlot} = storeToRefs(scatterStore)

// DOM References
const xAxisSelector = ref(null)
const yAxisSelector = ref(null)

function changeConfig () {
    if (!selectedPlot){
        throw new Error("Can't change plot config because no plot is selected.")
    }
    selectedPlot.value.xAxisCategoryName = xAxisSelector.value.value
    selectedPlot.value.yAxisCategoryName = yAxisSelector.value.value
}

function generateTitle () {
    if (selectedPlot.value.titleOverride) {
        throw new Error('Title override prevents generated title')
    }
    if (!selectedPlot.value) return `Plot ${selectedPlot.value.id + 1}`
    const xc = dataStore.getCategoryWithName(selectedPlot.value.xAxisCategoryName)
    const yc = dataStore.getCategoryWithName(selectedPlot.value.yAxisCategoryName)
    if (!xc || !yc) return
    selectedPlot.value.title = `${xc.displayTitle} vs. ${yc.displayTitle}`    
}

function onAxisChange () {
    if (selectedPlot.value.titleOverride) return
    generateTitle()
}

function onTitleChange () {
    selectedPlot.value.titleOverride = true
}

</script>

<style lang="scss" scoped>

</style>