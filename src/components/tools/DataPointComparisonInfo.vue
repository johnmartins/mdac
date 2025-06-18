<template>
    <SidebarSection
        title="Data point comparison"
        :start-maximized="true"
    >
        <div v-if="selectedDataPoint">
            <div class="control-group">
                <div class="font-monospace">
                    <div v-if="selectionSimilarity >= 0" style="font-size: 0.9em">
                        <span>Similarity to selection: <strong>{{ parseFloat(selectionSimilarity).toFixed(3) }}</strong></span>
                    </div>
                    
                    <div v-if="selectedSecondaryDataPoint" class="element-container">
                        <div class="grid-header">Variable</div>
                        <div class="grid-header" />
                        <div class="grid-header">Value</div>
                        <div class="grid-header">Delta</div>

                        <DataPointComparisonElement
                            v-for="c in categories" 
                            :key="c.id" 
                            :category="c" 
                            :value="selectedSecondaryDataPoint[c.title]"
                            :value-to-compare-with="selectedDataPoint[c.title]"
                        />
                    </div>
                    
                    <div v-else style="text-align: left;">
                        No sample selected. Click on a data point <strong>while holding the CTRL-key</strong> to select it.
                    </div>
                </div>
            </div>
        </div>
        <div v-else style="text-align: left;">
            <span>No data point has been selected</span>
        </div>
    </SidebarSection>
</template>

<script setup>
import {computed} from "vue";
import {storeToRefs} from 'pinia';

import {useDataStore} from "@/store/DataStore.js"
import {useScatterStore} from "@/store/ScatterStore.js"

import {euclideanDistance} from "@/sadse/similarity.js"

// Components
import SidebarSection from "@/components/layouts/SidebarSection.vue"
import DataPointComparisonElement from './DataPointComparisonElement.vue'

const dataStore = useDataStore()
const scatterStore = useScatterStore()

const {categories} = storeToRefs(dataStore)
const {selectedDataPoint, selectedSecondaryDataPoint} = storeToRefs(scatterStore)
const selectionSimilarity = computed(() => {
    if (!selectedDataPoint.value || !selectedSecondaryDataPoint.value) return -1

    let v = dataStore.getArrayFromDataPoint(selectedDataPoint.value, dataStore.inputColumns, {normalize: true})
    let w = dataStore.getArrayFromDataPoint(selectedSecondaryDataPoint.value, dataStore.inputColumns, {normalize: true})

    return euclideanDistance(v, w, true)
})


</script>

<style lang="scss" scoped>

.element-container {
    display: grid;
    grid-template-columns: auto 20px auto auto;
    text-align: left;
    font-size: 0.9em;
    font-family: monospace;
    user-select: text;
}

.grid-header {
    font-weight: bold;
    font-size: 1.2em;
}

</style>