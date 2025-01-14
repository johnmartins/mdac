<template>
    <SidebarSection 
        title="Similarity Analysis" 
        :start-maximized="false"
    >
        <div class="control-group">            
            <div class="labeled-form" style="font-size: 0.8em;">
                <span>Fidelity column: </span>
                <select v-model="fidelityColumn" class="mb-2">
                    <option :value="null">None</option>
                    <option v-for="c in categories.filter(filterCategoricalColumns)" :key="c.id" :value="c"> {{ c.displayTitle }}</option>
                </select>
            </div>
            <div class="labeled-form" style="font-size: 0.8em;">
                <span>HiFi indicator: </span>
                <select v-model="fidelityValue" class="mb-2" :disabled="fidelityColumn == null">
                    <option :value="null">None</option>
                    <option v-for="val, i in fidelityColumnValues" :key="i" :value="val"> {{ val }}</option>
                </select>
            </div>
            <div class="labeled-form" style="font-size: 0.8em;">
                <span>I/O similarity: </span>
                <select v-model="ioType" class="mb-2">
                    <option value="input">Input</option>
                    <option value="output">Output</option>
                </select>
            </div>
            <div class="d-grid">
                <button class="" :disabled="!similarityAnalysisAvailable" @click="requestIntersimCalc">
                    Calculate inter-similarity
                </button>
            </div>
        </div>
    </SidebarSection>
</template>
<script setup>

import Category from "@/models/plots/Category"
import WorkerMessage from "@/models/WorkerMessage"
import { calculateIntersimilarity } from "@/sadse/similarity"
import { useStateStore } from "@/store/StateStore"
import { storeToRefs } from "pinia"
import { computed, ref, inject } from "vue"
import { useDataStore } from "../../../store/DataStore"
import SidebarSection from "@/components/layouts/SidebarSection"

const analysisWorker = new Worker('analysis.js')

const stateStore = useStateStore()
const dataStore = useDataStore()
const { categories } = storeToRefs(dataStore)

const fidelityColumn = ref(null)
const fidelityValue = ref(null)
const ioType = ref('input')

const eventBus = inject('eventBus');

const fidelityColumnValues = computed( () => {
    if (!fidelityColumn.value) return []
    if (!fidelityColumn.value.usesCategoricalData) return []
    return fidelityColumn.value.availableCategoricalValues
})

const similarityAnalysisAvailable = computed ( () => {
    if (!fidelityColumn.value) return false
    if (!fidelityValue.value) return false
    return true
})

function filterCategoricalColumns (c) {
    if (c.usesCategoricalData) return true
    return false
}

async function requestIntersimCalc () {
    const fidelityColumnTitle = fidelityColumn.value.title;
    const targetColValue = fidelityValue.value;
    const ioSelection = ioType.value;

    analysisWorker.postMessage(new WorkerMessage('channel name here', 'payload message or object or whatever really.'));

    await stateStore.setLoading('Running similarity analysis. This can take several minutes...');
    try {
        // Use a worker for this shit // 2024: we should still implement a service worker for this shit
        await calculateIntersimilarity(fidelityColumnTitle, targetColValue, ioSelection);
    } catch (err) {
        throw err;
    } finally {
        // Request redraw and remove loading message
        eventBus.emit('PCPRasterLayer.RequestPCPRedraw');
        await stateStore.clearLoading();
    }
}


</script>
<style lang="scss" scoped>
    
</style>
