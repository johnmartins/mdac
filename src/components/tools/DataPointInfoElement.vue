<template>
    <div class="text-truncate">{{props.category.displayTitle}}</div>
    <div>=</div>
    <div class="text-truncate text-end">
        <span v-if="props.category.usesCategoricalData">{{props.value}}</span>
        <span v-else>{{props.category.getFormattedNumericValue(props.value)}}</span>
    </div>
</template>

<script setup>

import {ref} from 'vue'

const props = defineProps({
    category: Object,
    value: [Number, String]
})

</script>

<style lang="scss" scoped>


</style>