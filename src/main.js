import { createApp } from 'vue';

import App from './App.vue';

import faIcons from "./fontawesome.js";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

import mitt from 'mitt';
import { createPinia } from 'pinia';

const eventBus = mitt();

const app = createApp(App);
app.provide('eventBus', eventBus);
app.use(createPinia());
app.component("Faicon", faIcons);
app.mount('#app');


// Handle errors globally. Send via event bus
app.config.errorHandler = (err, instance, info) => {
    eventBus.emit('main.error', err);
    console.error(err);
}