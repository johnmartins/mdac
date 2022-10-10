<template>
	<router-view class="content-window"/>
</template>

<script setup>

import {onErrorCaptured, inject} from 'vue'

import Popup from '@/models/layout/Popup'
import {useLayoutStore} from "@/store/LayoutStore"

const eventBus = inject('eventBus')

const layoutStore = useLayoutStore()

eventBus.on('main.error', (err) => {
	const errorPopup = new Popup('error', 'Unhandled exception', err.message)
	layoutStore.queuePopup(errorPopup)
})

</script>

<style lang="scss">

@import "@/scss/GlobalStyles.scss";

$nav-height: 60px;

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  max-height: 100%;
}

</style>
