<template>
    <div class="card mt-3 p-2" style="text-align: left;">
        <strong>Data info</strong>
        <div class="information-box">                
            <span class="title">Samples: </span>
            <span class="value">{{ data.length }}</span>
        </div>
        <div class="information-box">                
            <span class="title">Visible samples: </span>
            <span class="value">{{ data.filter(dataStore.dataPointFilterCheck).length }}</span>
        </div>
        <div class="information-box">                
            <span class="title">Filtered samples: </span>
            <span class="value">{{ data.length - data.filter(dataStore.dataPointFilterCheck).length }}</span>
        </div>
    </div>
</template>

<script setup>

import { reactive, ref, onMounted, onUpdated } from "vue"
import { storeToRefs } from "pinia"

import {useDataStore} from "@/store/DataStore"

const dataStore = useDataStore()
const {data, filters, categories} = storeToRefs(dataStore)

</script>

<style lang="scss" scoped>

</style>