import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

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
