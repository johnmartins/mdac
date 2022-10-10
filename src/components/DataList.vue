<template>
    <div style="overflow: auto; height: 100%;">
        <div class="table-container">
            <table class="table table-sm table-striped">
                <thead>
                    <tr>
                        <th v-for="c in categories" :key="c.id">
                            <div><span>{{c.title}}</span></div>
                        </th>
                    </tr>
                </thead>
                <tbody class="table-bordered">
                    <tr v-for="(d, index) in data.filter(dataStore.dataPointFilterCheck)" :key="index">
                        <td v-for="c in categories" :key="c.id">
                            {{d[c.title]}}
                        </td>
                    </tr>
                </tbody>
            </table>
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

    .table-container {
        padding: 8px;
    }

    .table {
        font-size: 0.7em;
        border-spacing: collapse;

        th {
            height: 140px;
            white-space: nowrap;
            padding: 0 !important;
        }

        th > div {
            transform: translate(13px, 0) rotate(310deg);
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