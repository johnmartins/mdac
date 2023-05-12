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

import ExportForm from '@/components/tools/ExportForm'
import OptionsForm from '@/components/tools/OptionsForm'
import EditCategoryForm from '@/components/tools/EditCategoryForm'
import FiltersPanel from '@/components/tools/FiltersPanel'
import SourceForm from '@/components/tools/SourceForm'
import SampleInfo from '@/components/tools/SampleInfo'
import ColorCodeForm from '@/components/tools/ColorCodeForm'
import SimilarityAnalysisPanel from '@/components/tools/analysis/SimilarityAnalysisPanel'

</script>

<style lang="scss" scoped>

</style>