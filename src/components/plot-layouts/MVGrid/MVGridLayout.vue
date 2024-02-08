<template>
    <div class="component-container" v-show="activeView==='mvgrid'">
        <div class="mv-grid-container">
            <div class="grid-row">
                <div class="grid-element grid-title-element"></div>
                <div class="grid-element" style="display: flex; justify-content: center; align-items: center;" v-for="cxTitleCat, xIndex in categories" :key="cxTitleCat.title" :title="cxTitleCat.title" >
                    {{ getCatIdentifier(xIndex) }}
                </div>
            </div>
            <div class="grid-row" v-for="cy, yIndex in categories" :key="cy.title">
                <div class="grid-element grid-title-element" style="display: flex; align-items: center;" :title="cy.title">
                    {{ `${getCatIdentifier(yIndex)}: ${cy.title}` }}
                </div>
                <div class="grid-element" 
                    v-for="cx in categories" 
                    :key="cx.title" 
                    :title="`X: ${cx.title}, Y: ${cy.title}`" 
                >
                    <ScatterPlotPointLayerRaster 
                        :cx="cx" 
                        :cy="cy"
                        :dataArray="includedData"
                        :renderCondition="checkViewActive"
                        ref="rasterElementArray"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>

import { nextTick, ref, watch, inject } from 'vue';
import { useDataStore } from '@/store/DataStore';
import { useStateStore } from '@/store/StateStore';
import { useOptionsStore } from '@/store/OptionsStore';
import { storeToRefs } from 'pinia';
import Filter from '@/models/filters/Filter';

import ScatterPlotPointLayerRaster from '../ScatterPlot/ScatterPlotPointLayerRaster.vue';

const dataStore = useDataStore();
const stateStore = useStateStore();
const optionsStore = useOptionsStore();

const { categories, data } = storeToRefs(dataStore);
const { activeView, reRenderMvGrid } = storeToRefs(stateStore);

// DOM
const rasterElementArray = ref(null);

// State
const includedData = ref([]);
const excludedData = ref([]);

// Events
const eventBus = inject('eventBus');
eventBus.on('SourceForm.readData', () => {
    reRenderMvGrid.value = true;
})

watch(activeView, async () => {
    if (activeView.value === 'mvgrid' && reRenderMvGrid.value === true) {
        console.log("Force render.")
        await nextTick();
        forceRenderGrid();
    }
});

watch(reRenderMvGrid, () => {
    if (activeView.value === 'mvgrid' && reRenderMvGrid.value === true) {
        forceRenderGrid();
    }
});

function checkViewActive () {
    if (activeView.value === 'mvgrid') {
        return true;
    } else {
        return false;
    }
}

function parseData () {
    includedData.value = [];
    excludedData.value = [];

    for (let i = 0; i < data.value.length; i++) {
        let d = data.value[i];

        // Check if included
        if (dataStore.dataPointFilterCheck(d)) {
            includedData.value.push(d);
        } else {
            excludedData.value.push(d);
        }   
    }
}

async function forceRenderGrid () {
    console.log("force render grid")
    if (reRenderMvGrid.value === true) {
        reRenderMvGrid.value = false;
    }

    parseData();
    for (let rasterElement of rasterElementArray.value) {
        await rasterElement.resizeCanvas();
    }
}

function getCatIdentifier (index) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (index < alphabet.length) {
        return alphabet[index];
    } else if (index < alphabet.length * (alphabet.length + 1)) {
        return alphabet[Math.floor(index / alphabet.length) - 1] + alphabet[index % alphabet.length];
    } else {
        return index;
    }
}

</script>

<style lang="scss" scoped>

.mv-grid-container {
    color: black;
    max-width: calc(100vh + 40px);
    overflow: hidden;
    padding: 16px;
    .grid-row {
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
    
        &.grid-title-element {
            aspect-ratio: unset;
            grid-column: 1 / span 4;
        }
    }
}

</style>
