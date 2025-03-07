<template>
<SidebarSection 
    title="Distribution Analysis" 
    :start-maximized="false"
>
    <div class="d-grid">

        <NumberInput 
            v-model="distributionBucketCount" 
            label="Bucket count" 
            :min="1" 
            :max="100" 
            :step="1"
        >Bucket count:</NumberInput>

        <button class="small" @click="runAnalysis">Run analysis</button>

    </div>

</SidebarSection>
</template>

<script setup>
import { storeToRefs } from "pinia";
import SidebarSection from "@/components/layouts/SidebarSection";

// Stores
import { useOptionsStore } from "@/store/OptionsStore";
import { useDataStore } from "@/store/DataStore";
import NumberInput from "@/components/inputs/NumberInput.vue";

const dataStore = useDataStore();

const { distributionBucketCount } = storeToRefs(dataStore);

function runAnalysis (applyFilters=true) {
    dataStore.distributionMap.clear();

    const buckets = parseInt(distributionBucketCount.value);
    console.log("Buckets: ", buckets);
    
    for (const c of dataStore.categories) {
        dataStore.distributionMap[c.title] = Array(buckets).fill(0);
        console.log(dataStore.distributionMap[c.title]);
    }

    console.log('Running distribution analysis');
    let data = dataStore.data;
    if (applyFilters) {
        data = dataStore.data.filter(d => dataStore.dataPointFilterCheck);
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

            dataStore.distributionMap[c.title][bucketIndex]++;
        }
    }

    console.log(dataStore.distributionMap);
}


</script>

<style lang="scss" scoped>

</style>
