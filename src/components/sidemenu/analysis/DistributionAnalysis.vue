<template>
<SidebarSection 
    title="Distribution Analysis" 
    :start-maximized="false"
>
    <div class="d-grid">

        <CheckboxInput 
            v-model="optionsStore.showDistributions" 
            title="Visualize distributions in parallel coordinates plot."
            @change="onChange"
            >
            Show distributions
        </CheckboxInput>

        <CheckboxInput 
            v-model="useFilters" 
            title="Apply filters to distribution calculation"
            @change="onChange"
        >
            Apply filters
        </CheckboxInput>

        <NumberInput 
            v-model="distributionBucketCount" 
            :min="1" 
            :max="100" 
            :step="1"
            @change="onChange"
        >
            Bucket count:
        </NumberInput>

        <NumberInput
            v-model="distributionFillOpacity"
            :min="0"
            :max="1"
            :step="0.05"
        >
            Fill opacity:
        </NumberInput>

        <NumberInput
            v-model="distributionStrokeOpacity"
            :min="0"
            :max="1"
            :step="0.05"
        >
            Edge opacity:
        </NumberInput>

        <ColorInput v-model="distributionFill">
            Fill color:
        </ColorInput>

        <ColorInput v-model="distributionStroke">
            Edge color:
        </ColorInput>

    </div>

</SidebarSection>
</template>

<script setup>
import { nextTick, ref, watch, inject } from "vue";
import { storeToRefs } from "pinia";

import SidebarSection from "@/components/layouts/SidebarSection.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import CheckboxInput from "@/components/inputs/CheckboxInput.vue";
import ColorInput from "@/components/inputs/ColorInput.vue";

// Stores
import { useOptionsStore } from "@/store/OptionsStore.js";
import { useDataStore } from "@/store/DataStore.js";


const dataStore = useDataStore();
const optionsStore = useOptionsStore();

const { distributionBucketCount } = storeToRefs(dataStore);
const { distributionFillOpacity, distributionStrokeOpacity, distributionFill, distributionStroke } = storeToRefs(optionsStore);

// State
const useFilters = ref(true);
let redrawTimeout = null;

// Listeners
const eventBus = inject('eventBus');

// Checks if filters are being edited in the PCP plot
eventBus.on('PCPlot.dragFilterDone', () => {
    if (useFilters.value === true) {
        onChange();
    }
});

eventBus.on('flipCategory', () => {
    onChange();
});

// Checks if new filters are being added, even in the scatter plot
watch(() => dataStore.filterIDMap.size, () => {
    if (useFilters.value === true) {
        onChange();
    }
});

async function runAnalysis () {
    if (optionsStore.showDistributions === false) {
        return;
    }

    // Allow the visualization to update
    optionsStore.showDistributions = false;
    dataStore.distributionMap.clear();
    await nextTick();

    // Perform distribution calculations
    const buckets = parseInt(distributionBucketCount.value);
    
    for (const c of dataStore.categories) {
        
        if (!c.usesCategoricalData) {
            // If continuous
            dataStore.distributionMap[c.title] = Array(buckets).fill(0);
        } else {
            // If categorical
            dataStore.distributionMap[c.title] = Array(c.availableCategoricalValues.length).fill(0);
        }
    }

    let data = dataStore.data;
    if (useFilters.value === true) {
        data = dataStore.data.filter(d => dataStore.dataPointFilterCheck(d));
    } 

    for (const dp of data) {
        for (const c of dataStore.categories) {

            let bucketIndex;

            if (!c.usesCategoricalData){
                bucketIndex = calculateContinuousDataBucket(dp, c, buckets);
            } else {
                bucketIndex = calculateCategoricalDataBucket(dp, c);
            }
            
            // Update stored distribution map used for visualization
            dataStore.distributionMap[c.title][bucketIndex]++;
        }
    }

    for (const c of dataStore.categories) {
        if (c.flipped === true) {
            // Flip the distribution map for the y-axis
            dataStore.distributionMap[c.title].reverse();
        }
    }

    // Update visualization
    await nextTick();
    optionsStore.showDistributions = true;
}

function calculateCategoricalDataBucket (dp, c) {
    const val = dp[c.title];
    return c.availableCategoricalValues.indexOf(val);
}


/**
 * Calculate which bucket index this continuous data point belongs to 
 */
function calculateContinuousDataBucket (dp, c, buckets) {
    let max = Math.max(c.lb, c.ub);   
    const min = Math.min(c.lb, c.ub);
    // Add RELATIVELY small number to include max values into final bucket
    max = max + (max - min) * 1e-6; 
    const val = dp[c.title];
    const bucketRange = (max - min)/(buckets);
    const x = (val - min) / bucketRange;
    const bucketIndex = Math.floor(x);
    return bucketIndex;
}

function onChange () {
    if (!optionsStore.showDistributions) {
        return;
    }

    if (redrawTimeout) {
        clearTimeout(redrawTimeout);
    }

    redrawTimeout = setTimeout(() => {
        runAnalysis();
    }, 100);
}

</script>

<style lang="scss" scoped>

</style>
