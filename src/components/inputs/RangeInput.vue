<template>
    <div class="title"><slot /></div>
    <div class="range-input-container">
        <div>
            <input 
                id="customRange1" 
                ref="rangeInput" 
                type="range" 
                class="form-range"
                min="0"
                max="1"
                step="0.01"
                :value="props.value" 
                @change="onChange"
            >
        </div>
        <div>
            <input 
                ref="numberInput" 
                type="number" 
                step="0.01"
                :value="props.value" disabled
            >
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUpdated, inject } from "vue"

const props = defineProps({
    value: Number
})
const emit = defineEmits(['change'])

const numberInput = ref(null)

function onChange (evt) {
    numberInput.value.value = evt.target.value
    emit('change', parseFloat(evt.target.value))
}

</script>

<style lang="scss" scoped>
.title {
    font-size: 0.8em;
}

.range-input-container {
    display: grid;
    grid-template-columns: auto 60px; 
    margin: 0;
    padding: 0;

    label {
        font-size: 0.8em;
        margin-bottom: 0;
    }

    input[type=number] {
        margin-left: 10px;
        width: 50px;
        font-size: 0.7em;
        font-family: monospace;
        font-weight: bold;
    }

}



</style>