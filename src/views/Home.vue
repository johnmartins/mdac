<template>
	<div class="layout-container" ref="layoutContainer">
		<PlotTools/>
		<div id="menu-resize-border" class="resize-border-v" @mousedown="resizeMenu"></div>
		<PCPlot/>
	</div>

</template>

<script setup>
import { reactive, ref, onMounted, onUpdated } from "vue"

import PCPlot from '@/components/plots/PCPlot2.vue'
import PlotTools from '@/components/plots/PlotTools'

const layoutContainer = ref(null)

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
		const minWidth = 170 // px
		if (!resizing) return
		let mouseX = evt.clientX
		if (mouseX < minWidth) mouseX = minWidth
		console.log(`Resizing to ${mouseX}`)

		layoutContainer.value.style.gridTemplateColumns = `${mouseX}px 4px auto`
	}
}


</script>

<style lang="scss" scoped>

	.layout-container {
		height: 100%;
		display: grid;
		grid-template-columns: 250px 4px auto;      // Menu, resize-border, workspace

		.resize-border-v {
			width: 4px;
			cursor: w-resize;
			height: 100%;
			background-color: grey;
		}
	}


</style>