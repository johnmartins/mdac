import { defineStore } from 'pinia'

export const useScatterStore = defineStore('scatter', {
    state: () => {
        return { 
            // Plots
            plots: [],              // Plot configs
            selectedPlotID: null,
            selectedPlot: null,
            plotIDMap: new Map(),    // ID -> PlotConfig

            // Data
            selectedDataIndex: -1,

            // Boundaries
            plotXBounds: [],
            plotYBounds: [],

            // Layout parameters
            padding: 120
        }
    },
    getters: {
        xAxisLength: (state) => {
            return state.plotXBounds[1] - state.padding
        },
        yAxisLength: (state) => {
            return state.plotYBounds[1] - state.padding
        }
    },
    actions: {
        addPlot (spc) {
            this.plots.push(spc)
            this.plotIDMap.set(spc.id, spc)
        },
        setSelectedPlot (plotID) {
            plotID = parseInt(plotID)
            if (plotID === null) {
                this.selectedPlotID = null
                this.selectedPlot = null
                return
            }
            this.selectedPlotID = plotID
            this.selectedPlot = this.plotIDMap.get(plotID)
        },
        getPlotByID (plotID) {
            return this.plotIDMap.get(plotID)
        },
        getSelectedPlot () {
            return this.selectedPlot
        }
    },
})