<template>
    <SidebarSection
        title="Sample info"
        :start-maximized="true"
    >
        <div class="control-group">
            <div v-if="selectedDataPoint" class="element-container">
                <DataPointInfoElement v-for="c in categories" :key="c.id" :category="c" :value="selectedDataPoint[c.title]" />
            </div>
            <div v-else>No sample selected. Click on a data point to select it.</div>
        </div>
    </SidebarSection>
</template>

<script setup>

import {useDataStore} from "../../store/DataStore"
import {useScatterStore} from "../../store/ScatterStore"
import {storeToRefs} from 'pinia'

// Components
import DataPointInfoElement from './DataPointInfoElement'
import SidebarSection from "../layouts/SidebarSection.vue"

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
    font-size: 0.9em;
    font-family: monospace;
    user-select: text;
}

</style>