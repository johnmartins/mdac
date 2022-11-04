<template>
    <div class="filter-element-container" v-if="filter">

        <!-- single range filter -->
        <div class="single-range-filter-container" v-if="filter.type == 'single-range'">
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
                <span v-if="targetCategory" :title="targetCategory.displayTitle">{{targetCategory.displayTitle}}</span>
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
        </div>

        <!-- Categoric filter -->
        <div class="categoric-filter-container" v-if="filter.type == 'categoric'">
            <div class="overflow-ellipsis" :title="`${targetCategory.displayTitle} in ${Array.from(filter.includedValueSet).toString()}`">
                <span v-if="targetCategory" class="category-container">{{targetCategory.displayTitle}}</span>
                <span>
                    IN [
                    <span v-for="(v, index) in filter.includedValueSet" :key="index">
                    {{v}}<span v-if="index < (filter.includedValueSet.size - 1 )">, </span>    
                    </span>
                    ]
                </span>

            </div>
        </div>

        <div class="delete-container" @click.prevent="deleteFilter">
            X
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue"

import {useDataStore} from "@/store/DataStore"
import Category from '@/models/plots/Category'

const dataStore = useDataStore()

const props = defineProps({
    filterID: Number
})

const filter = ref(null)
const targetCategory = ref(null)

const componentParameters = reactive({
    stepSize: 0,
})

onMounted( () => {
    const filterID = parseInt(props.filterID)
    const f = dataStore.getFilterByID(filterID)
    filter.value = f

    targetCategory.value = Category.lookup(filter.value.columnID)
    componentParameters.stepSize = Math.pow(10, Math.floor(Math.log10(filter.value.thresholdA)))/100
})

function deleteFilter () {
    const f = filter.value
    dataStore.deleteFilter(f)
}

</script>

<style lang="scss" scoped>
    .filter-element-container {
        display: grid;
        grid-template-columns: auto 5px;
        font-size: 1em !important;
        font-family: monospace;
        white-space: nowrap;
    }

    .categoric-filter-container {
        display: grid;
        grid-template-columns: auto;
    }

    .single-range-filter-container {
        display: grid;
        grid-template-columns: 25% 8px auto 8px 25%; 

        input[type=number] {
            font-size: 0.85em;
            width: 100%;
            padding: 0 4px 0 4px;
            font-family: monospace;
            text-align: left;
            border: none;
        }
    }

    .category-container {
        font-weight: bold;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .overflow-ellipsis {
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .delete-container {
        cursor: pointer;
        color: red;
    }
</style>