<template>

<!-- Axis vertical line -->
<line x1="0" y1="0" x2="0" :y2="truncateDecimals(props.plotYBounds[1]-(plotBottomPadding),2)" />

<!-- Hitbox -->
<rect 
    class="filter-hitbox"
    :class="{
        highlighted: getSelectedCategoryTitle() == c.title,
        pulling: interactionType === 'edge',
        grabbing: interactionType === 'block'
    }" 
    :height="truncateDecimals(props.axisLength+40, 1)"
    @click="onClickAxis($event, c)"
    @dblclick="onDblClickAxis($event, c)"
    @mousedown.prevent="dragFilterStart($event, c)"
/>

<!-- Axis label -->
<text 
    :y="truncateDecimals(props.plotYBounds[1]-(plotBottomPadding-axisLabelMargin),1)" 
    class="title" 
    :style="{fontSize: `${optionsStore.titleSize}em`}"
    :transform="`rotate(${axisLabelAngle} 0 ${truncateDecimals(props.plotYBounds[1]-(plotBottomPadding-axisLabelMargin),1)})`"
    @click="onClickAxis($event, c)"
    @dblclick="onDblClickAxis($event, c)"
>
    {{ c.displayTitle }}
</text>

<!-- Axis tick group -->
<g v-for="(tick, index) in c.getTickArray()" :key="index" class="tick"> 
    <text x="-10" :y="c.scaleLinear(tick)*props.axisLength" class="tick-string" :style="{fontSize: `${optionsStore.tickSize}em`}">{{ c.getTickString(tick) }}</text>
    <line x1="0" :y1="c.scaleLinear(tick)*props.axisLength" x2="-5" :y2="c.scaleLinear(tick)*props.axisLength" />	
    <!-- Top tick -->
</g>

<!-- Axis Filters -->
<g v-if="optionsStore.showFilters">
    <g v-for="(f, index) in filters[c.title]" :key="index">
        <PCPlotFilter 
            :filter="f" 
            :category="c" 
            :canvas="props.canvas"
            @onInteraction="onFilterInteraction" 
        />
    </g>
</g>

<!-- Proto axis filters -->
<g v-if="currentFilterCategory && currentFilterDeltaTime > filterMinDragTime">
    <g v-if="currentFilterCategory.title === c.title">
        <rect 
            class="filter-box-proto"
            :y="truncateDecimals(Math.min(currentFilterStartValue, currentFilterEndValue) - plotTopPadding, 1)"
            :height="truncateDecimals(Math.abs(currentFilterEndValue - currentFilterStartValue), 1)"
        />
    </g>
</g>

<!-- Distribution analysis -->
<g v-if="!c.usesCategoricalData && optionsStore.showDistributions && dataStore.distributionMap[c.title]">
    <rect
        class="distribution-box" 
        v-for="(count, index) in dataStore.distributionMap[c.title]"
        :key="index"
        x="1"
        :y="props.axisLength - (index / dataStore.distributionBucketCount) * props.axisLength - props.axisLength/dataStore.distributionBucketCount" 
        :width="(count/Math.max(...dataStore.distributionMap[c.title])) * horizontalOffset * 0.9"
        :height="props.axisLength / dataStore.distributionBucketCount"
        :fill-opacity="optionsStore.distributionFillOpacity"
        :fill="optionsStore.distributionFill"
        :stroke="optionsStore.distributionStroke"
        :stroke-opacity="optionsStore.distributionStrokeOpacity"
    />
</g>
<g v-else-if="c.usesCategoricalData && optionsStore.showDistributions && dataStore.distributionMap[c.title]">
    <rect 
        class="distribution-box"
        v-for="(count, index) in dataStore.distributionMap[c.title]"
        :key="index"
        x="1"
        :y="index * props.axisLength/c.availableCategoricalValues.length"
        :width="(count/Math.max(...dataStore.distributionMap[c.title])) * horizontalOffset * 0.9"
        :height="props.axisLength / c.availableCategoricalValues.length"
        :fill-opacity="optionsStore.distributionFillOpacity"
        :fill="optionsStore.distributionFill"
        :stroke="optionsStore.distributionStroke"
        :stroke-opacity="optionsStore.distributionStrokeOpacity"  
    />
</g>
</template>

<script setup>
import { inject } from "vue";
import { storeToRefs } from "pinia";

// Utils
import { getTrueEventCoordinates } from "@/utils/svg-utils.js";
import { truncateDecimals } from "@/utils/data-utils.js";

import PCPlotFilter from "./PCPlotFilter.vue";

// Stores
import { useDataStore } from "@/store/DataStore.js";
import { usePCPStore } from "@/store/PCPStore.js";
import { useOptionsStore } from "@/store/OptionsStore.js";
import { useStateStore } from "@/store/StateStore.js";

const eventBus = inject('eventBus');

// Stores
const dataStore = useDataStore();
const PCPStore = usePCPStore();
const optionsStore = useOptionsStore();
const stateStore = useStateStore();

