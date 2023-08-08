import { defineStore } from 'pinia'

export const useStateStore = defineStore('state', {
    state: () => ({
        // Imported file info
        importedFileName: null,

        // Layout
        activeView: 'pcp',
        showCategorySettingsWindow: false,

        // Data
        selectedCategory: null,

        // Misc
        loadingReason: null,        // If not null, then something is loading, preventing the user from interacting with the interface.
    }),
    getters: {},
    actions: {
        setView(view) {
            this.activeView = view
        },
        setLoading(reason) {
            this.loadingReason = reason
        },
        clearLoading() {
            this.loadingReason = null
        }
    },
})
