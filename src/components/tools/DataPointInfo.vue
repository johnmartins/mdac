<template>
    <div class="card mt-3">
        <div class="control-group p-2">
            <strong>Selected sample info</strong>
            <div class="element-container" v-if="selectedDataPoint">
                <DataPointInfoElement v-for="c in categories" :key="c.id" :category="c" :value="selectedDataPoint[c.title]" />
            </div>
            <div v-else>No sample selected</div>
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
const {selectedDataPoint} = storeToRefs(scatterStore)

</script>

<style lang="scss" scoped>

.element-container {
    display: grid;
    grid-template-columns: auto 20px auto;
    text-align: left;
    font-size: 0.8em;
}

</style>