<template>
    <div class="text-truncate">{{ props.category.displayTitle }}</div>
    <div />
    <div class="text-truncate">
        <span v-if="props.category.usesCategoricalData">{{ props.value }}</span>
        <span v-else>{{ props.category.getFormattedNumericValue(props.value) }}</span>
    </div>
    <div class="text-truncate">
        <strong>
            <span v-if="props.category.usesCategoricalData">{{ props.valueToCompareWith }}</span>
            <span v-else :class="{'negative': delta < 0, 'positive': delta > 0, 'equal': delta == 0}">
                {{ props.category.getFormattedNumericValue(delta) }}
            </span>
        </strong>
    </div>
</template>

<script setup>

import {computed} from 'vue'

const props = defineProps({
    category: Object,
    value: [Number, String],
    valueToCompareWith: [Number, String]
})


const delta = computed(() => {
    return props.value - props.valueToCompareWith
})

</script>

<style lang="scss" scoped>

    .negative {
        color: red;
    }

    .positive {
        color: darkgreen;
    }

    .equal {
        color: black;
    }

</style>