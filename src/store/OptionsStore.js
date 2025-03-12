import { defineStore } from 'pinia'
import * as d3 from "d3"
import { useStateStore } from './StateStore';

export const useOptionsStore = defineStore('options', {
    state: () => ({

        /* Graphical options */
        // Plot fonts
        titleSize: 1.0,
        tickSize: 0.8,
        tickBackgroundOpacity: 0.6,

        // Color-coding
        selectedColorCodeCategory: null,
        overrideColorCodeColumn: null,
        overrideColorCodeFunction: null,
        colorCodeUpperBound: null,
        colorCodeLowerBound: null,
        useSimilarityColorCoding: true,
        showColorCodeLegend: true,
        rangeIndicatorTitleSize: 0.8,
        rangeIndicatorTickSize: 0.8,
        rangeIndicatorVerticalOffset: 0,
        rangeIndicatorHorizontalOffset: 20,

        // PCP lines
        showPcpLines: true,
        includedDataOpacity: 1,
        excludedDataOpacity: 0,
        hideExcluded: true,
        curveType: 'line',

        // Distributions
        showDistributions: false,
        distributionOpacity: 0.3,
        distributionFill: '#FF0000',
        distributionStroke: '#FFFFFF',

        // Misc
        showFilters: true,
        

    }),
    getters: {
        colorLegendOffsetV: (state) => {
            return parseInt(state.rangeIndicatorVerticalOffset);
        },
        colorLegendOffsetH: (state) => {
            return parseInt(state.rangeIndicatorHorizontalOffset);
        }
    },
    actions: {
        /**
         * Reset to refault options
         */
        wipe () {
            this.titleSize = 1.0;
            this.tickSize = 0.8;
            this.tickBackgroundOpacity = 0.6;

            this.selectedColorCodeCategory = null;
            this.overrideColorCodeColumn = null;
            this.overrideColorCodeFunction = null;
            this.colorCodeUpperBound = null;
            this.colorCodeLowerBound = null;
            this.useSimilarityColorCoding = true;
            this.showColorCodeLegend = true;

            this.includedDataOpacity = 1;
            this.excludedDataOpacity = 0;
            this.hideExcluded = true;
            this.curveType = 'line';

            this.showFilters = true;
            this.showDistributions = false;
        },
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

            useStateStore().queueReRenders();

        },
        resetColorCoding () {
            this.resetColorCodeOverride()
            this.selectedColorCodeCategory = null,
            this.colorCodeLowerBound = null
            this.colorCodeUpperBound = null

            useStateStore().queueReRenders();

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
