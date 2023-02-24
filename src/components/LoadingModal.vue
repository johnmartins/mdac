<template>
    <div class="modal-mask loading modal-container" v-if="loadingReason">
        <div class="message-container">
            <span>{{loadingReason}}</span><br />
            <span class="icon"><font-awesome-icon icon="fa-solid fa-spinner" class="anim-rotate-step-8" /></span>
            
        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from "pinia"

import {useStateStore} from "@/store/StateStore"

const stateStore = useStateStore()
const {loadingReason} = storeToRefs(stateStore)

</script>

<style lang="scss" scoped>
    $height: 80px;
    $width: 300px;

    .modal-container {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center; /*x-axis*/
        align-items: flex-start; /*y-axis*/
    }

    .message-container {
        color: black;
    }
</style>