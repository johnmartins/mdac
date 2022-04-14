class ScatterPlotConfig {
    static counter = 0
    constructor () {
        this.id = ScatterPlotConfig.counter
        this.title = `Plot ${this.id + 1}`
        this.xAxisCategoryName = null
        this.yAxisCategoryName = null
        this.titleOverride = false
        
        ScatterPlotConfig.counter++
    }
}

export default ScatterPlotConfig