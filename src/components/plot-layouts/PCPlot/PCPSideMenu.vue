<template>
    <div class="container side-menu-container">

        <SourceForm />
        <SampleInfo />
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
import SampleInfo from '@/components/tools/SampleInfo'

</script>

<style lang="scss" scoped>

</style>