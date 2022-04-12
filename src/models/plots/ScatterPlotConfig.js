class ScatterPlotConfig {
    static counter = 0
    constructor () {
        this.id = ScatterPlotConfig.counter
        this.xAxisCategoryName = null
        this.yAxisCategoryName = null
        
        ScatterPlotConfig.counter++
    }
}

export default ScatterPlotConfig