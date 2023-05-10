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
                            <th class="header" v-for="c in categoriesSorted" :key="c.id">
                                <div class="rotated-header" :title="c.title"><span>{{ c.title }}</span></div>
                                <div>
                                    [INPUT]
                                </div>
                                <div class="header-tool-box">
                                    <div>
                                        <faicon class="clickable me-1" title="Move left" icon="fa-solid fa-circle-arrow-left" 
                                        @click="moveCategory(c, -1)" />
                                    </div>
                                    <div>
                                        <faicon class="clickable me-1" title="Sort" icon="fa-solid fa-sort" />
                                        <span v-if="!c.enabled" class="text-danger" @click="toggleDisableEnable(c)">
                                            <faicon class="clickable me-1" title="Disabled" icon="fa-solid fa-circle-xmark" />
                                        </span>
                                        <span v-else class="text-success" @click="toggleDisableEnable(c)">
                                            <faicon class="clickable me-1" title="Enabled" icon="fa-solid fa-circle-check" />
                                        </span>
                                    </div>
                                    <div>
                                        <faicon class="clickable me-1" title="Move right" icon="fa-solid fa-circle-arrow-right" 
                                        @click="moveCategory(c, 1)" />
                                    </div>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody class="table-bordered">
                        <tr v-for="(d, index) in data.filter(dataStore.dataPointFilterCheck)" :key="index">
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

import { reactive, ref, onMounted, onUpdated } from "vue"
import { storeToRefs } from "pinia"

import {useDataStore} from "@/store/DataStore"

const dataStore = useDataStore()
const {data, filters, categoriesSorted} = storeToRefs(dataStore)

function moveCategory (category, n) {
    dataStore.moveCategory(category, n)
}


function sortBy (category) {

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