<template>
    <div v-if="loadingReason" class="modal-mask loading modal-container">
        <div class="message-container anim-pulse">
            <span class="icon me-2"><faicon icon="fa-solid fa-spinner" class="anim-rotate-step-8" /></span>
            <span>{{ loadingReason }}</span>
        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from "pinia";

import {useStateStore} from "@/store/StateStore";

const stateStore = useStateStore();
const { loadingReason } = storeToRefs(stateStore);

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
        color: white;
        white-space: nowrap;
        height: 40px;
        display: flex;
        // Align in middle vertically
        justify-content: center; /*x-axis*/
        align-items: center; /*y-axis*/
    }
</style>