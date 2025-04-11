<template>
    <g>
        <rect 
            class="filter-box"
            :class="{'filter-box-delete': hovering && ctrl}"
            :y="y" 
            :height="height"
            @mousedown.stop.prevent="moveFilterBlock($event)"
            @mouseenter="onMouseEnter($event)"
            @mouseleave="onMouseLeave($event)"
            @click.ctrl.stop="onClickCtrl"
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
import { computed, ref, inject } from 'vue';
import { storeToRefs } from "pinia";

import Category from '@/models/plots/Category';

// Stores
import { usePCPStore } from "@/store/PCPStore";
import { useDataStore } from '@/store/DataStore';
import { useStateStore } from '@/store/StateStore';

const PCPStore = usePCPStore();
const dataStore = useDataStore();
const stateStore = useStateStore();

const { axisLength } = storeToRefs(PCPStore);
const { ctrl } = storeToRefs(stateStore);
const emit = defineEmits(['onInteraction', 'onMouseEnter', 'onMouseLeave']);
const eventBus = inject('eventBus');

const props = defineProps({
    category: Object,
    filter: Object,
    canvas: Object,
});

// Params
const capHeight = ref(6);

// State
const hovering = ref(false);
const y = computed(() => {
    if (props.filter.type === 'single-range') {

        let threshold = props.filter.thresholdB;

        // check if axis is flipped upside-down
        let c = Category.lookup(props.filter.columnID);
        if (c.lb - c.ub > 0) { 
            threshold = props.filter.thresholdA;
        }

        return props.category.scaleLinear(threshold)*axisLength.value
    } else if (props.filter.type === 'categoric') {
        return props.filter.lowerBoundRatio*axisLength.value
    } else {
        throw new Error('Encountered unknown filter type')
    }
})

const height = computed( () => {
    if (props.filter.type === 'single-range') {
        return Math.abs(props.category.scaleLinear(props.filter.thresholdA)-props.category.scaleLinear(props.filter.thresholdB))*axisLength.value
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
        mouseEvent: evt
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

function onClickCtrl () {
    dataStore.deleteFilter(props.filter);
    eventBus.emit('filterUpdate', props.filter);
}

function onMouseEnter (evt) {
    emit('onMouseEnter', props.filter);
    hovering.value = true;
}

function onMouseLeave (evt) {
    emit('onMouseLeave', props.filter);
    hovering.value = false;
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
        cursor: ns-resize;
    }
    .filter-box-delete {
        cursor: default !important;
        fill: red !important;
    }
</style>