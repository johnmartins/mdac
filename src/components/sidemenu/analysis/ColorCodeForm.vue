<template>
    <SidebarSection 
        title="Color Coding" 
        :start-maximized="props.startMaximized"
    >
        <div class="control-group">
            <div class="labeled-form mb-2" style="font-size: 0.8em;">                
                <span>Property:</span>
                <select 
                    v-model="selectedColorCodeCategory" 
                    @change="onColorCategoryChange"
                >
                    <option :value="null">None</option>
                    <option v-for="c in categories" :key="c.id" :value="c"> {{ c.displayTitle }}</option>
                </select>
            </div>

            <CheckboxInput 
                v-model="useSimilarityColorCoding"
                title="If enabled, selected data points will be color-coded based on input similarity (euclidean proximity)."
            >
                Use similarity color coding
            </CheckboxInput>

            <strong>Color code legend</strong>
            
            <CheckboxInput 
                v-model="showColorCodeLegend"
                title="If enabled, the plot will display a color code indicator."
            >
                Show color code legend
            </CheckboxInput>

            <NumberInput
                v-model="optionsStore.rangeIndicatorTitleSize"
                :step="0.1"
                :min="0"
                :max="null"
            >
                Title font size:
            </NumberInput>

            <NumberInput
                v-model="optionsStore.rangeIndicatorTickSize"
                :step="0.1"
                :min="0"
                :max="null"
            >
                Tick font size:
            </NumberInput>

            <NumberInput
                v-model="optionsStore.rangeIndicatorVerticalOffset"
                :step="1"
                :min="null"
                :max="null"
            >
                Position vertical:
            </NumberInput>
            <NumberInput
                v-model="optionsStore.rangeIndicatorHorizontalOffset"
                :step="1"
                :min="null"
                :max="null"
            >
                Position horizontal
            </NumberInput>
        </div>
    </SidebarSection>
</template>

<script setup>
import { storeToRefs } from "pinia";
import SidebarSection from "@/components/layouts/SidebarSection";
import {useOptionsStore} from "@/store/OptionsStore";
import {useDataStore} from "@/store/DataStore";
import CheckboxInput from "@/components/inputs/CheckboxInput.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";

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