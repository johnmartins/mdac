<template>
    <div class="card mt-3" v-if="selectedDataPoint">
        <div class="control-group p-2">
            <strong>Data comparison</strong>
            <div class="element-container" v-if="selectedSecondaryDataPoint">
                <DataPointInfoElement v-for="c in categories" :key="c.id" :category="c" :value="selectedSecondaryDataPoint[c.title]" />
            </div>
            <div v-else>No sample selected. Click on a data point <strong>while holding the CTRL-key</strong> to select it.</div>
        </div>
    </div>
</template>

<script setup>

import {useDataStore} from "../../store/DataStore"
import {useScatterStore} from "../../store/ScatterStore"
import {storeToRefs} from 'pinia'

// Components
import DataPointInfoElement from './DataPointInfoElement'

const dataStore = useDataStore()
const scatterStore = useScatterStore()

const {categories} = storeToRefs(dataStore)
const {selectedDataPoint, selectedSecondaryDataPoint} = storeToRefs(scatterStore)

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