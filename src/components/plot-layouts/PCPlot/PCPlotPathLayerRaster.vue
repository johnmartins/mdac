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
import * as d3 from "d3";

// Stores
import {useDataStore} from "@/store/DataStore"
import {usePCPStore} from "@/store/PCPStore"
import {useOptionsStore} from "@/store/OptionsStore"
import {useStateStore} from "@/store/StateStore"

defineExpose({
    generateDataUrl
})

// Store references
const dataStore = useDataStore()
const PCPStore = usePCPStore()
const optionsStore = useOptionsStore()
const stateStore = useStateStore()

// Store refs
const {selectedColorCodeCategory} = storeToRefs(optionsStore)
const {horizontalOffset, axisLength, plotYBounds, plotXBounds, resolution} = storeToRefs(PCPStore)
const {data} = storeToRefs(dataStore)

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
    resizeCanvas()
})

watch([() => data.value.filter(dp => !dataStore.dataPointFilterCheck(dp), 
    optionsStore.includedDataOpacity, 
    optionsStore.excludedDataOpacity, 
    optionsStore.curveType,
    optionsStore.selectedColorCodeCategory,
    optionsStore.overrideColorCodeColumn)], () => {
    restartRedrawCountdown()
})

watch(() => dataStore.enabledCategoriesCount, () => {
    restartRedrawCountdown()
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

    let refreshDelay = 250;

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

    if (!optionsStore.hideExcluded) await batchRender(excludedDataArray, optionsStore.excludedDataOpacity, '#bfbfbf');
    await batchRender(includedDataArray, optionsStore.includedDataOpacity);

    const t_draw_end = performance.now();
    console.debug(`Draw time: ${(t_draw_end - t_draw_start)/1000} [s]`);

    await stateStore.clearLoading();
    return 
}

function renderLine (d, color, opacity) {
    ctx.beginPath();
    lineGenerator(d);
    ctx.lineWidth = 1;
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color;
    ctx.stroke();        
}

async function batchRender (dataArray, opacity, overrideColor = null) {
    let dataArrayLength = dataArray.length;
    let chunkSize = dataArrayLength / getChunkCount(dataArrayLength);
    for (let i = 0; i < dataArrayLength; i += chunkSize) {
        let chunk = dataArray.slice(i, i + chunkSize);
        await Promise.all(chunk.map(d => renderLine(d, overrideColor ? overrideColor : getLineColor(d), opacity)));

        // Pause until next chunk 
        await new Promise(resolve => setTimeout(resolve, 0));
    }
}

function getChunkCount (dataArrayLength) {
    let count = parseInt(Math.max(10,Math.min(50, dataArrayLength/250)));
    return count;
}

async function resizeCanvas () {
    if (PCPStore.renderingType !== 'raster') return
    if (!canvasContainer.value) return
    PCPStore.pathsDataUrl = null	// Triggers the image in PCP to become hidden

    await nextTick();

    const w = canvasContainer.value.offsetWidth
    const h = canvasContainer.value.offsetHeight
    pathCanvas.width = w * resolution.value
    pathCanvas.height = h * resolution.value
    pathCanvas.style.width = w + 'px'
    pathCanvas.style.height = h + 'px'
    restartRedrawCountdown()
}

function lineGenerator(d) {
    let dataCats = Object.keys(d) // TODO: Refactor potential
    let dataArray = Array(dataCats.length).fill(null)

    for (let i = 0; i < dataCats.length; i++) {		
        let c = dataStore.getCategoryWithName(dataCats[i])

        // Ignore disabled categories
        if (!c || !c.enabled)  {
            continue
        }

        // Set data point coordinates
        const x = dataStore.getTrueCategoryPosition(c.title)*horizontalOffset.value
        const y = c.scaleLinear(d[c.title])*axisLength.value

        // Build data array
        dataArray[c.position] = {
            x: x, 
            y: y
        }
    }

    dataArray = dataArray.filter((obj) => { return obj != null })

    let d3CurveType = d3.curveMonotoneX
    if (optionsStore.curveType === 'curve') {
        d3CurveType = d3.curveMonotoneX
    } else if (optionsStore.curveType === 'line') {
        d3CurveType = d3.curveLinear
    }
	
    return d3.line([])
        .x((de) => {return de.x})
        .y((de) => {return de.y})
        .curve(d3CurveType)
        .context(ctx)
        (dataArray)
}

function getLineColor (d) {
    return optionsStore.getSampleColor(d)
}

</script>

<style lang="scss" scoped>

</style>