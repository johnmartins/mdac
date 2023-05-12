<template>
    <div class="input-group input-group-sm mb-1">
        <div class="input-group-prepend">
            <span id="inputGroup-sizing-sm" class="input-group-text"><slot /></span>
        </div>
        <input 
            type="text" 
            class="form-control" 
            aria-label="Small" 
            aria-describedby="inputGroup-sizing-sm" 
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
    .input-group-text {
        font-size: 0.8rem;
        width: 60px;
        padding: 0.1em 0 0.1em 0.4em;


    }
    .input-group-prepend {
        padding: 0;
    }

    .form-control  {
        padding: 0.1rem 0 0.1rem 0.4rem;
        font-size: 0.6rem !important;
        font-family: monospace;
        font-weight: bold;
        text-align: right;
    }

</style>