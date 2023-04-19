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
            selectedDataID: -1,
            selectedDataPoint: null,
            selectedSecondaryDataID: -1,
            selectedSecondaryDataPoint: null,

            // Boundaries
            plotXBounds: [],
            plotYBounds: [],

            // Layout parameters
            paddingTop: 120,
            paddingBottom: 120,
            paddingLeft: 140,
            paddingRight: 200,
            xAxisTitleMargin: 40,
            yAxisTitleMargin: 100,
        }
    },
    getters: {
        xAxisLength: (state) => {
            return state.plotXBounds[1] - state.paddingLeft
        },
        yAxisLength: (state) => {
            return state.plotYBounds[1] - state.paddingTop
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
        },

        resetDataSelection () {
            this.selectedDataID = -1
            this.selectedDataPoint = null
            this.selectedSecondaryDataID = -1
            this.selectedSecondaryDataPoint = null
        }
    },
})