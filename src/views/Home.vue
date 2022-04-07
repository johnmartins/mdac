<template>
	<div style="height: 100%;">
		<div class="mdac-header pt-3 px-3">
			<div class="title-container">
				MDAC
			</div>
			<div class="nav-container">
				<span class="link" @click="setView('plot')">Plot</span>
				<span class="link" @click="setView('data')">Data</span>
			</div>
		</div>
		<div class="content-container">
			<div class="pcd-tab-container" ref="pcdContainer">
				<PlotTools/>
				<div id="menu-resize-border" class="resize-border-v" @mousedown="resizeMenu"></div>
				<PCPlot ref="plot"/>
			</div>
			<div class="data-tab-container" ref="dataContainer" style="display: none;">
				<DataList/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { reactive, ref, onMounted, onUpdated } from "vue"

import PCPlot from '@/components/plot-layouts/PCPlot/PCPlot.vue'
import PlotTools from '@/components/plot-layouts/PCPlot/PCPSideMenu'
import DataList from '@/components/DataList'

const pcdContainer = ref(null)
const dataContainer = ref(null)
const plot = ref(null)

let resizing = false

function setView (viewName) {
	pcdContainer.value.style.display="none"
	dataContainer.value.style.display="none"
	switch(viewName) {
		case "plot":
			pcdContainer.value.style.display="grid"
			break;
		case "data":
			dataContainer.value.style.display="block"
			break;
		default:
			console.error('No such view')
			break;
	}
}

function resizeMenu () {
	resizing = true

	document.body.onmouseup = () => {
		resizing = false
		document.body.onmousemove = null
	}

	document.body.onmousemove = (evt) => {
		const minWidth = 220 // px
		if (!resizing) return
		let mouseX = evt.clientX
		if (mouseX < minWidth) mouseX = minWidth
		pcdContainer.value.style.gridTemplateColumns = `${mouseX}px 4px auto`

		// Resize child component
		plot.value.updateContainerSize()
	}
}


</script>

<style lang="scss" scoped>

	$header-height: 50px;

	.mdac-header {
		height: $header-height;
		display: grid;
		grid-template-columns: 100px auto;
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid whitesmoke;

		.title-container {
			font-weight: bold;
		}

		.nav-container {

			.link {
				margin-right: 1rem;
				cursor: pointer;
			}
			.link:hover {
				color: blue;
			}
		}
	}

	.content-container {
		width: 100%;
		height: calc(100% - $header-height);
	}

	.pcd-tab-container {
		height: 100%;
		display: grid;
		grid-template-columns: 290px 4px auto;      // Menu, resize-border, workspace

		.resize-border-v {
			width: 4px;
			cursor: w-resize;
			height: 100%;
			background-color: whitesmoke;
		}
	}

	.data-tab-container {
		height: 100%;
		width: 100%;
	}




</style>