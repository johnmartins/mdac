<template>
    <div class="container-fuild" style="height: 100%; overflow: auto;">
        <div class="row p-0 m-0">
            <div class="col p-0 m-0">
                <!-- Future data list tools goes here -->
            </div>
        </div>
        <div class="row p-0 m-0">
            <div class="col p-0 m-0">
                <table class="table-fixed-header table table-sm table-striped">
                    <thead>
                        <tr>
                            <th v-for="c in categoriesSorted" :key="c.id" class="header">
                                <div class="rotated-header" :title="c.displayTitle"><span>{{ c.displayTitle }}</span></div>
                                <div class="clickable" @click="shiftIO(c)" style="user-select: none;">
                                    <span v-if="c.io"><span :class="{'text-success': c.io == 'input', 'text-danger': c.io == 'output'}">[{{ c.io.toUpperCase() }}]</span></span>
                                    <span v-else class="text-info">[undef]</span>
                                </div>
                                <div class="header-tool-box">
                                    <div>
                                        <faicon
                                            class="clickable me-1" title="Move left" icon="fa-solid fa-circle-arrow-left" 
                                            @click="moveCategory(c, -1)"
                                        />
                                    </div>
                                    <div>
                                        <faicon class="clickable me-1" :class="{'text-info': sortCategoryID === c.id}" title="Sort" icon="fa-solid fa-sort" @click="sortBy(c)" />

                                        <span v-if="!c.enabled" class="text-danger" @click="toggleDisableEnable(c)">
                                            <faicon class="clickable me-1" title="Disabled" icon="fa-solid fa-circle-xmark" />
                                        </span>
                                        <span v-else class="text-success" @click="toggleDisableEnable(c)">
                                            <faicon class="clickable me-1" title="Enabled" icon="fa-solid fa-circle-check" />
                                        </span>
                                    </div>
                                    <div>
                                        <faicon
                                            class="clickable me-1" title="Move right" icon="fa-solid fa-circle-arrow-right" 
                                            @click="moveCategory(c, 1)"
                                        />
                                    </div>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody class="table-bordered">
                        <tr v-for="(d, index) in data.filter(dataStore.dataPointFilterCheck).sort(sortFunction)" :key="index">
                            <td v-for="c in categoriesSorted" :key="c.id">
                                {{ d[c.title] }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>

import { reactive, ref, onMounted, onUpdated, nextTick } from "vue"
import { storeToRefs } from "pinia"

import {useDataStore} from "@/store/DataStore"
import {useStateStore} from "@/store/StateStore"

const dataStore = useDataStore()
const stateStore = useStateStore()
const {data, filters, categoriesSorted} = storeToRefs(dataStore)

// Sorting
const sortCategoryID = ref(null)
const sortReversed = ref(false)
const sortFunction = ref((a,b) => {
    return a
})

function shiftIO (category) {
    if (category.usesCategoricalData) {
        console.warn('Cannot change IO-type for categorical data.');
        return;
    }
    if (category.io === 'input') category.io = 'output';
    else if (category.io === 'output') category.io = null;
    else if (category.io === null) category.io = 'input';
}

function moveCategory (category, n) {
    dataStore.moveCategory(category, n)
}


async function sortBy (category) {
    await stateStore.setLoading('Sorting data')

    if (sortCategoryID.value) {
        if (sortCategoryID.value === category.id) {
            sortReversed.value = !sortReversed.value
        }
    }
    
    await nextTick();
    
    sortFunction.value = (a,b) => {
        let valA = a[category.title]
        let valB = b[category.title]
        if (!category.usesCategoricalData) {
            valA = parseFloat(valA)
            valB = parseFloat(valB)
        }
        if (valA > valB) return sortReversed.value ? -1 : 1
        if (valA < valB) return sortReversed.value ? 1 : -1
        return 0
    }
    sortCategoryID.value = category.id
    
    await stateStore.clearLoading()
}

function toggleDisableEnable (category) {
    category.enabled = !category.enabled
}

</script>

<style lang="scss" scoped>
    .table-fixed-header {
        font-size: 0.8em;
        font-family: monospace;
        overflow: auto;
        border-collapse: separate;
        border-spacing: 0;
        
        .header-tool-box {
            border: 1px solid whitesmoke; 
            text-align: left;
            padding: 2px 5px 0px 5px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            font-size: 0.9rem;

            div {
                text-align: center;
            }
        }

        .header {
            vertical-align: bottom;
        }
        thead tr {
            position: sticky;
            top: 0;
            z-index: 1;
            background: white;
        }

        th {
            height: 200px;
            white-space: nowrap;
            padding: 0 !important;
            border-bottom: 2px solid black;
            
        }

        .rotated-header {
            transform: translate(0.2em, 0) rotate(310deg);
            width: 30px;
        }

        th > div > span {
            padding: 5px 10px;
        }

        td {
            border: 1px solid black;
            border-collapse: separate;
            padding: 1px;
            text-align: right;
        }
    }

</style>