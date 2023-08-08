<template>
    <div class="side-menu-section">
        <SidebarSectionHeader 
            :maximized="maximized" 
            @on-do-maximize="maximize" 
            @on-do-minimize="minimize"
        >
            {{ props.title }}
        </SidebarSectionHeader>
        <div 
            class="side-menu-section-content" 
            :class="{'collapsed': maximized == false}"
        >
            <slot />
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import SidebarSectionHeader from './SidebarSectionHeader.vue';

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    startMaximized: {
        type: Boolean,
        required: false,
        default: true
    }
});

const maximized = ref(true)

defineExpose({
    maximized
})

onMounted(() => {
    maximized.value = props.startMaximized
})


function maximize () {
    maximized.value = true
}

function minimize () {
    maximized.value = false
}

</script>
<style lang="scss" scoped>
</style>