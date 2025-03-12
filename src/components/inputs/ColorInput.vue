<template>

<div class="labeled-input-container mb-1" style="width: 100%;">
    <div>
        <span class="input-group-text">
            <slot />
        </span>
    </div>
    <input 
        class="color-input"
        type="color" 
        :value="model"
        @input="$emit('update:modelValue', $event.target.value)" 
    />
</div>

</template>

<script setup>
import { defineModel } from "vue";

const model = defineModel();


</script>

<style lang="scss" scoped>

.color-input {
    height: 100%;
    width: 100%;
    padding: 0;
    cursor: pointer;
}

.labeled-input-container {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: 0.5em;
}

.input-group-text {
    font-size: 0.8em;
    min-width: 100%;
    padding: 0.1em 0.5em 0.1em 0.4em;
}

</style>