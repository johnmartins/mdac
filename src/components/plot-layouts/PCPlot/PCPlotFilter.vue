<template>
    <g>
        <rect 
        class="filter-box"
        :y="y" 
        :height="height" />

        <rect 
        class="filter-pull-box"
        :y="y"
        height="8px"
        @mousedown.prevent="moveFilterTop"
        />

        <rect 
        class="filter-pull-box"
        :y="y + height - 8"
        height="8px"
        @mousedown.prevent="moveFilterBot"
        />

    </g>
</template>

<script setup>
import {computed} from 'vue'
import {storeToRefs} from "pinia"

import {truncateDecimals} from "@/utils/data-utils"
import {getTrueEventCoordinates} from "@/utils/svg-utils"

// Stores
import {useDataStore} from "../../../store/DataStore"
import {usePCPStore} from "../../../store/PCPStore"

const PCPStore = usePCPStore()
const dataStore = useDataStore()

const {axisLength} = storeToRefs(PCPStore)
const emit = defineEmits(['interaction'])

const props = defineProps({
    category: Object,
    filter: Object
})

const y = computed(() => {
    if (props.filter.type === 'single-range') {
        return truncateDecimals(props.category.scaleLinear(props.filter.thresholdB)*axisLength.value, 1)
    } else if (props.filter.type === 'categoric') {
        return truncateDecimals(props.filter.lowerBoundRatio*axisLength.value, 1)
    } else {
        throw new Error('Encountered unknown filter type')
    }
})

const height = computed( () => {
    if (props.filter.type === 'single-range') {
        return truncateDecimals((props.category.scaleLinear(props.filter.thresholdA)-props.category.scaleLinear(props.filter.thresholdB))*axisLength.value, 1)
    } else if (props.filter.type === 'categoric') {
        return truncateDecimals((props.filter.upperBoundRatio - props.filter.lowerBoundRatio)*axisLength.value, 1)
    } else {
        throw new Error('Encountered unknown filter type')
    }
})

function moveFilterTop () {
    console.log("Move filter top")
    emit('interaction', {
        filter: props.filter, 
        category: props.category,
        start: y.value + height.value
    })
}

function moveFilterBot () {
    console.log("Move filter bot")
    emit('interaction', {
        filter: props.filter, 
        category: props.category,
        start: y.value
    })
}

</script>

<style lang="scss" scoped>
    .filter-box {
        x: -8px;
        width: 16px; 
        fill: blue;
        z-index: 99;
    }
    .filter-pull-box {
        x: -8px;
        width: 16px;
        fill: red;
        cursor: row-resize;
    }
</style>