<template>
    <SidebarSection
        title="Plot selection"
        :start-maximized="true"
    >
        <div class="control-group">
            <strong>Scatter plot selection</strong>
            <div class="labeled-form">                
                <span>Plot:</span>
                <select ref="plotSelector" v-model="selectedPlotID" @change="changePlot">
                    <option :value="null">None</option>
                    <option v-for="plot in plots" :key="plot.id" :value="plot.id"> {{ plot.title }}</option>
                </select>
            </div>
            <div class="d-grid mt-2">
                <button class="btn d-block btn-sm btn-success" @click="newPlot">Create new plot</button>
            </div>
        </div>
    </SidebarSection>
</template>

<script setup>
import { ref } from "vue"
import { storeToRefs } from "pinia"
import {useScatterStore} from "@/store/ScatterStore"
import ScatterPlotConfig from "@/models/plots/ScatterPlotConfig"
import SidebarSection from "@/components/layouts/SidebarSection.vue"

const scatterStore = useScatterStore()
const {plots, selectedPlotID} = storeToRefs(scatterStore)

const plotSelector = ref(null)

function changePlot () {
    scatterStore.setSelectedPlot(plotSelector.value.value)
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