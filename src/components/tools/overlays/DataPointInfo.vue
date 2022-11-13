<template>

    <OverlayTemplate :x="571" :y="206">
        <div class="variable-element" v-if="selectedDataPoint">
            <DataPointInfoElement v-for="c in categories" :key="c.id" :variable="c.displayTitle" :value="selectedDataPoint[c.title]" />
        </div>
    </OverlayTemplate>

</template>

<script setup>

import {useDataStore} from "../../../store/DataStore"
import {useScatterStore} from "../../../store/ScatterStore"
import {storeToRefs} from 'pinia'

// Components
import OverlayTemplate from './OverlayTemplate.vue'
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
}

</style>