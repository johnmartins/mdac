import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

import mitt from 'mitt'

const eventBus = mitt()

const app = createApp(App)
app.use(router)
app.provide('eventBus', eventBus)
app.mount('#app')