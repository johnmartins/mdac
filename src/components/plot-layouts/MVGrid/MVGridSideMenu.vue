<template>
    <div class="side-menu-container">
        <SampleInfo />
        <FiltersPanel />
        <ColorCodeForm :start-maximized="true" />
    </div>
</template>

<script setup>
import FiltersPanel from '@/components/sidemenu/analysis/FiltersPanel'
import SampleInfo from '@/components/sidemenu/import-export/SampleInfo'
import ColorCodeForm from '@/components/sidemenu/analysis/ColorCodeForm'


</script>

<style lang="scss" scoped>

</style>