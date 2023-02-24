import { defineStore } from 'pinia'

export const usePCPStore = defineStore('pcp', {
    state: () => ({
            horizontalOffset: 100,
            axisLength: 100,
            colorScaleCategory: null,
            colorScaleFunction: () => 'black',
            resolution: 1.2,
            pathsDataUrl: null,

            // Bounds
            plotXBounds: [0, 500],
            plotYBounds: [0, 500]
        }),
    getters: {},
    actions: {
        detectAppropriateResolution (samplesize) {
            if (samplesize <= 1000) {
                this.resolution = 1.2
            } else if (samplesize <= 10000) {
                this.resolution = 1.0
            } else if (samplesize <= 100000) {
                this.resolution = 0.8
            }

            console.log('Set resolution to ' + this.resolution)
        }
    },
})
