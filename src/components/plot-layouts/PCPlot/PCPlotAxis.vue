<template>

<!-- Axis vertical line -->
<line x1="0" y1="0" x2="0" :y2="truncateDecimals(props.plotYBounds[1]-(plotBottomPadding),2)" />

<!-- Hitbox -->
<rect 
    class="filter-hitbox"
    :height="truncateDecimals(props.axisLength+40, 1)"
    @click="onClickAxis($event, c)"
    @dblclick="onDblClickAxis($event, c)"
    @mousedown.prevent="dragFilterStart($event, c)"
/>

<!-- Axis label -->
<text 
    :y="truncateDecimals(props.plotYBounds[1]-(plotBottomPadding-axisLabelMargin),1)" 
    class="title" 
    :style="{fontSize: `${optionsStore.titleSize}em`}"
    :transform="`rotate(${axisLabelAngle} 0 ${truncateDecimals(props.plotYBounds[1]-(plotBottomPadding-axisLabelMargin),1)})`"
    @click="onClickAxis($event, c)"
    @dblclick="onDblClickAxis($event, c)"
>
    {{ c.displayTitle }}
</text>

<!-- Axis tick group -->
<g v-for="(tick, index) in c.getTickArray()" :key="index" class="tick"> 
    <text x="-10" :y="c.scaleLinear(tick)*props.axisLength" class="tick-string" :style="{fontSize: `${optionsStore.tickSize}em`}">{{ c.getTickString(tick) }}</text>
    <line x1="0" :y1="c.scaleLinear(tick)*props.axisLength" x2="-5" :y2="c.scaleLinear(tick)*props.axisLength" />	
    <!-- Top tick -->
</g>

<!-- Axis Filters -->
<g v-if="optionsStore.showFilters">
    <g v-for="(f, index) in filters[c.title]" :key="index">
        <PCPlotFilter 
            :filter="f" 
            :category="c" 
            :canvas="plotCanvas"
            @onInteraction="onFilterInteraction" 
        />
    </g>
</g>

<!-- Proto axis filters -->
<g v-if="currentFilterCategory && currentFilterDeltaTime > plotParameters.filterMinDragTime">
    <g v-if="currentFilterCategory.title === c.title">
        <rect 
            class="filter-box-proto"
            :y="truncateDecimals(Math.min(currentFilterStartValue, currentFilterEndValue) - plotTopPadding, 1)"
            :height="truncateDecimals(Math.abs(currentFilterEndValue - currentFilterStartValue), 1)"
        />
    </g>
</g>

</template>

<script setup>
import { truncateDecimals } from "@/utils/data-utils";
import { storeToRefs } from "pinia";

import PCPlotFilter from "./PCPlotFilter.vue";

// Stores
import {useDataStore} from "../../../store/DataStore";
import { usePCPStore } from "@/store/PCPStore";
import { useOptionsStore } from "@/store/OptionsStore";
import { useStateStore } from "@/store/StateStore";

const dataStore = useDataStore()
const PCPStore = usePCPStore();
const optionsStore = useOptionsStore();
const stateStore = useStateStore();

const {data, filterIDMap, filters, categories} = storeToRefs(dataStore);
const {activeView, selectedCategory} = storeToRefs(stateStore);
const { horizontalOffset, axisLength, plotXBounds, plotYBounds, 
    pathsDataUrl, axisLabelMargin, axisLabelAngle, plotTopPadding, 
    plotRightPadding, plotBottomPadding, plotLeftPadding, currentFilterStartTime,
    currentFilterCategory, currentFilterDeltaTime, currentFilterStartValue,
    currentFilterEndValue, filterMinDragTime } = storeToRefs(PCPStore);

const props = defineProps({
    axisLength: Number,
    c: Object,
    canvas: Object,
    plotYBounds: Array,
});

function onClickAxis(event, category) {
    // ..
}

function onDblClickAxis(event, category) {
    //
}

function dragFilterStart(event, category) {
    //
}


</script>

<style lang="scss" scoped>

.pcp-plot {
	.axis {
		cursor: pointer;

        &.grabbing {
            cursor: grabbing !important;
        }

        &.pulling {
            cursor: ns-resize!important;
        }

		text {
			fill: black;
			stroke-opacity: 0;
		}

		line {
			stroke: black;
			fill-opacity: 0;
		}

		.filter-box {
			x: -8px;
			width: 16px; 
		}

		.filter-box-proto {
			x: -8px;
			width: 16px;
		}

		.filter-hitbox {
			stroke: transparent;
			fill: transparent;
			x: -10px;
			y: -20px;
			width: 20px;

            &:hover {
                stroke: rgb(0, 0, 0);
                fill: rgba(255,255,255, 0.05);
            }
		}

		.title {
			x: 0px;
			text-anchor: start;
		}

		.tick-string {
			text-anchor: end;
			dominant-baseline: middle;
			font-weight: bold;
            pointer-events: none;
            filter: (url(#solid))
		}
	}

	.axis:hover {
		.title {
			fill: darkblue;
			font-weight: bold;
		}

		line {
			stroke-width: 2px;
			stroke: darkblue;
		}
		
	}

	.highlighted {
		.title {
			fill: darkblue;
			font-weight: bold;
		}

		line {
			stroke-width: 2px;
			stroke: darkblue;
		}
	}
}

</style>
