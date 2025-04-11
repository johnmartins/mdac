<template>
    <div 
        ref="canvasContainer" 
        style="width: 100%; height: 100%;" 
        :style="{paddingTop: `${plotYBounds[0]}px`, paddingLeft: `${plotXBounds[0]}px`}" 
    />
</template>

<script setup>
import { onMounted, ref, inject, watch, nextTick, onUnmounted } from "vue";
import { storeToRefs } from "pinia";

import { lineGenerator } from "@/utils/data-utils";

// Stores
import { useDataStore } from "@/store/DataStore";
import { usePCPStore } from "@/store/PCPStore";
import { useOptionsStore } from "@/store/OptionsStore";
import { useStateStore } from "@/store/StateStore";

defineExpose({
    generateDataUrl
})

// Store references
const dataStore = useDataStore();
const PCPStore = usePCPStore();
const optionsStore = useOptionsStore();
const stateStore = useStateStore();

// Store refs
const { plotYBounds, plotXBounds, resolution } = storeToRefs(PCPStore);
const { includedDataOpacity, excludedDataOpacity, curveType, selectedColorCodeCategory, overrideColorCodeColumn } = storeToRefs(optionsStore);
const {data} = storeToRefs(dataStore);

// Layout references
const canvasContainer = ref(null);

// Events
const eventBus = inject('eventBus');

eventBus.on('Layout.contentResize', resizeCanvas);
eventBus.on('Router.TabChange', (viewName) => {
    if (viewName !== 'pcp') return;
    resizeCanvas();
});

// Canvas draw variables
let pathCanvas = document.createElement('canvas');
let ctx = pathCanvas.getContext('2d');
let redrawTimerID = null;

onMounted(() => {
    canvasContainer.value.appendChild(pathCanvas);
    resizeCanvas();
    eventBus.on('PCPRasterLayer.RequestPCPRedraw', restartRedrawCountdown);
});

onUnmounted(() => {
    eventBus.off('PCPRasterLayer.RequestPCPRedraw');
});

watch([() => PCPStore.resolution, () => PCPStore.renderingType], () => {
    resizeCanvas();
});

watch([includedDataOpacity, excludedDataOpacity, curveType,selectedColorCodeCategory, overrideColorCodeColumn], () => {
    restartRedrawCountdown();
});

watch(() => dataStore.enabledCategoriesCount, () => {
    restartRedrawCountdown();
});

eventBus.on('filterUpdate', () => {
    restartRedrawCountdown();
});
eventBus.on('SourceForm.readData', () => {
    restartRedrawCountdown();
})

async function generateDataUrl () {
    await stateStore.setLoading('Generating dURL');
    const dUrl = pathCanvas.toDataURL();
    PCPStore.pathsDataUrl = dUrl;

    await stateStore.clearLoading();
}

function restartRedrawCountdown () {
    if (PCPStore.renderingType !== 'raster') return;
    if (stateStore.activeView !== 'pcp') return;
    if (!canvasContainer.value) return;

    let refreshDelay = 125;

    if (redrawTimerID) {
        clearTimeout(redrawTimerID);
    }

    redrawTimerID = setTimeout( () => {
        draw();
        redrawTimerID = null;
    }, refreshDelay);
}

async function draw () {
    if (PCPStore.renderingType !== 'raster') return;
    if (!canvasContainer.value) {
        console.warn('Canvas container not found');
    }
    await stateStore.setLoading('Redrawing PCP canvas');
    const t_draw_start = performance.now();
    PCPStore.pathsDataUrl = null;

    ctx.clearRect(0, 0, canvasContainer.value.offsetWidth, canvasContainer.value.offsetHeight);
    ctx.setTransform(resolution.value,0,0,resolution.value,0,0);

    let includedDataArray = [];
    let excludedDataArray = [];

    for (let i = 0; i < data.value.length; i++) {
        let d = data.value[i];

        // Check if included
        if (dataStore.dataPointFilterCheck(d)) {
            includedDataArray.push(d);
        } else {
            excludedDataArray.push(d);
        }   
    }

    console.time('batch-render');
    if (!optionsStore.hideExcluded) await batchRender(excludedDataArray, optionsStore.excludedDataOpacity, '#bfbfbf');
    await batchRender(includedDataArray, optionsStore.includedDataOpacity);
    console.timeEnd('batch-render');

    const t_draw_end = performance.now();
    console.debug(`Draw time: ${(t_draw_end - t_draw_start)/1000} [s]`);

    await stateStore.clearLoading();
    return; 
}

function renderLine (d, color, opacity) {
    lineGenerator(d, ctx);
    ctx.lineWidth = 1;
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color;   
}

async function batchRender (dataArray, opacity, overrideColor = null) {
    let chunkSize = dataArray.length / 20;
    for (let i = 0; i < dataArray.length; i += chunkSize) {
        let chunk = dataArray.slice(i, i + chunkSize);
        ctx.beginPath();
        chunk.map(d => renderLine(d, overrideColor ? overrideColor : getLineColor(d), opacity));
        ctx.stroke();  
        // Pause until next chunk 
        await new Promise(resolve => setTimeout(resolve, 0));
    }
}

async function resizeCanvas () {
    if (PCPStore.renderingType !== 'raster') return;
    if (!canvasContainer.value) return;
    PCPStore.pathsDataUrl = null;	// Triggers the image in PCP to become hidden

    await nextTick();

    // TODO: consider css transform scaling 
    // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas#scaling_canvas_using_css_transforms
    const w = canvasContainer.value.offsetWidth;
    const h = canvasContainer.value.offsetHeight;
    pathCanvas.width = w * resolution.value;
    pathCanvas.height = h * resolution.value;
    pathCanvas.style.width = w + 'px';
    pathCanvas.style.height = h + 'px';
    restartRedrawCountdown();
}

function getLineColor (d) {
    return optionsStore.getSampleColor(d);
}

</script>

<style lang="scss" scoped>

</style>