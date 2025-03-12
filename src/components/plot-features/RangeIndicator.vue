<template>
    <g v-if="column && showColorCodeLegend" class="range-indicator">
        <text 
            :style="{fontSize: `${optionsStore.rangeIndicatorTitleSize}em`}"
            class="title"
        >
            {{ column.displayTitle }}
        </text>
        <g :transform="`translate(0 ${tickMargin})`">
            <text 
                class="tick-ub"
                :style="{fontSize: `${optionsStore.rangeIndicatorTickSize}em`}"
                :x="barWidth + tickMargin"
            >
                {{ parseFloat(colorCodeUpperBound).toFixed(4) }}
            </text>

            <rect
                v-for="(color, index) in spectrumArray" 
                :key="index" 
                :fill="color" 
                :y="barHeight*resolution - (index+1) * barHeight" 
                :width="barWidth" 
                :height="barHeight"    
            />

            <text 
                class="text-lb"
                :style="{fontSize: `${optionsStore.rangeIndicatorTickSize}em`}"
                :x="barWidth + tickMargin" 
                :y="4*resolution"
            >
                {{ parseFloat(colorCodeLowerBound).toFixed(4) }}
            </text>
        </g>
    </g>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";

import { linspace } from "@/utils/data-utils";
import { useOptionsStore } from "../../store/OptionsStore";

const optionsStore = useOptionsStore();
const {colorCodeUpperBound, colorCodeLowerBound, showColorCodeLegend} = storeToRefs(optionsStore);

const resolution = 30;
const barWidth = 10;
const barHeight = 4;
const tickMargin = 8;

const column = computed(() => {
    // Ignore if data is categorical
    const c = optionsStore.getActiveColorCodeColumn();
    if (c && c.usesCategoricalData) return null;
    return optionsStore.getActiveColorCodeColumn();
})

const spectrumArray = computed(() => {
    if (!column.value) return [];
    
    let linearScale = linspace(colorCodeLowerBound.value, colorCodeUpperBound.value, resolution);
    let colorScale = [];
    for (let value of linearScale) {
        colorScale.push(optionsStore.getSampleColorWithValue(value));
    }
    return colorScale;
})


</script>

<style lang="scss" scoped>

.tick-ub {
    dominant-baseline: hanging;
}

.range-indicator {
    text {
        font-family: monospace;
    }
}

</style>