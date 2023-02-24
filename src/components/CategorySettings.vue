<template>
    <div class="modal-mask dark" v-if="categories.length > 0 && showCategorySettingsWindow">
        <div class="window box-shadow">
            <div class="window-header">
                <strong>Category settings</strong>
            </div>
            
            <div>
                <div class="list-container">
                        
                    <div class="c-element header">
                        <div>Column name</div>
                        <div>Data type</div>
                        <div>Input/Output</div>
                        <div>Enabled</div>
                    </div>
                
                
                    <div v-for="c in categories.sort(positionSort)" :key="c.id" class="c-element">
                        <div>
                            {{c.displayTitle}}
                        </div>
                        <div>
                            {{c.usesCategoricalData ? "Categorical" : "Numeric"}}
                        </div>
                        <div>
                            <select ref="formatSelector" v-model="c.io" :disabled="c.usesCategoricalData">
                                <option :value="null">Undefined</option>
                                <option value="input">Input</option>
                                <option value="output">Output</option>
                            </select>
                        </div>
                        <div>
                            <input class="form-check-input" type="checkbox" v-model="c.enabled">
                        </div>
                    </div>
                </div>
                
                <div class="button-row mt-2">
                    <button class="btn btn-sm btn-primary close-button" 
                    @click="showCategorySettingsWindow=false">
                        Close
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import {storeToRefs} from "pinia"
import {useDataStore} from "@/store/DataStore"
import {useStateStore} from "@/store/StateStore"

const stateStore = useStateStore()
const {showCategorySettingsWindow} = storeToRefs(stateStore)
const dataStore = useDataStore()
const {categories} = storeToRefs(dataStore)

function positionSort (a, b) {
    if (a.position > b.position) return 1
    else if (a.position < b.position) return -1
    return 0
}

</script>

<style lang="scss" scoped>

$height: 80px;
$width: 300px;


.window {
    position: absolute;
    top: calc(50% - 2*$height);
    left: calc(50% - $width/2);
    background: white;
    border: 1px solid silver;
    border-radius: 4px;
    padding: 8px;
    overflow-y: auto;
    overflow-x: hidden;
    cursor: auto;
    font-size: 0.8em;    
    font-family: monospace;
}

.window-header {
    font-size: 1rem !important;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.button-row {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
}

.c-element {
    display: grid;
    grid-template-columns: auto 100px 100px 50px;
    grid-gap: 4px;
    border-bottom: 1px solid whitesmoke;

    div {
        text-align: left;
        text-overflow: ellipsis;
        overflow: hidden;
    }
}

.header {
    font-weight: bold;
}

.list-container {
    max-height: 40vh;
    overflow-y: auto;
}

</style>