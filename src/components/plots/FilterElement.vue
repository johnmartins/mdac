<template>
    <div class="filter-element-container">
        <div>
            <input :value="Math.round(filter.thresholdA*100)/100" type="number" 
            :step="componentParameters.stepSize"
            @change="editFilter($event, 'A')"
            ref="inputThresholdA"
            />
        </div>
        <div>
            &le;
        </div>
        <div class="property-container">
            {{filter.property}}
        </div>
        <div>
            &le;
        </div>
        <div>
            <input :value="Math.round(filter.thresholdB*100)/100" type="number" 
            :step="componentParameters.stepSize"
            @change="editFilter($event, 'B')" 
            ref="inputThresholdB"
            />
            
        </div>
        <div class="delete-container" @click.prevent="deleteFilter">
            X
        </div>
    </div>
</template>

<script setup>
import { inject, ref } from "vue"
import DataFilter from '@/models/plots/DataFilter'

    const props = defineProps({
        filter: Object
    })
    const eventBus = inject('eventBus')

    const inputThresholdA = ref(null)
    const inputThresholdB = ref(null)

    const componentParameters = {
        stepSize: Math.pow(10, Math.floor(props.filter.thresholdB).toString().length - 1)/100,
    }

    function deleteFilter () {
        const f = props.filter
        eventBus.emit('FilterElement.deleteFilter', f)
    }

    function editFilter (evt) {
        const tA = parseFloat(inputThresholdA.value.value)
        const tB = parseFloat(inputThresholdB.value.value)

        const of = props.filter
        const nf = new DataFilter(of.property, tA, tB)

        eventBus.emit('FilterElement.editFilter', [of, nf])
    }

</script>

<style lang="scss" scoped>
    .filter-element-container {
        font-size: 0.6em;
        display: grid;
        grid-template-columns: 50px 8px auto 8px 50px 5px; 

        .property-container {
            font-weight: bold;
            text-align: center;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        input[type=number] {
            width: 50px;
            padding: 0 4px 0 4px;
            font-family: monospace;
            text-align: center;
            border: none;
        }

        .delete-container {
            cursor: pointer;
            color: red;
        }
    }
</style>