<template>
    <div style="overflow: auto;">
        <h3>Data list</h3>
        <table class="table table-sm table-striped">
            <thead>
                <tr>
                    <th v-for="c in categories" :key="c.id">
                        <div><span>{{c.title}}</span></div>
                    </th>
                </tr>
            </thead>
            <tbody class="table-bordered">
                <tr v-for="(d, index) in data" :key="index">
                    <td v-for="c in categories" :key="c.id">
                        {{d[c.title]}}
                    </td>
                </tr>

            </tbody>
        </table>
    </div>
</template>

<script setup>

import { reactive, ref, onMounted, onUpdated, inject } from "vue"

const eventBus = inject('eventBus')
const categories = ref([])
const data = ref([])

// Event bus
eventBus.on('PCPlot.readData', setData)
eventBus.on('PCPlot.addCategory', (c) => categories.value.push(c))
eventBus.on('PCPlot.onFilterChange', setData)
eventBus.on('PlotTools.readFile', clearCategories)

function clearCategories () {
    categories.value = []
}

function setData(d) {
    data.value = d
}

</script>

<style lang="scss" scoped>
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