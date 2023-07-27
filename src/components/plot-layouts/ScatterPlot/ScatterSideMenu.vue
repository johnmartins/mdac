<template>
    <div class="side-menu-container">
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
import PlotConfigForm from '@/components/sidemenu/scatter/PlotConfigForm'
import PlotSelectionForm from '@/components/sidemenu/scatter/PlotSelectionForm'
import FiltersPanel from '@/components/sidemenu/analysis/FiltersPanel'
import SampleInfo from '@/components/sidemenu/import-export/SampleInfo'
import ColorCodeForm from '@/components/sidemenu/analysis/ColorCodeForm'
import ExportForm from '@/components/sidemenu/import-export/ExportForm'
import OptionsForm from '@/components/sidemenu/settings/OptionsForm'


</script>

<style lang="scss" scoped>

</style>