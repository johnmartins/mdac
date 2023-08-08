<template>
    <SidebarSection 
        title="Sample info"
        :start-maximized="true"
    >
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
    </SidebarSection>
</template>

<script setup>

import { reactive, ref, onMounted, onUpdated } from "vue"
import { storeToRefs } from "pinia"

import {useDataStore} from "@/store/DataStore"
import SidebarSection from "@/components/layouts/SidebarSection.vue"

const dataStore = useDataStore()
const {data, filters, categories} = storeToRefs(dataStore)

</script>

<style lang="scss" scoped>

</style>