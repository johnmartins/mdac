<template>
    <div class="title-block clickable" @click="toggleMaximized">
        <slot />
        <div>
            <span v-if="props.maximized" class="clickable-icon">
                <faicon icon="fa-solid fa-chevron-up" />
            </span>
            <span v-if="!props.maximized" class="clickable-icon">
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

function toggleMaximized () {
    if (props.maximized) {
        emit('on-do-minimize')
    } else {
        emit('on-do-maximize')
    }
}

</script>
<style lang="scss" scoped>


</style>