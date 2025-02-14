<template>
    <g v-if="PCPStore.renderingType === 'vector'" stroke-width="1" fill="transparent" :transform="`translate(0 ${plotYBounds[0]})`">
        <g v-if="!optionsStore.hideExcluded">
            <path
                v-for="(d, index) in data.filter(dp => !dataStore.dataPointFilterCheck(dp))" 
                :key="index" 
                stroke="#bfbfbf"
                :stroke-opacity="optionsStore.excludedDataOpacity"
                :d="lineGenerator(d)"
            />
        </g>
        
        <path
            v-for="(d, index) in data.filter(dp => dataStore.dataPointFilterCheck(dp))" 
            :key="index" 
            :excluded="true"
            :stroke="getLineColor(d)"
            :stroke-opacity="optionsStore.includedDataOpacity"
            :d="lineGenerator(d)"
        />
    </g>
</template>

<script setup>
import { storeToRefs } from "pinia";

import { lineGenerator } from "@/utils/data-utils";

// Stores
import { useDataStore } from "@/store/DataStore";
import { usePCPStore } from "@/store/PCPStore";
import { useOptionsStore } from "@/store/OptionsStore";

// Store references
const dataStore = useDataStore();
const PCPStore = usePCPStore();
const optionsStore = useOptionsStore();

// Store refs
const { plotYBounds } = storeToRefs(PCPStore);
const { data } = storeToRefs(dataStore);


function getLineColor (d) {
    return optionsStore.getSampleColor(d);
}

</script>

<style lang="scss" scoped>

</style>