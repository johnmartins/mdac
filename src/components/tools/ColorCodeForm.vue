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
import {useOptionsStore} from "@/store/OptionsStore"
import {useDataStore} from "@/store/DataStore"

const optionsStore = useOptionsStore()
const dataStore = useDataStore()

const {selectedColorCodeCategory, useSimilarityColorCoding} = storeToRefs(optionsStore)
const {categories} = storeToRefs(dataStore)

function onColorCategoryChange (evt) {
    optionsStore.resetColorCodeOverride()
}

function onUseSimilarityColorCodingChange (evt) {
    optionsStore.resetColorCodeOverride()
}

</script>

<style lang="scss" scoped>

</style>