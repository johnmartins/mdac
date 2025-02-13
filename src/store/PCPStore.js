import { defineStore } from 'pinia'

export const usePCPStore = defineStore('pcp', {
    state: () => ({
        // Layout parameters
        horizontalOffset: 100,
        axisLength: 100,

        // Rendering
        renderingType: 'raster',
        resolution: 1.2,
        resolutionManualOverride: false,
        pathsDataUrl: null,

        // Bounds
        plotXBounds: [0, 500],
        plotYBounds: [0, 500],

        // Layout parameters
        axisLabelMargin: 12,
        axisLabelAngle: 45,
        plotTopPadding: 75,
        plotRightPadding: 150,
        plotBottomPadding: 120,
        plotLeftPadding: 75,
        filterMinDragTime: 125,

        // PCP State
        currentFilterStartTime: 0,
        currentFilterCategory: null,
        currentFilterDeltaTime: 0,
        currentFilterStartValue: 0,
        currentFilterEndValue: 0,

    }),
    getters: {},
    actions: {
        detectAppropriateGraphicsSettings (samplesize) {
            if (this.resolutionManualOverride) return
            
            this.renderingType = 'raster'
            if (samplesize <= 800) {
                this.renderingType = 'vector'
            } else if (samplesize <= 1000) {
                this.resolution = 1.2
            } else if (samplesize <= 10000) {
                this.resolution = 1.0
            } else if (samplesize <= 100000) {
                this.resolution = 0.8
            }
        }
    },
})
