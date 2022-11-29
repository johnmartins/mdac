<template>
<div class="modal-mask">
    <div class="popup-box box-shadow" v-if="popup">
        <div class="popup-content" ref="contentContainer" :style="{height: `${height}px`}">
            <h1>{{popup.title}}</h1>
            <div class="popup-body">
                {{popup.body}}
            </div>
            <div class="popup-button-array">
                <button class="btn btn-sm btn-primary" @click="onClickOK">OK</button>
            </div>
        </div>
    </div>  
</div>
</template>

<script setup>
import {ref, watch, onMounted} from "vue"
import {useLayoutStore} from "@/store/LayoutStore"

const props = defineProps({
    popupID: Number
})

const layoutStore = useLayoutStore()

const contentContainer = ref(null)
const popup = ref(null)

// Dimension
const width = ref(0)
const height = ref(0)

onMounted( () => {
    const popupID = parseInt(props.popupID)
    const p = layoutStore.getPopupByID(popupID)
    popup.value = p
})

watch(getExpectedHeight, () => {
    height.value = getExpectedHeight()
})

function getExpectedHeight () {
    if (!contentContainer.value) return 0
    return contentContainer.value.scrollHeight
}

function onClickOK () {
    layoutStore.clearPopup(props.popupID)

    if (popup.value.okCallback) {
        popup.value.okCallback()
    }
}

</script>

<style lang="scss" scoped>

$height: 80px;
$width: 300px;

h1 {
    font-size: 1.2em;
    font-weight: bold;
    text-align: left;
    margin-bottom: 4px;
}

.popup-content {
    display: flex;
    flex-direction: column;
    justify-content: left;
    min-height: $height;
    width: $width;
}

.popup-body {
    text-align: left;
    font-size: 0.8em;
}

.popup-button-array {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 8px;
}

.popup-box {
    position: absolute;
    top: calc(50% - 2*$height);
    left: calc(50% - $width/2);
    background: whitesmoke;
    border: 1px solid silver;
    border-radius: 4px;
    padding: 8px;
    overflow-y: auto;
    overflow-x: hidden;
    cursor: auto;
}
</style>