<template>
    <div class="text-truncate">{{props.category.displayTitle}}</div>
    <div>=</div>
    <div class="text-truncate text-end">{{props.value}}</div>
</template>

<script setup>

import {ref} from 'vue'

const props = defineProps({
    category: Object,
    value: [Number, String]
})

</script>

<style lang="scss" scoped>

.variable-element {
    display: grid;
    grid-template-columns: auto 10px auto;
}

</style>