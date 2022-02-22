<template>
	<div class="layout-container" ref="layoutContainer">
		<PlotTools/>
		<div id="menu-resize-border" class="resize-border-v" @mousedown="resizeMenu"></div>
		<PCPlot ref="plot"/>
	</div>

</template>

<script setup>
import { reactive, ref, onMounted, onUpdated } from "vue"

import PCPlot from '@/components/plots/PCPlot.vue'
import PlotTools from '@/components/plots/PlotTools'

const layoutContainer = ref(null)
const plot = ref(null)

let resizing = false
function resizeMenu () {
	resizing = true

	console.log("resizing")

	document.body.onmouseup = () => {
		console.log("stopped resizing")
		resizing = false
		document.body.onmousemove = null
	}

	document.body.onmousemove = (evt) => {
		const minWidth = 220 // px
		if (!resizing) return
		let mouseX = evt.clientX
		if (mouseX < minWidth) mouseX = minWidth
		layoutContainer.value.style.gridTemplateColumns = `${mouseX}px 4px auto`

		// Resize child component
		plot.value.updateContainerSize()
	}
}


</script>

<style lang="scss" scoped>

	.layout-container {
		height: 100%;
		display: grid;
		grid-template-columns: 290px 4px auto;      // Menu, resize-border, workspace

		.resize-border-v {
			width: 4px;
			cursor: w-resize;
			height: 100%;
			background-color: grey;
		}
	}


</style>