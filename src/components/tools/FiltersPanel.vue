<template>
    <div class="card mt-3">
        <div class="control-group p-2">
            <strong>Filters</strong>
            
            <div v-if="filters.length > 0">
                <FilterElement v-for="filter in filters" :key="filter.id" :filter="filter"/>
            </div>
            <div v-else>
                <span style="font-size: 0.8em;">No filters have been applied</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, inject } from "vue"

import FilterElement from '@/components/tools/FilterElement'

const eventBus = inject('eventBus')
eventBus.on('PCPlot.addFilter', (f) => {
    filters.push(f)
})
eventBus.on('PCPlot.deleteFilter', (f) => {
    let deleteIndex = -1
    for (let i = 0; i < filters.length; i++) {
        if (filters[i].id === f.id) {
            deleteIndex = i
            break
        }
    }
    filters.splice(deleteIndex, 1)
})

const filters = reactive([])

</script>

<style lang="scss" scoped>

</style>