<template>
    <div class="container side-menu-container">
        <PlotSelectionForm />
        <PlotConfigForm />
        <SampleInfo />
        <FiltersPanel />
        <OptionsForm />
        <ColorCodeForm />
        <ExportForm />
    </div>
</template>

<script setup>
import PlotConfigForm from '@/components/tools/scatter-tools/PlotConfigForm'
import PlotSelectionForm from '@/components/tools/scatter-tools/PlotSelectionForm'
import FiltersPanel from '@/components/tools/FiltersPanel'
import SampleInfo from '@/components/tools/SampleInfo'
import ColorCodeForm from '@/components/tools/ColorCodeForm'
import ExportForm from '@/components/tools/ExportForm'
import OptionsForm from '@/components/tools/OptionsForm'


</script>

<style lang="scss" scoped>

</style>