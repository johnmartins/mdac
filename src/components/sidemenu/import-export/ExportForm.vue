<template>
    <SidebarSection 
        title="Export" 
        :start-maximized="false"
    >
        <div class="control-group">
            <strong>Plot export</strong>
            <div class="labeled-form" style="font-size: 0.8em;">
                <span>Format: </span>
                <select ref="formatSelector" @change="onImageFormatChange">
                    <option value="png">Image (PNG)</option>
                    <option value="svg">Vector graphics (SVG)</option>
                </select>
            </div>
            <div class="d-grid gap-2 mt-2">
                <button class="small" @click="exportRequest">Download Image</button>
            </div>
        </div>
        <div class="control-group">
            <strong>Data export</strong>

            <CheckboxInput v-model="includeFilteredData" title="Checking this box will export data that has been excluded using filters">
                Include all data
            </CheckboxInput>

            <div class="d-grid gap-2 mt-2">
                <button class="small" @click="exportDataRequest(includeFilteredData)">Download Data CSV</button>
            </div>
        </div>
        <div class="control-group">
            <strong>Filter export</strong>

            <CheckboxInput v-model="nearLimitAsInf" title="Checking this box will interpret filters that are out of bounds as infinity">
                Interpret out-of-bounds limits as inf" 
            </CheckboxInput>

            <div class="d-grid gap-2 mt-2">
                <button class="small" @click="exportFilterRequest(nearLimitAsInf)">Download Filter CSV</button>
            </div>
        </div>
    </SidebarSection>
</template>

<script setup>
import { ref, inject, watch } from "vue";
import { storeToRefs } from "pinia";

import SidebarSection from "@/components/layouts/SidebarSection.vue";

import { useDataStore } from "@/store/DataStore";
import { usePCPStore } from "@/store/PCPStore";
import { min } from "d3";
import CheckboxInput from "@/components/inputs/CheckboxInput.vue";

const dataStore = useDataStore();
const pcpStore = usePCPStore();

const { renderingType } = storeToRefs(pcpStore);

// DOM references
const filteredDataCheckbox = ref(null);
const formatSelector = ref(null);

// State
const includeFilteredData = ref(false);
const nearLimitAsInf = ref(true);

const eventBus = inject('eventBus');

watch(renderingType, () => {
    if (renderingType.value === 'vector') {
        formatSelector.value.value = 'svg';
    } else {
        formatSelector.value.value = 'png';
    }
})

function onImageFormatChange (evt) {
    if (evt.target.value === 'svg') {
        pcpStore.renderingType = 'vector';
    } else {
        pcpStore.renderingType = 'raster';
    }
}

function exportRequest (evt) {
    eventBus.emit('ExportForm.exportFigureRequest', formatSelector.value.value);
}

function exportDataRequest (includeFiltered) {
    // Get data
    let data = [];
    if (includeFiltered) {
        data = dataStore.data;
    } else {
        data = dataStore.data.filter(dataStore.dataPointFilterCheck);
    }

    // Parse and convert to CSV
    let csvRowArray = [];

    // Add header
    let headerStrArray = [];
    for (let c of dataStore.categories) {
        headerStrArray.push(c.displayTitle);
    }
    csvRowArray.push(headerStrArray.join(";"));

    // Add data
    for (let d of data) {
        let valueStrArray = []

        for (let c of dataStore.categories) {   // TODO: This is slow
            let valueStr = "";
            let value = d[c.title];

            if (!value) { 
                valueStrArray.push(valueStr) ;
                continue;
            }
            if (c.usesCategoricalData) {
                valueStrArray.push("\"" + String(value) + "\"");
                continue;
            }

            valueStrArray.push(value);
        }

        csvRowArray.push(valueStrArray.join(";"));
    }

    const csvStr = csvRowArray.join("\n");
    
    // Download csvStr as csv-file
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = 'mdac-data.csv';
    a.click();
}

function getFilterThresholds(filter) {
    const minVal = filter.thresholdA <= filter.thresholdB ? filter.thresholdA : filter.thresholdB;
    const maxVal = filter.thresholdA > filter.thresholdB ? filter.thresholdA : filter.thresholdB;
    return [minVal, maxVal];
}

function nearLimitConversion(minmax, filter) {

    const category = dataStore.getCategoryWithName(filter.columnID);

    if (!category) {
        throw new Error('Failed to identify filter category for filter with columnID ' + filter.columnID + '.');
    }

    const minmaxArray = getFilterThresholds(filter);
    let minVal = minmaxArray[0];
    let maxVal = minmaxArray[1];

    if (minVal < category.lb) {
        minVal = '"neginf"';
    }
    if (maxVal > category.ub) {
        maxVal = '"inf"';
    }

    return minmax === 'min' ? minVal : maxVal;
}

function exportFilterRequest (nearLimitAsInf) {
    let headerRow = ['category','min','max','included'];
    let csvRowArray = [headerRow.join(';')];

    dataStore.categories.forEach(category => {
        let filterArray = dataStore.filters[category.title];

        if (!filterArray) {
            return;
        }

        filterArray.forEach(filter => {

            let filterData = [`"${category.title}"`, '"N/A"', '"N/A"', '"N/A"'];

            if (filter.type === 'categoric') {
                let includedValues = [];
                filter.includedValueSet.forEach(value => {
                    includedValues.push(value);
                });
                filterData[3] = includedValues.join(',');
            } else if (filter.type === 'single-range') {
                filterData[1] = nearLimitAsInf ? nearLimitConversion('min', filter) : getFilterThresholds(filter)[0];
                filterData[2] = nearLimitAsInf ? nearLimitConversion('max', filter) : getFilterThresholds(filter)[1];
            } else {
                throw new Error(`Failed to export filters. Reason: unhandled filter type ${filter.type}.`);
            } 

            csvRowArray.push(filterData.join(';'));

        });

        const csvStr = csvRowArray.join("\n");

        // Download csvStr as csv-file
        const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = 'mdac-filters.csv';
        a.click();
    });

}

</script>

<style style="scss" scoped>
    
</style>