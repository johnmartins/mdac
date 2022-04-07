<template>
    <div class="card mt-3">
        <div class="control-group p-2">
            <strong>Data source</strong>
            <input class="form-control form-control-sm mb-2" id="formFileSm" type="file" ref="fileInput" @change="readFile">

            <div class="labeled-form">                
                <span>Delimiter:</span>
                <select name="delimiter" id="formFileDelimiter" ref="fileDelimiterSelect" @change="readFile">
                    <option value="," selected>Comma ","</option>
                    <option value=";">Semi-colon ";"</option>
                    <option value="\t">Tab "\t"</option>
                </select>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, inject } from "vue"

// DOM references
const fileDelimiterSelect = ref(null)
const fileInput = ref(null)

// Listeners
const eventBus = inject('eventBus')

function readFile () {
    eventBus.emit('SourceForm.readFile', {file: fileInput.value.files[0], delimiter: fileDelimiterSelect.value.value})
}
</script>

<style>

</style>