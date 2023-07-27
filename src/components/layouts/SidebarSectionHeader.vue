<template>
    <div class="title-block">
        <slot />
        <div>
            <span v-if="props.maximized" class="clickable-icon" @click="emit('on-do-minimize')">
                <faicon icon="fa-solid fa-chevron-up" />
            </span>
            <span v-if="!props.maximized" class="clickable-icon" @click="emit('on-do-maximize')">
                <faicon icon="fa-solid fa-chevron-down" />
            </span>
        </div>
    </div>
</template>
<script setup>

const emit = defineEmits(['on-do-minimize', 'on-do-maximize'])
const props = defineProps({
    maximized: {
        type: Boolean,
        required: true,
    }
})

</script>
<style lang="scss" scoped>


</style>