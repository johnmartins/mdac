import { defineStore } from 'pinia'

export const useStateStore = defineStore('state', {
    state: () => ({
            // Layout
            activeView: 'pcp',

            // Data
            selectedCategory: null,
        }),
    getters: {},
    actions: {
        setView(view) {
            this.activeView = view
        }
    },
})
