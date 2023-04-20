<template>
    <div class="container side-menu-container">

        <SourceForm />
        <SampleInfo />
        <EditCategoryForm />
        <FiltersPanel />
        <OptionsForm />
        <ColorCodeForm />
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

</script>

<style lang="scss" scoped>

</style>