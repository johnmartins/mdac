<template>
    <div class="card mt-3">
        <div class="control-group p-2">
            <strong>Data selection</strong>
            <div class="labeled-form">                
                <span>X-axis:</span>
                <select ref="xAxisSelector" @change="changeConfig">
                    <option :value="null" selected>None</option>
                    <option v-for="category in categories" :value="category.title" :key="category.id"> {{category.displayTitle}}</option>
                </select>
            </div>
            <div class="labeled-form">                
                <span>Y-axis:</span>
                <select ref="yAxisSelector" @change="changeConfig">
                    <option :value="null" selected>None</option>
                    <option v-for="category in categories" :value="category.title" :key="category.id"> {{category.displayTitle}}</option>
                </select>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue"
import { storeToRefs } from "pinia"
import {useDataStore} from "@/store/DataStore"

const dataStore = useDataStore()
const {data, filters, categories} = storeToRefs(dataStore)

// DOM References
const xAxisSelector = ref(null)
const yAxisSelector = ref(null)

function changeConfig () {
    console.log("Config changed")
}

</script>

<style lang="scss" scoped>

</style>