<template>

<div 
    v-if="stateStore.showColorSettingsWindow" 
    class="modal-mask dark"
    @click="closeAndRedraw"
>

    <div class="window box-shadow small" @click.stop>
        <div class="window-body">

        <div class="window-header">
            <strong>Category settings</strong>
        </div>

            <div style="display: flex; flex-direction: row; justify-content: space-between; gap: 4px; width: 300px;">
                <div>
                    <div><strong>Continuous data</strong></div>
                    <div v-for="(color, i) in optionsStore.colorRangeContinuous" :key="i">
                        <div class="color-row">
                            <span>{{ twoDigits(i+1) }}</span>
                            
                            <input 
                                type="color" 
                                class="color-input"
                                v-model="optionsStore.colorRangeContinuous[i]"
                            />

                            <span class="icons">
                                <faicon 
                                    class="clickable me-1"
                                    title="Add after" 
                                    icon="fa-solid fa-square-plus"
                                    @click="addColor(i, 'cont')" 
                                />
                                <faicon 
                                    class="clickable me-1" 
                                    title="Remove" 
                                    icon="fa-solid fa-trash" 
                                    @click="removeColor(i, 'cont')" 
                                />
                            </span>
                        </div>
                    </div>
                    
                </div>
                <div>
                    <div><strong>Categorical data</strong></div>
                    <div v-for="(color, i) in optionsStore.colorRangeCategorical" :key="i">
                        <div class="color-row">
                            <span>{{ twoDigits(i+1) }}</span>
                            <input 
                                type="color" 
                                class="color-input"
                                v-model="optionsStore.colorRangeCategorical[i]"
                            />
                            <span class="icons">
                                <faicon 
                                    class="clickable me-1" 
                                    title="Add after" 
                                    icon="fa-solid fa-square-plus" 
                                    @click="addColor(i, 'cat')" 
                                />
                                <faicon 
                                    class="clickable disabled me-1" 
                                    title="Remove" 
                                    icon="fa-solid fa-trash" 
                                    @click="removeColor(i, 'cat')" 
                                />
                            </span>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
        <div style="display: flex; justify-content: space-between;">
            <button class="small danger" @click="resetToDefault">Reset to default</button>
            <button class="small" @click="closeAndRedraw">Done</button>
        </div>
    </div>
</div>


</template>

<script setup>

import { inject } from 'vue';

// Stores
import { useOptionsStore } from '@/store/OptionsStore';
import { useStateStore } from '@/store/StateStore';
const stateStore = useStateStore();
const optionsStore = useOptionsStore();

const eventBus = inject('eventBus');

function twoDigits (number) {
    let numStr = ""+number;
    if (numStr.length === 1) {
        numStr = "0"+numStr;
    }
    return numStr;
}

function resetToDefault () {
    optionsStore.resetRangeColors();
}

function addColor (index, type) {
    if (['cont', 'cat'].indexOf(type) < 0) {
        throw new Error(`Unknown color type ${type}`);
    }

    let targetArray;

    if (type === 'cat') {
        targetArray = optionsStore.colorRangeCategorical;
    } else if (type === 'cont') {
        targetArray = optionsStore.colorRangeContinuous;
    }
    
    targetArray.splice(index+1, 0, '#FF0000');

}

function removeColor (index, type) {
    if (['cont', 'cat'].indexOf(type) < 0) {
        throw new Error(`Unknown color type ${type}`);
    }

    let targetArray;

    if (type === 'cat') {
        targetArray = optionsStore.colorRangeCategorical;
    } else if (type === 'cont') {
        targetArray = optionsStore.colorRangeContinuous;
    }

    if (targetArray.length < 2) {
        console.warn('Cannot delete final color element.');
        return;
    }

    targetArray.splice(index, 1)

}

function closeAndRedraw () {
    stateStore.showColorSettingsWindow = false;
    eventBus.emit('PCPRasterLayer.RequestPCPRedraw');
}



</script>

<style lang="scss" scoped>

.color-input {
    height: 1rem;
    width: 100%;
    min-height: 1rem;
    padding: 0;
    cursor: pointer;
    border: 1px solid whitesmoke;
}

.window {
    min-height: 350px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .window-body {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
}

.color-row {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 2px;

    .icons {
        display: flex;
        flex-direction: row;
        opacity: 0;
    }

    &:hover {
        .icons {
            opacity: 1;
        }
    }
}



</style>