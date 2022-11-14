<template>
    <div class="text-truncate">{{props.variable}}</div>
    <div>=</div>
    <div class="text-truncate">{{props.value}}</div>
</template>

<script setup>

import {ref} from 'vue'

const props = defineProps({
    variable: String,
    value: [Number, String]
})

</script>

<style lang="scss" scoped>

.variable-element {
    display: grid;
    grid-template-columns: auto 20px auto;
}

</style>