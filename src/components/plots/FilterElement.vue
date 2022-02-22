<template>
    <div class="filter-element-container">
        <div>
            {{Math.round(filter.thresholdA*100)/100}}
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
            {{Math.round(filter.thresholdB*100)/100}}
        </div>
        <div class="delete-container" @click.prevent="deleteFilter">
            X
        </div>
    </div>
</template>

<script setup>
import { inject } from "vue"

    const props = defineProps({
        filter: Object
    })
    const eventBus = inject('eventBus')

    function deleteFilter () {
        console.log("delete filter with ID = " + props.filter.id)
        eventBus.emit('FilterElement.deleteFilter', props.filter)
    }

</script>

<style lang="scss" scoped>
    .filter-element-container {
        font-size: 0.6em;
        display: grid;
        grid-template-columns: 50px 10px auto 10px 50px 5px; 

        .property-container {
            font-weight: bold;
            text-align: center;
        }

        .delete-container {
            cursor: pointer;
            color: red;
        }
    }
</style>