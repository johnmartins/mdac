<template>
    <div class="control-group p-2">
        <strong>Graphical options</strong>
        <RangeInput :value="0.8" @change="setDataOpacity">Data opacity</RangeInput>
        <RangeInput :value="0.05" @change="setFilteredDataOpacity">Filtered data opacity</RangeInput>

        <div class="labeled-form">
            <span>Title size:</span>
            <input class="me-2" type="number" step="0.1" value="0.8" max="5" min="0" @change="setTitleSize"/>
            <span>Tick size:</span>
            <input type="number" step="0.1" value="0.6" max="5" min="0" @change="setTickSize"/>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, inject } from "vue"
import RangeInput from '@/components/inputs/RangeInput.vue'

const eventBus = inject('eventBus')

function setDataOpacity (value) {
    eventBus.emit('OptionsForm.setDataOpacity', value)
}

function setFilteredDataOpacity (value) {
    eventBus.emit('OptionsForm.setFilteredDataOpacity', value)
}

function setTitleSize (evt) {
    eventBus.emit('OptionsForm.setTitleSize', evt.target.value)
}

function setTickSize (evt) {
    eventBus.emit('OptionsForm.setTickSize', evt.target.value)
}

</script>

<style lang="scss" scoped>

</style>