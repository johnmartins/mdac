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
                            <th class="header" v-for="c in categories" :key="c.id">
                                <div class="rotated-header"><span>{{ c.title }}</span></div>
                            </th>
                        </tr>
                    </thead>
                    <tbody class="table-bordered">
                        <tr v-for="(d, index) in data.filter(dataStore.dataPointFilterCheck)" :key="index">
                            <td v-for="c in categories" :key="c.id">
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
const {data, filters, categories} = storeToRefs(dataStore)

</script>

<style lang="scss" scoped>
    .table-fixed-header {
        font-size: 0.7em;
        font-family: monospace;
        overflow: auto;
        border-collapse: separate;
        border-spacing: 0;

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
            height: 140px;
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