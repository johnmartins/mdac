<template>
    <div class="filter-element-container">
        <div>
            <input type="number" 
            :step="componentParameters.stepSize"
            @change="editFilter($event, 'A')"
            ref="inputThresholdA"
            />
        </div>
        <div>
            <span v-if="thresholdA <= thresholdB">&le;</span> <span v-else>&ge;</span>
        </div>
        <div class="category-container">
            <span v-if="categoryInfo.sourceObject">{{categoryInfo.displayTitle}}</span>
        </div>
        <div>
            <span v-if="thresholdA <= thresholdB">&le;</span> <span v-else>&ge;</span>
        </div>
        <div>
            <input type="number" 
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
import { inject, ref, onMounted, reactive } from "vue"
import DataFilter from '@/models/plots/DataFilter'
import Category from '@/models/plots/Category'

    const props = defineProps({
        filter: Object
    })
    const eventBus = inject('eventBus')
    eventBus.on('EditCategoryForm.editCategory', (c) => {
        if (c.id == categoryInfo.sourceObject.id) {
            categoryInfo.displayTitle = c.displayTitle
        }
    })

    const inputThresholdA = ref(null)
    const inputThresholdB = ref(null)
    const thresholdA = ref(0)
    const thresholdB = ref(1)
    const categoryInfo = reactive({
        sourceObject: null,
        displayTitle: null
    })

    const componentParameters = {
        stepSize: Math.pow(10, Math.floor(Math.log10(props.filter.thresholdA)))/100,
    }

    onMounted( () => {
        inputThresholdA.value.value = Math.round(props.filter.thresholdA*100)/100
        inputThresholdB.value.value = Math.round(props.filter.thresholdB*100)/100
        thresholdA.value = Math.round(props.filter.thresholdA*100)/100
        thresholdB.value = Math.round(props.filter.thresholdB*100)/100
        categoryInfo.sourceObject = Category.lookup(props.filter.targetCategoryTitle)
        categoryInfo.displayTitle = categoryInfo.sourceObject.displayTitle
    })

    function deleteFilter () {
        const f = props.filter
        eventBus.emit('FilterElement.deleteFilter', f)
    }

    function editFilter (evt) {
        const tA = parseFloat(inputThresholdA.value.value)
        const tB = parseFloat(inputThresholdB.value.value)
        thresholdA.value = tA
        thresholdB.value = tB

        const of = props.filter
        const nf = new DataFilter(of.targetCategoryTitle, tA, tB)

        eventBus.emit('FilterElement.editFilter', [of, nf])
    }

</script>

<style lang="scss" scoped>
    .filter-element-container {
        font-size: 0.6rem;
        display: grid;
        grid-template-columns: 25% 8px auto 8px 25% 5px; 

        .category-container {
            font-weight: bold;
            text-align: center;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        input[type=number] {
            width: 100%;
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