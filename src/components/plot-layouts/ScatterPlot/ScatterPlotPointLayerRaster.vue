<template>
    <div 
        ref="canvasContainer"
        style="width: 100%; height: 100%;"
    />
</template>

<script setup>
import { useDataStore } from '@/store/DataStore';
import { useOptionsStore } from '@/store/OptionsStore';
import { useScatterStore } from '@/store/ScatterStore';
import { useStateStore } from '@/store/StateStore';
import { storeToRefs } from 'pinia';
import { nextTick, onMounted, ref, inject, watch } from 'vue';

defineExpose({
    generateDataUrl,
    restartRedrawCountdown,
    resizeCanvas
});

const props = defineProps({
    cx: Object,
    cy: Object,
    dataArray: Array,
    renderCondition: {
        type: Function,
        default: () => true
    }
});

// Stores
const dataStore = useDataStore();
const stateStore = useStateStore();
const optionsStore = useOptionsStore();
const scatterStore = useScatterStore();

// Store refs
const { data } = storeToRefs(dataStore);
const { activeView } = storeToRefs(stateStore);

// DOM
const canvasContainer = ref(null);

// Canvas draw variables
let scatterCanvas = document.createElement('canvas');
let ctx = scatterCanvas.getContext('2d');
let redrawTimerID = null;
let resolution = ref(0.8);

const eventBus = inject('eventBus');
eventBus.on('Layout.contentResize', resizeCanvas);

onMounted(() => {
    canvasContainer.value.appendChild(scatterCanvas);
    resizeCanvas();
    restartRedrawCountdown();
});

async function draw () {
    if (!canvasContainer.value) {
        console.error('Canvas container is null')
        return;
    }

    if (!props.cx || !props.cy) {
        console.error('cx or cy is null')
        return;
    }

    ctx.clearRect(0, 0, canvasContainer.value.offsetWidth, canvasContainer.value.offsetHeight);
    ctx.setTransform(resolution.value, 0, 0, resolution.value, 0, 0);

    if (!props.dataArray) {
        console.error('Data array is null')
        return;
    }

    if (props.dataArray.length === 0) {
        console.error('Data array is empty')
        return;
    }

    eventBus.emit('ScatterPlotPointLayerRaster.renderStart');

    await nextTick();

    await batchRender(props.dataArray);
}

async function batchRender (dataArray) {
    let dataArrayLength = dataArray.length;

    for (let i = 0; i < dataArrayLength; i++) {
        let d = dataArray[i];
        await renderDataPoint(d);
    }

    eventBus.emit('ScatterPlotPointLayerRaster.renderComplete');
}

async function renderDataPoint (d) {
    // Get datapoint true position
    let x = props.cx.scaleLinear(d[props.cx.title]);
    let y = props.cy.scaleLinear(d[props.cy.title]);

    let xPlot = canvasContainer.value.offsetWidth - x * (canvasContainer.value.offsetWidth);
    let yPlot = y * (canvasContainer.value.offsetHeight);

    if (x === null && y === null) {
        throw new Error('Data point has no x and no y value');
    }

    if (!x) {
        x = 0;
    } else if (!y) {
        y = canvasContainer.value.offsetHeight;
    }

    // Render as circle in canvas
    ctx.beginPath();
    ctx.arc(xPlot, yPlot, 1, 0, 2 * Math.PI);
    ctx.fillStyle = getFill(d, true);
    ctx.fill();
}

function getFill (d, included) {
    const ID = d[dataStore.idCol]
    if (ID === scatterStore.selectedDataID) return 'white'

    if (!included) {
        return '#bfbfbf'
    } 

    return optionsStore.getSampleColor(d)
}

function restartRedrawCountdown () {
    let refreshDelay = 250;

    if (props.renderCondition() === false) {
        return;
    } 

    if (redrawTimerID) {
        clearTimeout(redrawTimerID);
    }

    redrawTimerID = setTimeout(() => {
        redrawTimerID = null;
        draw();
    }, refreshDelay);
}

async function resizeCanvas () {
    if (!canvasContainer.value) {
        return;
    }

    const w = canvasContainer.value.offsetWidth;
    const h = canvasContainer.value.offsetHeight;
    scatterCanvas.width = w * resolution.value;
    scatterCanvas.height = h * resolution.value;
    scatterCanvas.style.width = `${w}px`;
    scatterCanvas.style.height = `${h}px`;
    restartRedrawCountdown();
}

async function generateDataUrl() {
    const dUrl = scatterCanvas.toDataURL('image/png');
}

</script>

<style lang="scss" scoped>
</style>
