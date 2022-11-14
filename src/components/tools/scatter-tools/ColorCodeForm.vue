<template>
    <div class="card mt-3">
        <div class="control-group p-2">
            <strong>Color coding</strong>
            <div class="labeled-form">                
                <span>Property:</span>
                <select ref="plotSelector" v-model="selectedColorCodeCategory">
                    <option :value="null">None</option>
                    <option v-for="c in categories" :value="c" :key="c.id"> {{c.displayTitle}}</option>
                </select>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="useSimilarityColorCoding">
                <label class="form-check-label" for="flexCheckDefault">
                    Use similarity color coding
                </label>
            </div>
        </div>
        
    </div>
</template>

<script setup>
import { ref } from "vue"
import { storeToRefs } from "pinia"
import {useScatterStore} from "@/store/ScatterStore"
import {useDataStore} from "@/store/DataStore"
import ScatterPlotConfig from "@/models/plots/ScatterPlotConfig"

const scatterStore = useScatterStore()
const dataStore = useDataStore()

const {plots, selectedPlotID, selectedColorCodeCategory, useSimilarityColorCoding} = storeToRefs(scatterStore)
const {categories} = storeToRefs(dataStore)


function changeColorCode () {
    scatterStore.setSelectedColorCode(plotSelector.value.value)
}

function newPlot () {
    const newPlot = new ScatterPlotConfig()
    scatterStore.addPlot(newPlot)

    // Update selected plot to new plot
    scatterStore.setSelectedPlot(newPlot.id)
}

</script>

<style lang="scss" scoped>

</style>