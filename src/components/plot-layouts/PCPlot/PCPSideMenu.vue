<template>
    <div class="side-menu-container">
        <SourceForm />
        <SampleInfo />
        <EditCategoryForm />
        <FiltersPanel />
        <OptionsForm />
        <ColorCodeForm />
        <SimilarityAnalysisPanel />
        <DistributionAnalysis />
        <ExportForm />
    </div>
</template>

<script setup>

import ExportForm from '@/components/sidemenu/import-export/ExportForm.vue';
import OptionsForm from '@/components/sidemenu/settings/OptionsForm.vue';
import EditCategoryForm from '@/components/sidemenu/settings/EditCategoryForm.vue';
import FiltersPanel from '@/components/sidemenu/analysis/FiltersPanel.vue';
import SourceForm from '@/components/sidemenu/import-export/SourceForm.vue';
import SampleInfo from '@/components/sidemenu/import-export/SampleInfo.vue';
import ColorCodeForm from '@/components/sidemenu/analysis/ColorCodeForm.vue';
import SimilarityAnalysisPanel from '@/components/sidemenu/analysis/SimilarityAnalysisPanel.vue';
import DistributionAnalysis from '@/components/sidemenu/analysis/DistributionAnalysis.vue';

</script>

<style lang="scss" scoped>

</style>