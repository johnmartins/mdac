<template>    
    <div v-if="editedCategory" class="card mt-3">
        <div class="control-group p-2">
            <strong>Edit selected category</strong>
            <TextInput v-model="editedCategory.displayTitle">Title</TextInput>
            <div v-if="editedCategory.usesCategoricalData == false">
                <TextInput v-model.number="editedCategory.ub">UB</TextInput>
                <TextInput v-model.number="editedCategory.lb">LB</TextInput>
                <TextInput v-model.number="editedCategory.ticks">Ticks</TextInput>
            </div>

            <div class="btn-group" style="width: 100%">
                <button class="btn btn-success btn-sm" @click="editCategory">Update</button>
                <button v-if="selectedCategory.enabled" class="btn btn-danger btn-sm" @click="disableCategory">Disable</button>
                <button v-if="!selectedCategory.enabled" class="btn btn-primary btn-sm" @click="enableCategory">Enable</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from "vue"
import { storeToRefs } from "pinia"

// Stores
import {useDataStore} from "@/store/DataStore"
import {useStateStore} from "@/store/StateStore"

// Components
import TextInput from '@/components/inputs/TextInput'
    
// Models
import Category from '@/models/plots/Category'

const dataStore = useDataStore()
const stateStore = useStateStore()

const {selectedCategory} = storeToRefs(stateStore)
const editedCategory = ref(null)

watch(selectedCategory, () => {
    if (!selectedCategory.value) {
        editedCategory.value = null
        return
    }

    // The reason we do this insead of using v-models directly on the inputs is because
    // utilizing v-models for huge data sets can be very slow. Decoupling the edited and real variable
    // allows the user to edit the category with normal speed regardless of data set size.
    let newCat = new Category("$$TEMPORARY_CATEGORY$$", 0, 1, {overwrite: true})
    newCat.morph(selectedCategory.value, {migrateReference: false})
    editedCategory.value = newCat
})

function disableCategory () {
    selectedCategory.value.enabled = false
}

function enableCategory () {
    selectedCategory.value.enabled = true
}

function editCategory () {
    selectedCategory.value.morph(editedCategory.value, {migrateReference: false})
}

</script>

<style lang="scss" scoped>

</style>