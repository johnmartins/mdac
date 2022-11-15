import { defineStore } from 'pinia'
import * as d3 from "d3"

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

            // Color coding
            selectedColorCodeCategory: null,
            useSimilarityColorCoding: true,
            overrideColorCodeColumn: null,
            overrideColorCodeFunction: null,

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
        },
        getSampleColor (d) {
            if (this.overrideColorCodeFunction) return this.overrideColorCodeFunction(d[this.overrideColorCodeColumn])
            if (!this.selectedColorCodeCategory) return () => 'black'

            if (!this.selectedColorCodeCategory.usesCategoricalData) {
                return d3.scaleSequential()
                    .domain([this.selectedColorCodeCategory.lb, this.selectedColorCodeCategory.ub])
                    .interpolator(d3.interpolateRgbBasis(["blue", "green", "yellow", "red"]))(d[this.selectedColorCodeCategory.title])
            } else {
                return d3.scaleOrdinal()
                    .domain(this.selectedColorCodeCategory.availableCategoricalValues)
                    .range(d3.schemeCategory10)(d[this.selectedColorCodeCategory.title])
            }
        }
    },
})