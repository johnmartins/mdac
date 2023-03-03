<template>

<g @mousedown.stop="onMouseDown" @mousemove.stop="onMouseMove" @mouseleave.stop="onMouseLeave">
    <g v-if="f.type == 'single-range'">
        <rect 
        class="filter-box"
        :y="truncateDecimals(c.scaleLinear(f.thresholdB)*axisLength, 1)" 
        :height="truncateDecimals((c.scaleLinear(f.thresholdA)-c.scaleLinear(f.thresholdB))*axisLength, 1)" />
    </g>
    <g v-if="f.type == 'categoric'">
        <rect
        class="filter-box"
        :y="truncateDecimals(f.lowerBoundRatio*axisLength, 1)"
        :height="truncateDecimals((f.upperBoundRatio - f.lowerBoundRatio)*axisLength, 1)"
        />
    </g>
</g>

</template>

<script setup>
import { reactive, ref, onMounted, onUpdated, inject, computed, watch} from "vue"
import { storeToRefs } from "pinia"

// Utils
import {truncateDecimals} from "@/utils/data-utils"
import {getTrueEventCoordinates} from "@/utils/svg-utils"

// Stores
import {usePCPStore} from "../../../store/PCPStore"

const PCPStore = usePCPStore()

const {axisLength, plotYBounds} = storeToRefs(PCPStore)

const props = defineProps({
    f: Object,  // Datastore getFilterByID
    c: Object,  // Datastore getCategoryWithName,
    csvElement: Object
})

let mouseDown = false
let startY = null

function onMouseDown (evt) {
    mouseDown = true
    startY = getTrueEventCoordinates(evt, props.csvElement).y
}

function onMouseUp () {
    stopPull()
}

function onMouseLeave () {
    stopPull()
}

function onMouseMove (evt) {
    if (!mouseDown) return
    const newY = getTrueEventCoordinates(evt, props.csvElement).y
    console.log("New Y = \t" + newY)
    let scaledY = props.c.getOutputFromRatio((1 - startY/axisLength.value) + (newY - startY)/axisLength.value)
    console.log("Scl Y = \t" + scaledY)

    // IS THIS SCALE REVERSED???
}


function stopPull () {
    mouseDown = false
    startY = null
}

</script>

<style lang="scss" scoped>

.filter-box {
    x: -8px;
    width: 16px; 
    cursor: grab;
}


</style>