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
            selectedSecondaryDataID: -1,
            selectedSecondaryDataPoint: null,

            // Color coding
            selectedColorCodeColumn: null,
            overrideColorCodeColumn: null,
            overrideColorCodeFunction: null,

            // Boundaries
            plotXBounds: [],
            plotYBounds: [],

            // Layout parameters
            padding: 120,

            // Similarity
            useSimilarityColorCoding: true,
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
            if (this.overrideColorCodeColumn) {
                return this.getSampleColorWithValue(d[this.overrideColorCodeColumn])
            } 
            if (!this.selectedColorCodeColumn) return 'black'
            return this.getSampleColorWithValue(d[this.selectedColorCodeColumn.title])
        },
        getSampleColorWithValue (value) {
            if (this.overrideColorCodeFunction) return this.overrideColorCodeFunction(value)
            if (!this.selectedColorCodeColumn) return () => 'black'

            if (!this.selectedColorCodeColumn.usesCategoricalData) {
                return d3.scaleSequential()
                    .domain([this.selectedColorCodeColumn.lb, this.selectedColorCodeColumn.ub])
                    .interpolator(d3.interpolateRgbBasis(["blue", "green", "yellow", "red"]))(value)
            } else {
                return d3.scaleOrdinal()
                    .domain(this.selectedColorCodeColumn.availableCategoricalValues)
                    .range(d3.schemeCategory10)(value)
            }
        },
        resetColorCodeOverride () {
            this.overrideColorCodeColumn = null
            this.overrideColorCodeFunction = null
        },
        resetDataSelection () {
            this.selectedDataID = -1
            this.selectedDataPoint = null
            this.selectedSecondaryDataID = -1
            this.selectedSecondaryDataPoint = null
        },
        getActiveColorCodeColumn () {
            if (this.overrideColorCodeColumn) return this.overrideColorCodeColumn
            return this.selectedColorCodeColumn
        }
    },
})