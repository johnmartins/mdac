<template>
    <div class="filter-element-container" v-if="filter">
        <div>
            <input type="number" 
            v-model="filter.thresholdA"
            :step="componentParameters.stepSize"
            />
        </div>
        <div>
            <span v-if="filter.thresholdA <= filter.thresholdB">&le;</span> <span v-else>&ge;</span>
        </div>
        <div class="category-container">
            <span v-if="categoryInfo.sourceObject">{{categoryInfo.displayTitle}}</span>
        </div>
        <div>
            <span v-if="filter.thresholdA <= filter.thresholdB">&le;</span> <span v-else>&ge;</span>
        </div>
        <div>
            <input type="number" 
            v-model="filter.thresholdB"
            :step="componentParameters.stepSize"
            />
            
        </div>
        <div class="delete-container" @click.prevent="deleteFilter">
            X
        </div>
    </div>
</template>

<script setup>
import { inject, ref, onMounted, reactive } from "vue"

import {useDataStore} from "@/store/DataStore"
import Category from '@/models/plots/Category'

const dataStore = useDataStore()

const props = defineProps({
    filterID: Number
})

const filter = ref(null)

const eventBus = inject('eventBus')
eventBus.on('EditCategoryForm.editCategory', (c) => {
    if (c.id == categoryInfo.sourceObject.id) {
        categoryInfo.displayTitle = c.displayTitle
    }
})

const categoryInfo = reactive({
    sourceObject: null,
    displayTitle: null
})

const componentParameters = reactive({
    stepSize: 0,
})

onMounted( () => {
    const filterID = parseInt(props.filterID)
    const f = dataStore.getFilterByID(filterID)
    filter.value = f

    categoryInfo.sourceObject = Category.lookup(filter.value.targetCategoryTitle)
    categoryInfo.displayTitle = categoryInfo.sourceObject.displayTitle
    componentParameters.stepSize = Math.pow(10, Math.floor(Math.log10(filter.value.thresholdA)))/100
})

function deleteFilter () {
    const f = filter.value
    dataStore.deleteFilter(f)
}

</script>

<style lang="scss" scoped>
    .filter-element-container {
        font-size: 1em !important;
        font-family: monospace;
        display: grid;
        grid-template-columns: 25% 8px auto 8px 25% 5px; 

        .category-container {
            font-weight: bold;
            text-align: left;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        input[type=number] {
            font-size: 0.85em;
            width: 100%;
            padding: 0 4px 0 4px;
            font-family: monospace;
            text-align: left;
            border: none;
        }

        .delete-container {
            cursor: pointer;
            color: red;
        }
    }
</style>