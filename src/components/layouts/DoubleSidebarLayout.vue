<template> 
    <div class="double-sidebar-grid" ref="doubleSidebarLayoutContainer">
		<div class="side-menu-container" :hidden="hideMenuL">
        	<slot name="sidebarA"></slot>
		</div>

        <div class="resize-border-v left" @mousedown="resizeMenu($event, 'left')">
			<button @click="toggleMenuL" class="btn-toggle-menu"><span v-if="!hideMenuL">&lt;</span><span v-else>&gt;</span></button>
		</div>

        <slot></slot>

        <div class="resize-border-v right" @mousedown="resizeMenu($event, 'right')">
			<button @click="toggleMenuR" class="btn-toggle-menu"><span v-if="!hideMenuR">&gt;</span><span v-else>&lt;</span></button>
		</div>
		
		<div class="side-menu-container" :hidden="hideMenuR">
        	<slot name="sidebarB"></slot>
		</div>

    </div>
</template>

<script setup>
import { ref, inject } from "vue"

let hideMenuL = ref(false)
let hideMenuR = ref(false)

const eventBus = inject('eventBus')
const doubleSidebarLayoutContainer = ref(null)

// State
let resizing = false
let leftWidth = 290
let rightWidth = 290

function toggleMenuL () {
	hideMenuL.value = !hideMenuL.value
	adjustLayout()
}

function toggleMenuR () {
	hideMenuR.value = !hideMenuR.value
	adjustLayout()
}

function adjustLayout () {
	let left = hideMenuL.value ? "" : `${leftWidth}px `
	let middle ="10px auto 10px"
	let right = hideMenuR.value ? "" : ` ${rightWidth}px`

	doubleSidebarLayoutContainer.value.style.gridTemplateColumns = left + middle + right

	// Doing this immediately does not work. There needs to be a slight delay.
	setTimeout(() => {eventBus.emit('Layout.contentResize')}, 250)
}

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
            leftWidth = mouseX
			if (leftWidth < minWidth) leftWidth = minWidth
        } else if (side === 'right') {
            rightWidth = doubleSidebarLayoutContainer.value.clientWidth - mouseX
			if (rightWidth < minWidth) rightWidth = minWidth
        } else {
            throw new Error('Unclear layout resize instructions.')
        }

		adjustLayout()

		// Resize child component
        eventBus.emit('Layout.contentResize')
	}
}

</script>

<style lang="scss" scoped>

	.double-sidebar-grid {
		height: 100%;
		display: grid;
		grid-template-columns: 290px 10px auto 10px 290px;      // Menu, resize-border, workspace
	}

</style>