<template>
    <div class="labeled-input-container mb-1">
        <div>
            <span class="input-group-text">
                <slot />
            </span>
        </div>
        <input 
            type="text" 
            class="form-control" 
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
        >
    </div>
</template>

<script setup>
defineProps(['modelValue'])
defineEmits(['update:modelValue'])

</script>

<style lang="scss" scoped>

    .labeled-input-container {
        display: grid;
        grid-template-columns: 1fr 3fr;
        gap: 0.5em;
    }
    
    .input-group-text {
        font-size: 0.8em;
        width: 80px;
        padding: 0.1em 0 0.1em 0.4em;


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

</style>