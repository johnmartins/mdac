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
            label="Bucket count" 
            :min="1" 
            :max="100" 
            :step="1"
            @change="onChange"
        >
            Bucket count:
        </NumberInput>

    </div>

</SidebarSection>
</template>

<script setup>
import { nextTick, ref, watch, inject } from "vue";
import { storeToRefs } from "pinia";
import SidebarSection from "@/components/layouts/SidebarSection";

// Stores
import { useOptionsStore } from "@/store/OptionsStore";
import { useDataStore } from "@/store/DataStore";
import NumberInput from "@/components/inputs/NumberInput.vue";
import CheckboxInput from "@/components/inputs/CheckboxInput.vue";

const dataStore = useDataStore();
const optionsStore = useOptionsStore();

const { distributionBucketCount } = storeToRefs(dataStore);

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
        dataStore.distributionMap[c.title] = Array(buckets).fill(0);
    }

    let data = dataStore.data;
    if (useFilters.value === true) {
        data = dataStore.data.filter(d => dataStore.dataPointFilterCheck(d));
    } 

    for (const dp of data) {
        for (const c of dataStore.categories) {
            if (c.usesCategoricalData) continue;
            let max = Math.max(c.lb, c.ub);   
            const min = Math.min(c.lb, c.ub);
            // Add RELATIVELY small number to include max values into final bucket
            max = max + (max - min) * 1e-6; 
            const val = dp[c.title];
            const bucketRange = (max - min)/(buckets);
            const x = (val - min) / bucketRange;
            const bucketIndex = Math.floor(x);

            // Update stored distribution map used for visualization
            dataStore.distributionMap[c.title][bucketIndex]++;
        }
    }

    // Update visualization
    await nextTick();
    optionsStore.showDistributions = true;
}

function onChange () {
    console.log("knock knock");
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
