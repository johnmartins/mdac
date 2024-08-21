<template>
    <SidebarSection 
        title="Plot Options" 
        :start-maximized="false"
    >
        <div class="control-group">
            <div v-if="stateStore.activeView === 'pcp'" class="labeled-form mb-2">
                <span>Rendering: </span>
                <select ref="lineFormatSelector" v-model="pcpStore.renderingType">
                    <option value="raster">Rasterized</option>
                    <option value="vector">Vectorized</option>
                </select>
            </div>

            <div v-if="stateStore.activeView === 'pcp' && pcpStore.renderingType==='raster'" class="labeled-form mb-2">
                <span>Resolution: </span>
                <select ref="lineFormatSelector" v-model="pcpStore.resolution" @change="setResolutionManualOverride(true)">
                    <option :value="0.3">0.3 - Potato</option>
                    <option :value="0.5">0.5 - Terrible</option>
                    <option :value="0.8">0.8 - Bad</option>
                    <option :value="1.0">1.0 - OK</option>
                    <option :value="1.2">1.2 - Decent</option>
                    <option :value="1.5">1.5 - Sharp</option>
                    <option :value="2.0">2.0 - Excellent</option>
                </select>
            </div>

            <div v-if="stateStore.activeView === 'pcp'" class="labeled-form mb-2">
                <span>Curve type: </span>
                <select ref="lineFormatSelector" v-model="optionsStore.curveType">
                    <option value="curve">Curve</option>
                    <option value="line">Line</option>
                </select>
            </div>

            <CheckboxInput v-model="optionsStore.showFilters">Show filters in plot</CheckboxInput>

            <NumberInput v-model="optionsStore.tickBackgroundOpacity" :step="0.05" :min="0" :max="1">
                Tick background opacity
            </NumberInput>

            <span class="title">Font size</span>
            <div class="size-and-opacity-forms" style="display: flex; justify-content: space-between;">
                <NumberInput v-model="optionsStore.titleSize" class="me-2" :step="0.1" :max="5" :min="0">Title size:</NumberInput>
                <NumberInput v-model="optionsStore.tickSize" :step="0.1" :max="5" :min="0">Tick size:</NumberInput>
            </div>

            <span class="title">Data opacity</span>
            <div class="size-and-opacity-forms" style="display: flex; justify-content: space-between;">
                <NumberInput v-model="optionsStore.includedDataOpacity" class="me-2" :step="0.05" :max="1" :min="0">Included:</NumberInput>
                <NumberInput v-model="optionsStore.excludedDataOpacity" :step="0.05" :max="1" :min="0" @change="setFilteredDataOpacity">Excluded:</NumberInput>
            </div>
        </div>
    </SidebarSection>
</template>

<script setup>
import { reactive, ref } from "vue"

// Components
import NumberInput from '@/components/inputs/NumberInput.vue'
import SidebarSection from "@/components/layouts/SidebarSection.vue"

// State
import {useOptionsStore} from "@/store/OptionsStore"
import {usePCPStore} from "@/store/PCPStore"
import {useStateStore} from "@/store/StateStore"
import CheckboxInput from "@/components/inputs/CheckboxInput.vue"

// State references
const optionsStore = useOptionsStore()
const pcpStore = usePCPStore()
const stateStore = useStateStore()

function setFilteredDataOpacity (evt) {
    console.log("change")
    optionsStore.setExcludedDataOpacity(parseFloat(evt.target.value)) 
}

function setResolutionManualOverride (override) {
    pcpStore.resolutionManualOverride = override
}

</script>

<style lang="scss" scoped>
    .title {
        font-weight: bold;
    }

</style>