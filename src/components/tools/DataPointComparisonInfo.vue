<template>
    <div class="card mt-3" v-if="selectedDataPoint">
        <div class="control-group p-2">
            <strong>Data comparison</strong>

            <div v-if="selectionSimilarity >= 0" style="font-size: 0.9em">
                <span>Similarity to selection: {{selectionSimilarity}}</span>
            </div>
            
            <div class="element-container" v-if="selectedSecondaryDataPoint">
                <DataPointInfoElement v-for="c in categories" :key="c.id" :category="c" :value="selectedSecondaryDataPoint[c.title]" />
            </div>
            <div v-else>No sample selected. Click on a data point <strong>while holding the CTRL-key</strong> to select it.</div>
        </div>
    </div>
</template>

<script setup>
import {computed} from "vue"

import {useDataStore} from "../../store/DataStore"
import {useScatterStore} from "../../store/ScatterStore"
import {storeToRefs} from 'pinia'
import {euclideanDistance} from "../../sadse/similarity"

// Components
import DataPointInfoElement from './DataPointInfoElement'

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
    grid-template-columns: auto 20px auto;
    text-align: left;
    font-size: 0.9em;
    font-family: monospace;
    user-select: text;
}

</style>