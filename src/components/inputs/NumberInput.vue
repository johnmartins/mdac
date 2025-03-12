<template>
    <div class="labeled-input-container mb-1" style="width: 100%;">
        <div>
            <span class="input-group-text">
                <slot />
            </span>
        </div>
        <input 
            class="input-number"
            type="number" 
            :step="props.step" 
            :max="props.max" 
            :min="props.min"
            :value="model"
            @input="$emit('update:modelValue', $event.target.value)"
        >
    </div>
</template>

<script setup>
import { defineModel } from "vue";

const model = defineModel();

const props = defineProps({
    'step': {
        type: Number,
        default: 0.1
    },
    'max': {
        type: Number,
        default: 1.0
    },
    'min': {
        type: Number,
        default: 0.0
    },
})

</script>

<style lang="scss" scoped>

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
    .input-group-prepend {
        padding: 0;
    }

    .form-control  {
        padding: 0.1rem 0 0.1rem 0.4rem;
        font-size: 0.8em !important;
        font-family: monospace;
        text-align: right;
        padding-right: 4px;
    }

    .input-number {
        height: 1.8em;
        font-size: 0.8em;
        width: 100%;
    }

</style>