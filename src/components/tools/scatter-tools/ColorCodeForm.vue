<template>
    <div class="card mt-3">
        <div class="control-group p-2">
            <strong>Color coding</strong>
            <div class="labeled-form">                
                <span>Property:</span>
                <select 
                v-model="selectedColorCodeCategory" 
                @change="onColorCategoryChange">
                    <option :value="null">None</option>
                    <option v-for="c in categories" :value="c" :key="c.id"> {{c.displayTitle}}</option>
                </select>
            </div>
            <div class="form-check" title="If enabled, data points will be color coded based on input similarity (euclidean proximity).">
                <input class="form-check-input" type="checkbox" 
                v-model="useSimilarityColorCoding" 
                @change="onUseSimilarityColorCodingChange">
                <label class="form-check-label" for="flexCheckDefault">
                    Use similarity color coding
                </label>
            </div>
        </div>
        
    </div>
</template>

<script setup>
import { ref } from "vue"
import { storeToRefs } from "pinia"
import {useScatterStore} from "@/store/ScatterStore"
import {useDataStore} from "@/store/DataStore"
import ScatterPlotConfig from "@/models/plots/ScatterPlotConfig"

const scatterStore = useScatterStore()
const dataStore = useDataStore()

const {plots, selectedPlotID, selectedColorCodeCategory, useSimilarityColorCoding, overrideColorCodeColumn, overrideColorCodeFunction} = storeToRefs(scatterStore)
const {categories} = storeToRefs(dataStore)

function onColorCategoryChange (evt) {
    scatterStore.resetColorCodeOverride()
}

function onUseSimilarityColorCodingChange (evt) {
    scatterStore.resetColorCodeOverride()
}


</script>

<style lang="scss" scoped>

</style>