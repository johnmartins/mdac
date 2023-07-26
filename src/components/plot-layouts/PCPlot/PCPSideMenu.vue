<template>
    <div class="container side-menu-container">
        <SourceForm />
        <SampleInfo />
        <EditCategoryForm />
        <FiltersPanel />
        <OptionsForm />
        <ColorCodeForm />
        <SimilarityAnalysisPanel />
        <ExportForm />
    </div>
</template>

<script setup>

import ExportForm from '@/components/sidemenu/import-export/ExportForm'
import OptionsForm from '@/components/sidemenu/settings/OptionsForm'
import EditCategoryForm from '@/components/tools/EditCategoryForm'
import FiltersPanel from '@/components/sidemenu/analysis/FiltersPanel'
import SourceForm from '@/components/sidemenu/import-export/SourceForm'
import SampleInfo from '@/components/sidemenu/import-export/SampleInfo'
import ColorCodeForm from '@/components/sidemenu/analysis/ColorCodeForm'
import SimilarityAnalysisPanel from '@/components/sidemenu/analysis/SimilarityAnalysisPanel'

</script>

<style lang="scss" scoped>

</style>