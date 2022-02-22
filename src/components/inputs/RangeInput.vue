<template>
<div class="title"><slot></slot></div>
    <div class="range-input-container">
        <div>
            <input 
            type="range" 
            class="form-range" 
            id="customRange1" 
            min="0"
            max="1"
            ref="rangeInput"
            step="0.01"
            :value="props.value" 
            @change="onChange"/>
        </div>
        <div>
            <input 
            type="number" 
            step="0.01" 
            :value="props.value"
            ref="numberInput" disabled>
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
    grid-template-columns: auto 80px; 

    label {
        font-size: 0.8em;
        margin-bottom: 0;
    }

    input[type=number] {
        margin-left: 10px;
        width: 70px;
        font-size: 0.8em;
        font-family: monospace;
        font-weight: bold;
    }

}



</style>