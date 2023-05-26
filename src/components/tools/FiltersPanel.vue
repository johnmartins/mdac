<template>
    <div class="card mt-3">
        <div class="control-group p-2">
            <strong>Filters</strong>
            
            <div v-if="Object.keys(filters).length > 0">
                <div v-for="(filterKey, index) in Object.keys(filters)" :key="index">
                    <FilterElement v-for="filter in filters[filterKey]" :key="filter.id" :filter-i-d="filter.id" />
                </div>
            </div>
            <div v-else>
                <span style="font-size: 0.8em;">No filters have been applied</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, inject } from "vue"
import { storeToRefs } from "pinia"

import {useDataStore} from "@/store/DataStore"
import FilterElement from '@/components/tools/FilterElement'

const dataStore = useDataStore()
const {data, filters} = storeToRefs(dataStore)


</script>

<style lang="scss" scoped>

</style>