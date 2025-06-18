<template>
    <div class="side-menu-container">
        <SampleInfo />
        <FiltersPanel />
        <ColorCodeForm :start-maximized="true" />
    </div>
</template>

<script setup>
import FiltersPanel from '@/components/sidemenu/analysis/FiltersPanel.vue';
import SampleInfo from '@/components/sidemenu/import-export/SampleInfo.vue';
import ColorCodeForm from '@/components/sidemenu/analysis/ColorCodeForm.vue';


</script>

<style lang="scss" scoped>

</style>