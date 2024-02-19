<template>
    <SidebarSection 
        title="Color Coding" 
        :start-maximized="props.startMaximized"
    >
        <div class="control-group">
            <div class="labeled-form">                
                <span>Property:</span>
                <select 
                    v-model="selectedColorCodeCategory" 
                    @change="onColorCategoryChange"
                >
                    <option :value="null">None</option>
                    <option v-for="c in categories" :key="c.id" :value="c"> {{ c.displayTitle }}</option>
                </select>
            </div>
            <div class="control-group" title="If enabled, data points will be color-coded based on input similarity (euclidean proximity).">
                <div style="display: flex; justify-content: space-between; flex-direction: row;">
                    <label class="form-check-label m-0">
                        Use similarity color coding
                    </label>
                    <input
                        v-model="useSimilarityColorCoding"
                        type="checkbox" 
                        @change="onUseSimilarityColorCodingChange"
                    >
                </div>
            </div>

            <div class="control-group" title="If enabled, the plot will display a color code indicator.">
                <div style="display: flex; justify-content: space-between; flex-direction: row;">
                    <label class="form-check-label m-0">
                        Show color code legend
                    </label>
                    <input
                        v-model="showColorCodeLegend"
                        type="checkbox" 
                    >
                </div>
            </div>
        </div>
    </SidebarSection>
</template>

<script setup>
import { storeToRefs } from "pinia";
import SidebarSection from "@/components/layouts/SidebarSection";
import {useOptionsStore} from "@/store/OptionsStore";
import {useDataStore} from "@/store/DataStore";

const optionsStore = useOptionsStore();
const dataStore = useDataStore();

const {selectedColorCodeCategory, useSimilarityColorCoding, showColorCodeLegend} = storeToRefs(optionsStore);
const {categories} = storeToRefs(dataStore);

const props = defineProps({
    startMaximized: {
        type: Boolean,
        default: false
    }
})

function onColorCategoryChange (evt) {
    optionsStore.resetColorCodeOverride();
}

function onUseSimilarityColorCodingChange (evt) {
    optionsStore.resetColorCodeOverride();
}

</script>

<style lang="scss" scoped>

</style>