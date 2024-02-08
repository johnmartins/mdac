<template>
    <div 
        ref="canvasContainer"
        style="width: 100%; height: 100%; border: 1px solid red;"
    />
</template>

<script setup>
import { useDataStore } from '@/store/DataStore';
import { useOptionsStore } from '@/store/OptionsStore';
import { useScatterStore } from '@/store/ScatterStore';
import { useStateStore } from '@/store/StateStore';
import { storeToRefs } from 'pinia';
import { nextTick, onMounted, ref } from 'vue';

const props = defineProps({
    cx: Object,
    cy: Object,
    dataArray: Array,
});

// Stores
const dataStore = useDataStore();
const stateStore = useStateStore();
const optionsStore = useOptionsStore();
const scatterStore = useScatterStore();

// Store refs
const {data} = storeToRefs(dataStore);

// DOM
const canvasContainer = ref(null);

// Canvas draw variables
let scatterCanvas = document.createElement('canvas');
let ctx = scatterCanvas.getContext('2d');
let redrawTimerID = null;
let resolution = ref(1);

defineExpose({
    generateDataUrl
});

onMounted(() => {
    console.log("onMounted canvas container: "+canvasContainer.value)
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

    await batchRender(props.dataArray);
}

async function batchRender (dataArray) {
    let dataArrayLength = dataArray.length;
    let chunkSize = dataArrayLength / getChunkCount(dataArrayLength);
    console.log("Chunk size: " + chunkSize + " Data array length: " + dataArrayLength)

    for (let i = 0; i < dataArrayLength; i+= chunkSize) {
        console.log('Rendering chunk: ' + i);
        let chunk = dataArray.slice(i, i + chunkSize);
        console.log(chunk)
        await Promise.all(chunk.map(d => renderDataPoint(d)));

        // Pause until next chunk
        await new Promise(resolve => setTimeout(resolve, 0));
    }
}

async function renderDataPoint (d) {
    // Get datapoint true position
    let x = props.cx.scaleLinear(d[props.cx.title]);
    let y = props.cy.scaleLinear(d[props.cy.title]);
    
    let xPlot = canvasContainer.value.offsetWidth - x * (canvasContainer.value.offsetWidth - 0);
    let yPlot = y * (canvasContainer.value.offsetHeight - 0);

    if (!x && !y) {
        throw new Error('Data point has no x and no y value');
    }

    if (!x) {
        x = 0;
    } else if (!y) {
        y = scatterStore.yAxisLength;
    }

    // Render as circle in canvas
    ctx.beginPath();
    ctx.arc(xPlot, yPlot, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
}

function getChunkCount (dataArrayLength) {
    let count = parseInt(Math.max(10,Math.min(50, dataArrayLength/250)));
    return count;
}

function restartRedrawCountdown () {
    let refreshDelay = 250;

    if (redrawTimerID) {
        clearTimeout(redrawTimerID);
    }

    redrawTimerID = setTimeout(() => {
        redrawTimerID = null;
        draw();
    }, refreshDelay);
}

async function resizeCanvas () {
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
