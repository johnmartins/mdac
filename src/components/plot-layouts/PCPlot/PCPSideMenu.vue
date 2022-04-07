<template>
    <div class="container plot-tools-container">

        <SourceForm />
        <EditCategoryForm />
        <FiltersPanel />
        <OptionsForm />
        <ExportForm />

    </div>
</template>

<script setup>

import ExportForm from '@/components/tools/ExportForm'
import OptionsForm from '@/components/tools/OptionsForm'
import EditCategoryForm from '@/components/tools/EditCategoryForm'
import FiltersPanel from '@/components/tools/FiltersPanel'
import SourceForm from '@/components/tools/SourceForm'

</script>

<style lang="scss" scoped>
    .plot-tools-container {
        font-size: 0.8rem;
        overflow-y: auto;
    }
</style>