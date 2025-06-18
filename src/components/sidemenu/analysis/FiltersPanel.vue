<template>
    <SidebarSection 
        title="Filters" 
        :start-maximized="true"
    >
        <div class="control-group">       
            <div v-if="Object.keys(filters).length > 0">
                <div v-for="(filterKey, index) in Object.keys(filters)" :key="index">
                    <FilterElement v-for="filter in filters[filterKey]" :key="filter.id" :filter-i-d="filter.id" />
                </div>
            </div>
            <div v-else>
                <span>No filters have been applied</span>
            </div>
        </div>
    </SidebarSection>
</template>

<script setup>
import { storeToRefs } from "pinia";

import { useDataStore } from "@/store/DataStore.js";

import FilterElement from '@/components/sidemenu/analysis/FilterElement.vue';
import SidebarSection from "@/components/layouts/SidebarSection.vue";

const dataStore = useDataStore();
const {data, filters} = storeToRefs(dataStore);


</script>

<style lang="scss" scoped>

</style>