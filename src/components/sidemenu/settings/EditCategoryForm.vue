<template>    
    <SidebarSection 
        ref="sidebarSection"
        title="Modify axis"
        :start-maximized="false"
    >
        <div v-if="editedCategory">
            <div class="control-group" @keyup.enter="editCategory">
                <strong>Edit selected axis</strong>
                <TextInput v-model="editedCategory.displayTitle">Title</TextInput>
                <div v-if="editedCategory.usesCategoricalData == false">
                    <TextInput v-model.number="editedCategory.ub">Upper bound</TextInput>
                    <TextInput v-model.number="editedCategory.lb">Lower bound</TextInput>
                    <TextInput v-model.number="editedCategory.ticks">Ticks</TextInput>
                </div>

                <div class="button-group" style="width: 100%">
                    <button 
                        class="small success" 
                        @click="editCategory"
                    >
                        Update
                    </button>
                    
                    <button 
                        class="small info" 
                        @click="flipCategory" 
                    >
                        Flip
                    </button>
                    <button 
                        v-if="selectedCategory.enabled" 
                        class="small danger" 
                        @click="disableCategory"
                    >
                        Disable
                    </button>
                    <button 
                        v-if="!selectedCategory.enabled" 
                        class="small" 
                        @click="enableCategory"
                    >
                        Enable
                    </button>
                </div>
            </div>
        </div>
        <div v-else style="text-align: left;">
            <span>Select a column header in the PCP plot</span>
        </div>
    </SidebarSection>
</template>

<script setup>
import { ref, watch, inject } from "vue";
import { storeToRefs } from "pinia";

// Stores
import {useStateStore} from "@/store/StateStore";

// Components
import TextInput from '@/components/inputs/TextInput';
import SidebarSection from '@/components/layouts/SidebarSection';
    
// Models
import Category from '@/models/plots/Category';

// DOM
const sidebarSection = ref(null);

const stateStore = useStateStore();

const {selectedCategory} = storeToRefs(stateStore);
const editedCategory = ref(null);

const eventBus = inject('eventBus');

watch(selectedCategory, () => {
    if (!selectedCategory.value) {
        editedCategory.value = null;
        return;
    }

    sidebarSection.value.maximized = true;

    // The reason we do this insead of using v-models directly on the inputs is because
    // utilizing v-models for huge data sets can be very slow. Decoupling the edited and real variable
    // allows the user to edit the category with normal speed regardless of data set size.
    let newCat = new Category("$$TEMPORARY_CATEGORY$$", 0, 1, {overwrite: true});
    newCat.morph(selectedCategory.value, {migrateReference: false});
    editedCategory.value = newCat;
})

function disableCategory () {
    selectedCategory.value.enabled = false;
}

function enableCategory () {
    selectedCategory.value.enabled = true;
}

function flipCategory () {
    editedCategory.value.flip();
    editCategory();
    if (editedCategory.value.usesCategoricalData) {
        eventBus.emit('RedrawCategoricalFilters', selectedCategory.value);
    }
    eventBus.emit('flipCategory');
}

function editCategory () {
    selectedCategory.value.morph(editedCategory.value, {migrateReference: false});
    eventBus.emit('PCPRasterLayer.RequestPCPRedraw');
}

</script>

<style lang="scss" scoped>

</style>
