<template>
    <div class="card mt-3">
        <div class="control-group p-2 text-truncate">
            <strong>Selected sample info</strong>
            <div class="variable-element" v-if="selectedDataPoint">
                <DataPointInfoElement v-for="c in categories" :key="c.id" :variable="c.displayTitle" :value="selectedDataPoint[c.title]" />
            </div>
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

.variable-element {
    display: grid;
    grid-template-columns: auto 20px auto;
    text-align: left;
}

</style>