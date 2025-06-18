<template>
    <div class="labeled-input-container mb-1" >
        <div @click="cbox.click()" class="clickable">
            <span class="input-group-text">
                <slot />
            </span>
        </div>
        <div style="display:flex; justify-content: end;">
            <input 
                ref="cbox"
                type="checkbox" 
                v-model="model"
            >
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";

const model = defineModel();

const cbox = ref(null);

</script>

<style lang="scss" scoped>

    .labeled-input-container {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.5em;
    }
    
    .input-group-text {
        font-size: 0.8em;
        min-width: 50px;
        padding: 0.1em 0.5em 0.1em 0.4em;


    }
    .input-group-prepend {
        padding: 0;
    }

    .form-control  {
        padding: 0.1rem 0 0.1rem 0.4rem;
        font-size: 0.8em !important;
        font-family: monospace;
        text-align: right;
        padding-right: 4px;
    }

    .input-number {
        height: 1.8em;
        font-size: 0.8em;
        min-width: 30px;
    }

</style>