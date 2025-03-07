<template>
<SidebarSection 
    title="Distribution Analysis" 
    :start-maximized="false"
>
    <div class="d-grid">

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

        <button class="small" @click="runAnalysis">Run analysis</button>

        <CheckboxInput v-model="optionsStore.showDistributions" title="Visualize distributions in parallel coordinates plot.">
            Show distributions
        </CheckboxInput>

    </div>

</SidebarSection>
</template>

<script setup>
import { nextTick, ref, watch } from "vue";
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
const useFilters = ref(true);

watch(() => dataStore.filterIDMap.size, onChange);

async function runAnalysis () {
    dataStore.distributionMap.clear();
    optionsStore.showDistributions = false;

    await nextTick();

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

    await nextTick();

    // Automatically show distributions after analysis.
    optionsStore.showDistributions = true;

    console.log(dataStore.distributionMap);
}

function onChange () {
    if (!optionsStore.showDistributions) {
        return;
    }

    runAnalysis();
}

</script>

<style lang="scss" scoped>

</style>
