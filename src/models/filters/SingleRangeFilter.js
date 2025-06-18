import Filter from '@/models/filters/Filter.js'

class SingleRangeFilter extends Filter {

    constructor (columnID, thresholdA, thresholdB) {
        super()
        this.type = 'single-range'
        this.columnID = columnID
        this.thresholdA = thresholdA        
        this.thresholdB = thresholdB      
        
        // Threshold A is always lower than threshold B (A < B)
        if (this.thresholdA > this.thresholdB) {
            const intermediate = this.thresholdA
            this.thresholdA = this.thresholdB
            this.thresholdB = intermediate
        }
    }

    filter (value) {
        return value >= this.thresholdA && value <= this.thresholdB
    }

    static createFromRatios (c, y1Ratio, y2Ratio) {
        const thresholdA = c.getOutputFromRatio(y1Ratio)
        const thresholdB = c.getOutputFromRatio(y2Ratio)
        return new SingleRangeFilter(c.title, thresholdA, thresholdB)
    }
}

export default SingleRangeFilter