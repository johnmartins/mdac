import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import faIcons from "./fontawesome"

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

import mitt from 'mitt'
import { createPinia } from 'pinia'

const eventBus = mitt()

const app = createApp(App)
app.provide('eventBus', eventBus)
app.use(createPinia())
app.use(router)
app.mount('#app')
app.component("font-awesome-icon", faIcons)

// Handle errors globally. Send via event bus
app.config.errorHandler = (err, instance, info) => {
    eventBus.emit('main.error', err)
    console.error(err)
}