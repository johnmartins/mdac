<template>
    <div class="sidebar-grid" ref="sidebarLayoutContainer">
		<div class="side-menu-container" :hidden="hideMenu">
        	<slot name="sidebar"></slot>
		</div>

        <div class="resize-border-v left" @mousedown="resizeMenu">

			<button @click="toggleMenu" class="btn-toggle-menu"><span v-if="!hideMenu">&lt;</span><span v-else>&gt;</span></button>

		</div>
        <slot></slot>
    </div>
</template>

<script setup>
import { ref, inject } from "vue"

const eventBus = inject('eventBus')
const sidebarLayoutContainer = ref(null)

// State
let resizing = false
let hideMenu = ref(false)
let menuWidth = 290

function toggleMenu () {
	hideMenu.value = !hideMenu.value
	if (hideMenu.value) {
		sidebarLayoutContainer.value.style.gridTemplateColumns = `10px auto`
	} else {
		sidebarLayoutContainer.value.style.gridTemplateColumns = `${menuWidth}px 10px auto`
	}

	// Doing this immediately does not work. There needs to be a slight delay.
	setTimeout(() => {eventBus.emit('Layout.contentResize')}, 250)
}

function resizeMenu () {
	// Don't attempt resize if menu is hidden.
	if (hideMenu.value) return

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
		sidebarLayoutContainer.value.style.gridTemplateColumns = `${mouseX}px 10px auto`
		menuWidth = mouseX

		// Resize child component
        eventBus.emit('Layout.contentResize')
	}
}

</script>

<style lang="scss" scoped>

	.sidebar-grid {
		height: 100%;
		display: grid;
		grid-template-columns: 290px 10px auto;      // Menu, resize-border, workspace
	}

</style>