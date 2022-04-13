<template>
    <div class="card mt-3" v-if="selectedPlot">
        <div class="control-group p-2">
            <strong>Category source selection</strong>
            <div class="labeled-form">                
                <span>X-axis:</span>
                <select ref="xAxisSelector" v-model="selectedPlot.xAxisCategoryName">
                    <option :value="null" selected>None</option>
                    <option v-for="category in categories" :value="category.title" :key="category.id"> {{category.displayTitle}}</option>
                </select>
            </div>
            <div class="labeled-form">                
                <span>Y-axis:</span>
                <select ref="yAxisSelector" v-model="selectedPlot.yAxisCategoryName">
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
    selectedPlot.xAxisCategoryName = xAxisSelector.value.value
    selectedPlot.yAxisCategoryName = yAxisSelector.value.value
}

</script>

<style lang="scss" scoped>

</style>