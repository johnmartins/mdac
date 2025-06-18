<template>
    <div 
        id="app" 
        style="height: 100%;"
        @mouseleave="onMouseLeave"
    >
        <div class="mdac-header px-3">
            <div 
                class="title-container clickable"
                @click="setView('pcp')"
            >
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
                    v-if="categories.length > 0"
                    class="link" 
                    :class="{active: activeView === 'scatter'}" 
                    @click="setView('scatter')"
                >
                    Scatter
                </span>
                <span
                    v-if="categories.length > 0"
                    class="link"
                    :class="{active: activeView === 'mvgrid'}"
                    @click="setView('mvgrid')"
                >
                    Scatter-Grid
                </span>
                <span
                    v-if="categories.length > 0"
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
                Version {{ APP_VERSION }}
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
            <div ref="mvGridContainer" class="fill-content" style="display: none">
                <SidebarLayout>
                    <template #sidebar><MVGridSideMenu /></template>
                    <MVGridLayout />
                </SidebarLayout>
            </div>
        </div>

        <div class="author-banner">&copy; Julian Martinsson Bonde, <a href="https://github.com/johnmartins">https://github.com/johnmartins</a></div>

        <div v-for="popup in popups" :key="popup.id">
            <PopupBox :popup-i-d="popup.id" />
        </div>

        <ColorSettings />
        <CategorySettings />
        <LoadingModal />
    </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUpdated, inject, onErrorCaptured } from "vue";
import { storeToRefs } from "pinia";

// Layouts
import SidebarLayout from '@/components/layouts/SidebarLayout.vue';
import DoubleSidebarLayout from '@/components/layouts/DoubleSidebarLayout.vue';
import BoxLayout from '@/components/layouts/BoxLayout.vue';
import PopupBox from '@/components/layouts/PopupBox.vue';

import PCPlot from '@/components/plot-layouts/PCPlot/PCPlot.vue';
import PCPSideMenu from '@/components/plot-layouts/PCPlot/PCPSideMenu.vue';
import DataList from '@/components/DataList.vue';
import ScatterPlot from '@/components/plot-layouts/ScatterPlot/ScatterPlot.vue';
import ScatterSideMenu from '@/components/plot-layouts/ScatterPlot/ScatterSideMenu.vue';
import ScatterSideMenuRight from '@/components/plot-layouts/ScatterPlot/ScatterSideMenuRight.vue';
import MVGridLayout from "./components/plot-layouts/MVGrid/MVGridLayout.vue";
import CategorySettings from '@/components/CategorySettings.vue';
import LoadingModal from '@/components/LoadingModal.vue';
import MVGridSideMenu from '@/components/plot-layouts/MVGrid/MVGridSideMenu.vue';
import ColorSettings from "./components/ColorSettings.vue";

import {useLayoutStore} from "@/store/LayoutStore.js";
import {useStateStore} from "@/store/StateStore.js";
import {useDataStore} from "@/store/DataStore.js";
import Popup from "@/models/layout/Popup.js";

const stateStore = useStateStore();
const layoutStore = useLayoutStore();
const dataStore = useDataStore();

const {activeView, showCategorySettingsWindow} = storeToRefs(stateStore)
const {popups} = storeToRefs(layoutStore)
const {categories} = storeToRefs(dataStore)

const pcpContainer = ref(null);
const scatterContainer = ref(null);
const dataContainer = ref(null);
const mvGridContainer = ref(null);
const plot = ref(null);
const APP_VERSION = import.meta.env.VITE_APP_VERSION;

const eventBus = inject('eventBus')

eventBus.on('main.error', (err) => {
    const errorPopup = new Popup('error', 'Error', err.message)
    layoutStore.queuePopup(errorPopup)
});

eventBus.on('Router.RequestTabChange', (viewName) => {
    setView(viewName);
})

function setView (viewName) {
    pcpContainer.value.style.display="none";
    scatterContainer.value.style.display="none";
    dataContainer.value.style.display="none";
    mvGridContainer.value.style.display="none";
    switch(viewName) {
    case "pcp":
        pcpContainer.value.style.display="block";
        break
    case "scatter":
        scatterContainer.value.style.display="block";
        break;
    case "data":
        dataContainer.value.style.display="block";
        break;
    case "mvgrid":
        mvGridContainer.value.style.display="block";
        break;
    default:
        throw new Error('No such view');
    }
    stateStore.setView(viewName)
    eventBus.emit('Router.TabChange', viewName)
}

onMounted( () => {
    // Add listener for resize
    window.onresize = () => {
        eventBus.emit('Layout.contentResize');
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
})

function onKeyDown (evt) {
   
    // If ctrl
    if (evt.key === 'Control') {
        stateStore.ctrl = true;
    }
}   

function onKeyUp (evt) {
    
    // If ctrl
    if (evt.key === 'Control') {
        stateStore.ctrl = false;
    }

}

function onMouseLeave () {
    // stateStore.ctrl = false;
}

</script>

<style lang="scss">
  @use "@/scss/GlobalStyles.scss";
  @use "@/scss/Colors.scss";
	
  $header-height: 40px;
  $nav-height: 60px;

  #app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: Colors.$color-light;
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
        background-color: Colors.$color-primary-base;

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
        text-align: center;

		a {
			color: grey;
			text-decoration: none;
		}
	}
</style>