<template>
    <g>
        <rect 
            class="filter-box"
            :y="y" 
            :height="height"
            @mousedown.stop.prevent="moveFilterBlock($event)"
            @mouseenter="emit('onMouseEnter', props.filter)"
            @mouseleave="emit('onMouseLeave', props.filter)"
        />

        <rect 
            class="filter-pull-box"
            :y="y - capHeight"
            :height="capHeight"
            @mousedown.prevent="moveFilterTop"

        />

        <rect 
            class="filter-pull-box"
            :y="y + height"
            :height="capHeight"
            @mousedown.prevent="moveFilterBot"
        />
    </g>
</template>

<script setup>
import {computed, ref} from 'vue'
import {storeToRefs} from "pinia"

import {truncateDecimals} from "@/utils/data-utils"
import {getTrueEventCoordinates} from "@/utils/svg-utils"

// Stores
import {useDataStore} from "../../../store/DataStore"
import {usePCPStore} from "../../../store/PCPStore"

const PCPStore = usePCPStore()
const dataStore = useDataStore()

const {axisLength} = storeToRefs(PCPStore)
const emit = defineEmits(['onInteraction', 'onMouseEnter', 'onMouseLeave'])

const props = defineProps({
    category: Object,
    filter: Object,
    canvas: Object,
})

const capHeight = ref(6)

const y = computed(() => {
    if (props.filter.type === 'single-range') {
        return props.category.scaleLinear(props.filter.thresholdB)*axisLength.value
    } else if (props.filter.type === 'categoric') {
        return props.filter.lowerBoundRatio*axisLength.value
    } else {
        throw new Error('Encountered unknown filter type')
    }
})

const height = computed( () => {
    if (props.filter.type === 'single-range') {
        return (props.category.scaleLinear(props.filter.thresholdA)-props.category.scaleLinear(props.filter.thresholdB))*axisLength.value
    } else if (props.filter.type === 'categoric') {
        return (props.filter.upperBoundRatio - props.filter.lowerBoundRatio)*axisLength.value
    } else {
        throw new Error('Encountered unknown filter type')
    }
})

function moveFilterBlock (evt) {
    emit('onInteraction', {
        type: 'block',
        filter: props.filter, 
        category: props.category,
        start: getTrueEventCoordinates(evt, props.canvas).y
    });
}

function moveFilterTop () {
    emit('onInteraction', {
        type: 'edge',
        filter: props.filter, 
        category: props.category,
        start: y.value + height.value
    })
}

function moveFilterBot () {
    emit('onInteraction', {
        type: 'edge',
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
        z-index: 99;
        cursor: grab;
    }
    .filter-pull-box {
        x: -10px;
        width: 20px;
        fill: transparentize($color: blue, $amount: 0.8);
        cursor: row-resize;
    }
</style>