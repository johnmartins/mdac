<template>
    <div class="container side-menu-container">
        <PlotSelectionForm />
        <PlotConfigForm />
        <SampleInfo />
        <FiltersPanel />
    </div>
</template>

<script setup>
import PlotConfigForm from '@/components/tools/scatter-tools/PlotConfigForm'
import PlotSelectionForm from '@/components/tools/scatter-tools/PlotSelectionForm'
import FiltersPanel from '@/components/tools/FiltersPanel'
import SampleInfo from '@/components/tools/SampleInfo'
</script>

<style lang="scss" scoped>

</style>