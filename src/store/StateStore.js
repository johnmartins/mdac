import { defineStore } from 'pinia'
import { nextTick } from 'vue';

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

        // Queued re-renders
        reRenderMvGrid: true
    }),
    getters: {},
    actions: {
        queueReRenders () {
            this.reRenderMvGrid = true
        },
        setView(view) {
            this.activeView = view;
        },
        async setLoading(reason) {
            this.loadingReason = reason;
            await nextTick();
            return new Promise(resolve => setTimeout(resolve, 0));
        },
        async clearLoading() {
            this.loadingReason = null;
            return new Promise(resolve => setTimeout(resolve, 0));
        }
    },
})
