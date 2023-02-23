<template>
    <div class="card mt-3">
        <div class="control-group p-2">
            <strong>Graphical options</strong>

            <div class="labeled-form mb-2">
                <span>Resolution: </span>
                <select ref="lineFormatSelector" v-model="pcpStore.resolution">
                    <option :value="0.3">Potato</option>
                    <option :value="0.5">Bad</option>
                    <option :value="1">OK</option>
                    <option :value="1.2">Decent</option>
                    <option :value="2">Sharp</option>
                </select>
            </div>

            <div class="labeled-form mb-2">
                <span>Curve type: </span>
                <select ref="lineFormatSelector" v-model="optionsStore.curveType">
                    <option value="curve">Curve</option>
                    <option value="line">Line</option>
                </select>
            </div>

            <span class="title">Font size</span>
            <div class="labeled-form">
                <span>Title size:</span>
                <input class="me-2" type="number" step="0.1" max="5" min="0" v-model="optionsStore.titleSize"/>
                <span>Tick size:</span>
                <input type="number" step="0.1" max="5" min="0" v-model="optionsStore.tickSize"/>
            </div>

            <span class="title">Data opacity</span>
            <div class="labeled-form">
                <span>Included:</span>
                <input class="me-2" type="number" step="0.05" max="1" min="0" v-model="optionsStore.includedDataOpacity"/>
                <span>Excluded:</span>
                <input type="number" step="0.05" max="1" min="0" @change="setFilteredDataOpacity" :value="optionsStore.excludedDataOpacity"/>
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
import {usePCPStore} from "@/store/PCPStore"

// State references
const optionsStore = useOptionsStore()
const pcpStore = usePCPStore()

function setDataOpacity (value) {
    optionsStore.includedDataOpacity = parseFloat(value)
}

function setFilteredDataOpacity (evt) {
    console.log("CHANGE!")
    console.log(evt.target)
    optionsStore.setExcludedDataOpacity(parseFloat(evt.target.value)) 
}

</script>

<style lang="scss" scoped>
    .title {
        font-size: 0.8em;
        font-weight: bold;
    }
</style>