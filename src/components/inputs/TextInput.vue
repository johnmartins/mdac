<template>
    <div class="input-group input-group-sm mb-2">
        <div class="input-group-prepend">
            <span class="input-group-text" id="inputGroup-sizing-sm"><slot></slot></span>
        </div>
        <input type="text" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm" :value="value" @keyup="onChange">
    </div>
  
</template>

<script setup>
    const props = defineProps({
        value: [Number, String]
    })
    const emit = defineEmits(['change'])

    function onChange(evt) {
        console.log(evt.target.value)
        emit('change', evt.target.value)
    }

</script>

<style lang="scss" scoped>
    .input-group-text {
        font-size: 0.8em;
        width: 60px;
        padding: 0.1em 0 0.1em 0.4em;


    }
    .input-group-prepend {
        padding: 0;
    }

    .form-control  {
        padding: 0.1em 0 0.1em 0.4em;
        font-size: 0.6em !important;
        font-family: monospace;
        font-weight: bold;
        text-align: right;
    }

</style>