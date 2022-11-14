<template>
    <div class="double-sidebar-grid" ref="doubleSidebarLayoutContainer">
        <slot name="sidebarA"></slot>
        <div class="resize-border-v" @mousedown="resizeMenu($event, 'left')"></div>
        <slot></slot>
        <div class="resize-border-v" @mousedown="resizeMenu($event, 'right')"></div>
        <slot name="sidebarB"></slot>
    </div>
</template>

<script setup>
import { ref, inject } from "vue"

const eventBus = inject('eventBus')
const doubleSidebarLayoutContainer = ref(null)

// State
let resizing = false
let leftWidth = 290
let rightWidth = 290

function resizeMenu (evt, side) {
	resizing = true

	document.body.onmouseup = () => {
		resizing = false
		document.body.onmousemove = null
	}

	document.body.onmousemove = (evt) => {
		const minWidth = 220 // px
		if (!resizing) return
        let mouseX = evt.clientX

        if (side === 'left') {
            if (mouseX < minWidth) mouseX = minWidth
            leftWidth = mouseX
        } else if (side === 'right') {
            rightWidth = doubleSidebarLayoutContainer.value.clientWidth - mouseX
        } else {
            throw new Error('Unclear layout resize instructions.')
        }

        doubleSidebarLayoutContainer.value.style.gridTemplateColumns = `${leftWidth}px 4px auto 4px ${rightWidth}px`


		// Resize child component
        eventBus.emit('Layout.contentResize')
	}
}

</script>

<style lang="scss" scoped>

	.double-sidebar-grid {
		height: 100%;
		display: grid;
		grid-template-columns: 290px 4px auto 4px 290px;      // Menu, resize-border, workspace

		.resize-border-v {
			width: 4px;
			cursor: w-resize;
			height: 100%;
			background-color: whitesmoke;
		}
	}

</style>