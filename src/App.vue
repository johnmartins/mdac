<template>
    <div id="app" style="height: 100%;">
        <div class="mdac-header px-3">
            <div class="title-container">
                MDAC
            </div>

            <div class="nav-container">
                <span
                    class="link" 
                    :class="{active: activeView === 'pcp'}" 
                    @click="setView('pcp')"
                >
                    PCP
                </span>

                <span
                    class="link" 
                    :class="{active: activeView === 'scatter'}" 
                    @click="setView('scatter')"
                >
                    Scatter
                </span>
                <span
                    class="link" 
                    :class="{active: activeView === 'data'}" 
                    @click="setView('data')"
                >
                    Data
                </span>
                <span
                    v-if="categories.length > 0" 
                    class="link"
                    :class="{active: showCategorySettingsWindow === true}" 
                    @click="showCategorySettingsWindow=true"
                >
                    Data settings
                </span>
            </div>

            <div class="version-container">
                Version {{ appVersion }}
            </div>
        </div>
        <div class="content-container">
            <div ref="pcpContainer" class="fill-content">
                <SidebarLayout>
                    <template #sidebar><PCPSideMenu /></template>
                    <PCPlot ref="plot" />
                </SidebarLayout>
            </div>
            <div ref="dataContainer" class="fill-content" style="display: none;">
                <BoxLayout>
                    <DataList />
                </BoxLayout>
            </div>
            <div ref="scatterContainer" class="fill-content" style="display: none;">
                <DoubleSidebarLayout>
                    <template #sidebarA><ScatterSideMenu /></template>
                    <ScatterPlot />
                    <template #sidebarB><ScatterSideMenuRight /></template>
                </DoubleSidebarLayout>
            </div>
        </div>

        <div class="author-banner">&copy; Julian Martinsson Bonde, <a href="https://github.com/johnmartins">https://github.com/johnmartins</a></div>

        <div v-for="popup in popups" :key="popup.id">
            <PopupBox :popup-i-d="popup.id" />
        </div>

        <CategorySettings />
        <LoadingModal />
    </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUpdated, inject, onErrorCaptured } from "vue"

// Layouts
import SidebarLayout from '@/components/layouts/SidebarLayout'
import DoubleSidebarLayout from '@/components/layouts/DoubleSidebarLayout'
import BoxLayout from '@/components/layouts/BoxLayout'
import PopupBox from '@/components/layouts/PopupBox'

import PCPlot from '@/components/plot-layouts/PCPlot/PCPlot.vue'
import PCPSideMenu from '@/components/plot-layouts/PCPlot/PCPSideMenu'
import DataList from '@/components/DataList'
import ScatterPlot from '@/components/plot-layouts/ScatterPlot/ScatterPlot'
import ScatterSideMenu from '@/components/plot-layouts/ScatterPlot/ScatterSideMenu'
import ScatterSideMenuRight from '@/components/plot-layouts/ScatterPlot/ScatterSideMenuRight'
import CategorySettings from '@/components/CategorySettings'
import LoadingModal from '@/components/LoadingModal'

import { storeToRefs } from "pinia"
import {useLayoutStore} from "@/store/LayoutStore"
import {useStateStore} from "@/store/StateStore"
import {useDataStore} from "@/store/DataStore"
import Popup from "@/models/layout/Popup"

const stateStore = useStateStore()
const layoutStore = useLayoutStore()
const dataStore = useDataStore()

const {activeView, showCategorySettingsWindow} = storeToRefs(stateStore)
const {popups} = storeToRefs(layoutStore)
const {categories} = storeToRefs(dataStore)

const pcpContainer = ref(null)
const scatterContainer = ref(null)
const dataContainer = ref(null)
const plot = ref(null)
const appVersion = ref(process.env.VUE_APP_VERSION)

const eventBus = inject('eventBus')

eventBus.on('main.error', (err) => {
    const errorPopup = new Popup('error', 'Error', err.message)
    layoutStore.queuePopup(errorPopup)
})

function setView (viewName) {
    pcpContainer.value.style.display="none"
    scatterContainer.value.style.display="none"
    dataContainer.value.style.display="none"
    switch(viewName) {
    case "pcp":
        pcpContainer.value.style.display="block"
        break
    case "scatter":
        scatterContainer.value.style.display="block"
        break
    case "data":
        dataContainer.value.style.display="block"
        break
    default:
        throw new Error('No such view')
        return
    }
    stateStore.setView(viewName)
    eventBus.emit('Router.TabChange', viewName)
}

onMounted( () => {
    // Add listener for resize
    window.onresize = () => {
        eventBus.emit('Layout.contentResize')
    }
})

</script>

<style lang="scss">
  @import "@/scss/GlobalStyles.scss";
	
  $header-height: 40px;
  $nav-height: 60px;

  #app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: $color-light;
    height: 100%;
    max-height: 100%;
  }

	.mdac-header {
		height: $header-height;
		display: grid;
		grid-template-columns: 100px auto 200px;
		text-align: left;
        align-items: center;
		border-bottom: 1px solid black;
        background-color: $color-primary-base;

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

			.active {
				font-weight: bold;
			}
		}

		.version-container {
			text-align: right;
			color: darkgrey;
			font-family: monospace;
			font-size: 0.8em;
			white-space: nowrap;
		}
	}

	.fill-content {
		width: 100%;
		height: 100%;
	}

	.content-container {
		width: 100%;
		height: calc(100% - $header-height);
	}

	.author-banner {
		width: 100%;
		position: absolute;
		bottom: 0;
		color: grey;
		font-size: 0.8em;
        pointer-events: none;

		a {
			color: grey;
			text-decoration: none;
		}
	}
</style>