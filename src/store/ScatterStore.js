import { defineStore } from 'pinia'

export const useScatterStore = defineStore('scatter', {
    state: () => {
        return { 
            plots: []
        }
    },
    actions: {
        AddPlotConfiguration(spc) {
            this.plots.push(scp)
        },
    },
})