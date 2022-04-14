import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', {
    state: () => {
        return { 
            activeView: 'pcp',
        }
    },
    actions: {
        setView(view) {
            this.activeView = view
        }
    },
})