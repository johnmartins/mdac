<template>
    <div class="labeled-input-container mb-1">
        <div>
            <span class="">
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
    }
    .input-group-text {
        font-size: 1em;
        width: 60px;
        padding: 0.1em 0 0.1em 0.4em;


    }
    .input-group-prepend {
        padding: 0;
    }

    .form-control  {
        padding: 0.1rem 0 0.1rem 0.4rem;
        font-size: 1em !important;
        font-family: monospace;
        text-align: right;
        padding-right: 4px;
    }

</style>