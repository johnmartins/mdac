import { defineStore } from 'pinia'

export const useStateStore = defineStore('state', {
    state: () => ({
            // Layout
            activeView: 'pcp',
            showCategorySettingsWindow: false,

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
