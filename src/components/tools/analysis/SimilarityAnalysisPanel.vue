<template>
    <div class="card mt-3">
        <div class="control-group p-2">
            <div>
                <strong>Similarity analysis</strong>
            </div>
            
            <div class="labeled-form">
                <span>Fidelity column: </span>
                <select v-model="fidelityColumn" class="mb-2">
                    <option :value="null">None</option>
                    <option v-for="c in categories.filter(filterCategoricalColumns)" :key="c.id" :value="c"> {{ c.displayTitle }}</option>
                </select>
            </div>
            <div class="labeled-form">
                <span>HiFi indicator: </span>
                <select v-model="fidelityValue" class="mb-2" :disabled="fidelityColumn == null">
                    <option :value="null">None</option>
                    <option v-for="val, i in fidelityColumnValues" :key="i" :value="val"> {{ val }}</option>
                </select>
            </div>
            <div class="labeled-form">
                <span>I/O similarity: </span>
                <select v-model="ioType" class="mb-2">
                    <option value="input">Input</option>
                    <option value="output">Output</option>
                </select>
            </div>
            <div class="d-grid">
                <button class="btn btn-sm btn-primary" :disabled="!similarityAnalysisAvailable" @click="calculateIntersimilarity">
                    Calculate inter-similarity
                </button>
            </div>
        </div>
    </div>
</template>
<script setup>

import Category from "@/models/plots/Category"
import { euclideanDistance } from "@/sadse/similarity"
import { storeToRefs } from "pinia"
import { computed, ref } from "vue"
import { useDataStore } from "../../../store/DataStore"

const dataStore = useDataStore()
const { categories } = storeToRefs(dataStore)

const fidelityColumn = ref(null)
const fidelityValue = ref(null)
const ioType = ref('input')

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

function calculateIntersimilarity () {
    let cols = []
    if (ioType.value === 'input') {
        cols = dataStore.inputColumns
    } else if (ioType.value === 'output') {
        cols = dataStore.outputColumns
    } else {
        throw new Error('Unsupported analysis configuration.')
    }

    const normalized = true
    const intersimCol = '$intersim$'
    const fidelityColumnTitle = fidelityColumn.value.title
    const targetColValue = fidelityValue.value

    const lofiData = dataStore.data.filter(d => d[fidelityColumnTitle] !== targetColValue)
    const hifiData = dataStore.data.filter(d => d[fidelityColumnTitle] === targetColValue)

    // Add an $inter-similarity$ category
    const intersimCategory = new Category(intersimCol, 0, 1, {
        usesCategoricalData: false,
    })
    dataStore.addCategory(intersimCategory)

    let maxIntersim = 0

    for (let dlf of lofiData) {
        // Lofi data loop

        // Get identifier
        const vlf = dataStore.getArrayFromDataPoint(dlf, cols, {normalize: normalized})

        let closestSimilarityValue = null

        for (let dhf of hifiData) {
            // Hifi data loop
            const vhf = dataStore.getArrayFromDataPoint(dhf, cols, {normalize: normalized}) // TODO: We only really need to do this once for each data doint. This should be outside the loops.

            // Calculate similarity
            const s = euclideanDistance(vlf, vhf, normalized)

            // Store nearest similarity value
            if (!closestSimilarityValue) {
                closestSimilarityValue = s
            } else if (closestSimilarityValue > s) {
                closestSimilarityValue = s
            }

            dhf[intersimCol] = 0
        }

        dlf[intersimCol] = closestSimilarityValue
        if (closestSimilarityValue > maxIntersim) maxIntersim = closestSimilarityValue
    }

    intersimCategory.lb = 0
    intersimCategory.ub = maxIntersim
    intersimCategory.displayTitle = 'INTER-SIMILARITY'
}


</script>
<style lang="scss" scoped>
    
</style>