const { filters } = storeToRefs(dataStore);
const { selectedCategory } = storeToRefs(stateStore);
const { axisLabelMargin, axisLabelAngle, plotTopPadding, plotBottomPadding, 
    currentFilterStartTime, currentFilterCategory, currentFilterDeltaTime, 
    currentFilterStartValue, currentFilterEndValue, filterMinDragTime, 
    mousedown, clickOnCooldown, filterToRemove, blockOriginCoordinates, 
    interactionType, horizontalOffset } = storeToRefs(PCPStore);

const props = defineProps({
    axisLength: Number,
    c: Object,  // Category represented by this axis
    canvas: Object,
    plotYBounds: Array,
});

function onClickAxis (evt, c) {
    if (clickOnCooldown.value === true) return;
    if (mousedown.value === true) return;
    // Manage selected category
    if (selectedCategory.value && selectedCategory.value.title === c.title) {
        selectedCategory.value = null;
    } else {
        selectedCategory.value = c;
    }	
	
    // Remove focus from any form element to prevent erronious user input
    props.canvas.focus();

    if (evt.ctrlKey) {
        return flipAxis(c);
    }

    if (evt.shiftKey) {
        return setColorCodeCategory(c);
    }
}

function onDblClickAxis (evt, c) {
    setColorCodeCategory(c);
}

function setColorCodeCategory (c) {
    if (!optionsStore.selectedColorCodeCategory) {
        optionsStore.selectedColorCodeCategory = c;
        optionsStore.resetColorCodeOverride();
        return;
    }

    if (optionsStore.selectedColorCodeCategory.id === c.id) {
        optionsStore.selectedColorCodeCategory = null;
        optionsStore.resetColorCodeOverride();
        return;
    }

    optionsStore.selectedColorCodeCategory = c;
    optionsStore.resetColorCodeOverride();
}

function dragFilterStart (evt, c) {
    mousedown.value = true;
    const loc = getTrueEventCoordinates(evt, props.canvas);
    currentFilterCategory.value = c;
    currentFilterStartValue.value = loc.y;
    currentFilterStartTime.value = Date.now();
    currentFilterDeltaTime.value = 0;
}

function flipAxis (c) {
    c.flip();

    if (c.usesCategoricalData) {
        recreateCategoricFilters(c);
    }

    requestRasterRedraw();
    eventBus.emit('flipCategory');
}

function onFilterInteraction (evt) {
    if (evt.type === 'edge') {
        handleFilterEdgeInteraction(evt);
    } else if (evt.type === 'block') {
        handleFilterBlockInteraction(evt);
    } else {
        throw new Error('Unknown filter interaction type');
    }
}

function handleFilterBlockInteraction (evt) {
    if (mousedown.value === false) {
        blockOriginCoordinates.value = getTrueEventCoordinates(evt.mouseEvent, props.canvas).y;
    }

    interactionType.value = 'block';
    mousedown.value = true;
    currentFilterCategory.value = evt.category;
    currentFilterStartValue.value = evt.start;
    currentFilterEndValue.value = evt.start;
    currentFilterStartTime.value = Date.now();
    currentFilterDeltaTime.value = 0;
    filterToRemove.value = evt.filter;		// Mark the original filter for deletion
}

function handleFilterEdgeInteraction (evt) {
    interactionType.value = 'edge';
    mousedown.value = true;
    currentFilterCategory.value = evt.category;
    currentFilterStartValue.value = evt.start + plotTopPadding.value;
    currentFilterStartTime.value = Date.now();
    currentFilterDeltaTime.value = 0;
    filterToRemove.value = evt.filter;		// Mark the original filter for deletion
}

function requestRasterRedraw () {
    eventBus.emit('PCPRasterLayer.RequestPCPRedraw');
}

function getSelectedCategoryTitle () {
    return selectedCategory.value ? selectedCategory.value.title : null;
}

</script>

<style lang="scss" scoped>

.axis {
    text {
        fill: black;
        stroke-opacity: 0;
    }

    line {
        stroke: black;
        fill-opacity: 0;
    }

    .filter-box {
        x: -8px;
        width: 16px; 
    }

    .filter-box-proto {
        x: -8px;
        width: 16px;
    }

    .filter-hitbox {
        stroke: transparent;
        fill: transparent;
        x: -10px;
        y: -20px;
        width: 20px;

        &:hover {
            stroke: rgb(0, 0, 0);
            fill: rgba(255,255,255, 0.05);
        }

        cursor: pointer;
    }

    .title {
        x: 0px;
        text-anchor: start;
        cursor: pointer;
    }

    .tick-string {
        text-anchor: end;
        dominant-baseline: middle;
        font-weight: bold;
        pointer-events: none;
        filter: (url(#solid))
    }
}

.axis:hover {
    .title {
        fill: darkblue;
        font-weight: bold;
    }

    line {
        stroke-width: 2px;
        stroke: darkblue;
    }
    
}

.highlighted {
    .title {
        fill: darkblue;
        font-weight: bold;
    }

    line {
        stroke-width: 2px;
        stroke: darkblue;
    }
}

.distribution-box {
    pointer-events: none;
}
</style>
