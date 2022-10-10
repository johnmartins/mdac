import { defineStore } from 'pinia'

export const useOptionsStore = defineStore('options', {
    state: () => ({

        /* Graphical options */
        // Plot fonts
        titleSize: 0.8,
        tickSize: 0.6,

        // PCP lines
        dataOpacity: 0.8,
        excludedDataOpacity: 0,
        hideExcluded: true,
        curveType: 'line'

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
        }
        
    },
})
