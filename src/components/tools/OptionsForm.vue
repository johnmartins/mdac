<template>
    <div class="card mt-3">
        <div class="control-group p-2">
            <strong>Graphical options</strong>

            <RangeInput :value="0.8" @change="setDataOpacity">Data opacity</RangeInput>
            <RangeInput :value="0" @change="setFilteredDataOpacity">Filtered data opacity</RangeInput>

            <div class="labeled-form mb-2">
                <span>Curve type: </span>
                <select ref="lineFormatSelector" v-model="optionsStore.curveType">
                    <option value="curve">Curve</option>
                    <option value="line">Line</option>
                </select>
            </div>

            <div class="labeled-form">
                <span>Title size:</span>
                <input class="me-2" type="number" step="0.1" max="5" min="0" v-model="optionsStore.titleSize"/>
                <span>Tick size:</span>
                <input type="number" step="0.1" max="5" min="0" v-model="optionsStore.tickSize"/>
            </div>


        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from "vue"

// Components
import RangeInput from '@/components/inputs/RangeInput.vue'

// State
import {useOptionsStore} from "@/store/OptionsStore"

// State references
const optionsStore = useOptionsStore()

function setDataOpacity (value) {
    optionsStore.dataOpacity = parseFloat(value)
}

function setFilteredDataOpacity (value) {
    optionsStore.setExcludedDataOpacity(parseFloat(value))
}

</script>

<style lang="scss" scoped>

</style>