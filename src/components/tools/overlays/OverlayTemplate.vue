<template>

    <div class="dp-info-overlay p-2" :style="{left: props.x+'px', top: props.y+'px'}">
        <div class="header">
            <button class="btn-close btn-sm mb-2 mt-0" style=""></button>
        </div>
        
        <div class="content p-2">
            <slot></slot>
        </div>
    </div>

</template>

<script setup>

const props = defineProps({
    x: Number,
    y: Number
})

</script>

<style lang="scss" scoped>

.dp-info-overlay {
    position: absolute;
    border: 1px solid whitesmoke;
    background: white;
    font-family: monospace;
    font-size: 0.8em;

    .content {
        max-height: 200px;
        min-width: 150px;
        overflow-y: auto;
        text-align: left;
    }
    
    .header {
        border-bottom: 1px solid whitesmoke;
        text-align: right;
        
        button {
            font-size: 0.6em;
        }
    }
}

</style>