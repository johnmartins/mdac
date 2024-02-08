<template>
    <div class="component-container">
        <div class="mv-grid-container">
            <div class="grid-row">
                <div class="grid-element"></div>
                <div class="grid-element" style="display: flex; align-items: center;" v-for="cxTitleCat in categories" :key="cxTitleCat.title" :title="cxTitleCat.title" >
                    
                    {{ cxTitleCat.title }}
                </div>
            </div>
            <div class="grid-row" v-for="cy in categories" :key="cy.title">
                <div class="grid-element" style="display: flex; align-items: center;" :title="cy.title">
                    {{ cy.title }}
                </div>
                <div class="grid-element" 
                    v-for="cx in categories" 
                    :key="cx.title" 
                    :title="`X: ${cx.title}, Y: ${cy.title}`" 
                >
                    <ScatterPlotPointLayerRaster 
                        :cx="cx" 
                        :cy="cy"
                        :dataArray="data"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>

import { useDataStore } from '@/store/DataStore';
import { storeToRefs } from 'pinia';

const dataStore = useDataStore();

const { categories, data } = storeToRefs(dataStore);

import ScatterPlotPointLayerRaster from '../ScatterPlot/ScatterPlotPointLayerRaster.vue';

</script>

<style lang="scss" scoped>

.mv-grid-container {
    color: black;
    
    max-width: calc(100vh - 40px);
    overflow: hidden;
    aspect-ratio: 1 / 1;
    padding: 16px;
    .grid-row{
        display: grid;
        grid-auto-columns: 1fr;
        background-color: lightgray;
        gap: 1px;
        border-bottom: 1px solid lightgray;
        border-right: 1px solid lightgray;
    }
    .grid-element {
        background-color: white;
        grid-row: 1;
        aspect-ratio: 1 / 1;
        text-overflow: ellipsis;
        font-size: 1em;
        white-space: nowrap;
        overflow: hidden;
    }
}

</style>
