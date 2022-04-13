<template>
    <div class="container side-menu-container">
        <PlotSelectionForm />
        <SourceSelectionForm />
    </div>
</template>

<script setup>
import { ref } from "vue"
import { storeToRefs } from "pinia"
import {useDataStore} from "@/store/DataStore"

import SourceSelectionForm from '@/components/tools/scatter-tools/SourceSelectionForm'
import PlotSelectionForm from '@/components/tools/scatter-tools/PlotSelectionForm'

const dataStore = useDataStore()
const {data, filters, categories} = storeToRefs(dataStore)

</script>

<style lang="scss" scoped>

</style>