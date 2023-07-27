<template>
    <SidebarSection 
        title="Color Coding" 
        :start-maximized="false"
    >
        <div class="control-group">
            <div class="labeled-form">                
                <span>Property:</span>
                <select 
                    v-model="selectedColorCodeCategory" 
                    @change="onColorCategoryChange"
                >
                    <option :value="null">None</option>
                    <option v-for="c in categories" :key="c.id" :value="c"> {{ c.displayTitle }}</option>
                </select>
            </div>
            <div class="form-check" title="If enabled, data points will be color coded based on input similarity (euclidean proximity).">
                <input
                    v-model="useSimilarityColorCoding" class="form-check-input" 
                    type="checkbox" 
                    @change="onUseSimilarityColorCodingChange"
                >
                <label class="form-check-label m-0" for="flexCheckDefault">
                    Use similarity color coding
                </label>
            </div>
        </div>
    </SidebarSection>
</template>

<script setup>
import { ref } from "vue"
import { storeToRefs } from "pinia"
import SidebarSection from "@/components/layouts/SidebarSection"
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