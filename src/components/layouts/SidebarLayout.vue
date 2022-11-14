<template>
    <div class="sidebar-grid" ref="sidebarLayoutContainer">
        <slot name="sidebar"></slot>
        <div class="resize-border-v" @mousedown="resizeMenu"></div>
        <slot></slot>
    </div>
</template>

<script setup>
import { ref, inject } from "vue"

const eventBus = inject('eventBus')
const sidebarLayoutContainer = ref(null)

// State
let resizing = false

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
		sidebarLayoutContainer.value.style.gridTemplateColumns = `${mouseX}px 4px auto`

		// Resize child component
        eventBus.emit('Layout.contentResize')
	}
}

</script>

<style lang="scss" scoped>

	.sidebar-grid {
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

</style>