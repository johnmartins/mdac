import { defineStore } from 'pinia'
import * as d3 from "d3"

export const useOptionsStore = defineStore('options', {
    state: () => ({

        /* Graphical options */
        // Plot fonts
        titleSize: 1.0,
        tickSize: 0.8,

        // Color-coding
        selectedColorCodeCategory: null,
        overrideColorCodeColumn: null,
        overrideColorCodeFunction: null,
        colorCodeUpperBound: null,
        colorCodeLowerBound: null,
        useSimilarityColorCoding: true,

        // PCP lines
        includedDataOpacity: 1,
        excludedDataOpacity: 0,
        hideExcluded: true,
        curveType: 'line',

        // Misc
        showFilters: true,

    }),
    getters: {},
    actions: {

        setExcludedDataOpacity (opacity) {
            if (opacity < 0.001) {
                this.hideExcluded = true
            } else {
                this.hideExcluded = false
            }

            this.excludedDataOpacity = opacity
        },
        getSampleColor (d) {
            if (this.overrideColorCodeColumn) {
                return this.getSampleColorWithValue(d[this.overrideColorCodeColumn])
            } 
            if (!this.selectedColorCodeCategory) return 'black'
            return this.getSampleColorWithValue(d[this.selectedColorCodeCategory.title])
        },
        getSampleColorWithValue (value) {
            if (this.overrideColorCodeFunction) return this.overrideColorCodeFunction(value)
            if (!this.selectedColorCodeCategory) return () => 'black'

            if (!this.selectedColorCodeCategory.usesCategoricalData) {
                return d3.scaleSequential()
                    .domain([this.selectedColorCodeCategory.lb, this.selectedColorCodeCategory.ub])
                    .interpolator(d3.interpolateRgbBasis(["blue", "green", "yellow", "red"]))(value)
            } else {
                return d3.scaleOrdinal()
                    .domain(this.selectedColorCodeCategory.availableCategoricalValues)
                    .range(d3.schemeCategory10)(value)
            }
        },
        resetColorCodeOverride () {
            this.overrideColorCodeColumn = null
            this.overrideColorCodeFunction = null

            if (!this.selectedColorCodeCategory) return

            this.colorCodeLowerBound = this.selectedColorCodeCategory.lb
            this.colorCodeUpperBound = this.selectedColorCodeCategory.ub

        },
        resetColorCoding () {
            this.resetColorCodeOverride()
            this.selectedColorCodeCategory = null,
            this.colorCodeLowerBound = null
            this.colorCodeUpperBound = null

        },
        getActiveColorCodeColumnTitle () {
            if (this.overrideColorCodeColumn) return this.overrideColorCodeColumn
            if (this.selectedColorCodeCategory) return this.selectedColorCodeCategory.title
            return null
        },
        getActiveColorCodeColumn () {
            if (this.overrideColorCodeColumn) return this.overrideColorCodeColumn
            if (this.selectedColorCodeCategory) return this.selectedColorCodeCategory
        }
    },
})
