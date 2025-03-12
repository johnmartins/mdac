<template>
    <SidebarSection 
        title="Plot Options" 
        :start-maximized="false"
    >
        <div class="control-group">
            <div v-if="stateStore.activeView === 'pcp'" class="labeled-form mb-2" style="font-size: 0.8em;">
                <span>Rendering: </span>
                <select ref="lineFormatSelector" v-model="pcpStore.renderingType">
                    <option value="raster">Rasterized</option>
                    <option value="vector">Vectorized</option>
                </select>
            </div>

            <div v-if="stateStore.activeView === 'pcp' && pcpStore.renderingType==='raster'" class="labeled-form mb-2" style="font-size: 0.8em;">
                <span>Resolution: </span>
                <select ref="lineFormatSelector" v-model="pcpStore.resolution" @change="setResolutionManualOverride(true)">
                    <option :value="0.3">0.3 - Potato</option>
                    <option :value="0.5">0.5 - Terrible</option>
                    <option :value="0.8">0.8 - Bad</option>
                    <option :value="1.0">1.0 - OK</option>
                    <option :value="1.2">1.2 - Decent</option>
                    <option :value="1.5">1.5 - Sharp</option>
                    <option :value="2.0">2.0 - Excellent</option>
                </select>
            </div>

            <div v-if="stateStore.activeView === 'pcp'" class="labeled-form mb-2" style="font-size: 0.8em;">
                <span>Curve type: </span>
                <select ref="lineFormatSelector" v-model="optionsStore.curveType">
                    <option value="curve">Curve</option>
                    <option value="line">Line</option>
                </select>
            </div>

            <CheckboxInput v-model="optionsStore.showPcpLines">Show data lines</CheckBoxInput>
            <CheckboxInput v-model="optionsStore.showFilters">Show filters in plot</CheckboxInput>

            <NumberInput v-model="optionsStore.tickBackgroundOpacity" :step="0.05" :min="0" :max="1">
                Tick background opacity
            </NumberInput>

            <span class="title">Font size</span>
            <div class="format-forms">
                <NumberInput v-model="optionsStore.titleSize" class="me-2" :step="0.1" :max="5" :min="0">Title size:</NumberInput>
                <NumberInput v-model="optionsStore.tickSize" :step="0.1" :max="5" :min="0">Tick size:</NumberInput>
            </div>

            <span class="title">Data opacity</span>
            <div class="format-forms">
                <NumberInput v-model="optionsStore.includedDataOpacity" class="me-2" :step="0.05" :max="1" :min="0">Included:</NumberInput>
                <NumberInput v-model="optionsStore.excludedDataOpacity" :step="0.05" :max="1" :min="0" @change="setFilteredDataOpacity">Excluded:</NumberInput>
            </div>

            <div v-if="stateStore.activeView === 'pcp'">
                <span class="title">PCP layout - Padding</span>
                <div class="format-forms">
                    <NumberInput v-model="tmpOptions.plotTopPadding" class="me-2" :step="1" :min="0" :max="1000" @change="requestPcpRender">Top</NumberInput>
                    <NumberInput v-model="tmpOptions.plotBottomPadding" :step="1" :min="0" :max="1000" @change="requestPcpRender">Bottom</NumberInput>
                </div>
                <div class="format-forms">
                    <NumberInput v-model="tmpOptions.plotLeftPadding" class="me-2" :step="1" :min="0" :max="1000" @change="requestPcpRender">Left</NumberInput>
                    <NumberInput v-model="tmpOptions.plotRightPadding" :step="1" :min="0" :max="1000" @change="requestPcpRender">Right</NumberInput>
                </div>
                <span class="title">PCP layout - Axis labels</span>
                <div class="format-forms">
                    <NumberInput v-model="pcpStore.axisLabelMargin" class="me-2" :step="1" :min="0" :max="1000">Margin</NumberInput>
                    <NumberInput v-model="pcpStore.axisLabelAngle" :step="1" :min="0" :max="90">Angle</NumberInput>
                </div>
            </div>
        </div>
    </SidebarSection>
</template>

<script setup>
import { reactive, ref, inject } from "vue"

// Components
import NumberInput from '@/components/inputs/NumberInput.vue';
import SidebarSection from "@/components/layouts/SidebarSection.vue";

// Stores
import {useOptionsStore} from "@/store/OptionsStore";
import {usePCPStore} from "@/store/PCPStore";
import {useStateStore} from "@/store/StateStore";
import CheckboxInput from "@/components/inputs/CheckboxInput.vue";

// Store references
const optionsStore = useOptionsStore();
const pcpStore = usePCPStore();
const stateStore = useStateStore();

const eventBus = inject('eventBus');

// State
let pcpRenderTimeout = null;
const tmpOptions = reactive({
    plotTopPadding: 75,
    plotRightPadding: 150,
    plotBottomPadding: 120,
    plotLeftPadding: 75,
})

function setFilteredDataOpacity (evt) {
    optionsStore.setExcludedDataOpacity(parseFloat(evt.target.value));
}

function setResolutionManualOverride (override) {
    pcpStore.resolutionManualOverride = override;
}

async function requestPcpRender () {
    clearTimeout(pcpRenderTimeout);

    pcpRenderTimeout = setTimeout(async () => {
        pcpStore.plotTopPadding = parseFloat(tmpOptions.plotTopPadding);
        pcpStore.plotRightPadding = parseFloat(tmpOptions.plotRightPadding);
        pcpStore.plotBottomPadding = parseFloat(tmpOptions.plotBottomPadding);
        pcpStore.plotLeftPadding = parseFloat(tmpOptions.plotLeftPadding);
        eventBus.emit('Layout.contentResize');
    }, 500);
}

</script>

<style lang="scss" scoped>
    .title {
        font-weight: bold;
    }

    .format-forms {
        display: flex; 
        justify-content: space-between;
    }

</style>