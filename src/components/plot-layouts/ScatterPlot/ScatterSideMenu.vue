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
import PlotConfigForm from '@/components/sidemenu/scatter/PlotConfigForm.vue';
import PlotSelectionForm from '@/components/sidemenu/scatter/PlotSelectionForm.vue';
import FiltersPanel from '@/components/sidemenu/analysis/FiltersPanel.vue';
import SampleInfo from '@/components/sidemenu/import-export/SampleInfo.vue';
import ColorCodeForm from '@/components/sidemenu/analysis/ColorCodeForm.vue';
import ExportForm from '@/components/sidemenu/import-export/ExportForm.vue';
import OptionsForm from '@/components/sidemenu/settings/OptionsForm.vue';


</script>

<style lang="scss" scoped>

</style>