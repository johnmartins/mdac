<template>
    <div class="container side-menu-container">
        <PlotSelectionForm />
        <PlotConfigForm />
    </div>
</template>

<script setup>
import { ref } from "vue"
import { storeToRefs } from "pinia"
import {useDataStore} from "@/store/DataStore"

import PlotConfigForm from '@/components/tools/scatter-tools/PlotConfigForm'
import PlotSelectionForm from '@/components/tools/scatter-tools/PlotSelectionForm'

const dataStore = useDataStore()
const {data, filters, categories} = storeToRefs(dataStore)

</script>

<style lang="scss" scoped>

</style>