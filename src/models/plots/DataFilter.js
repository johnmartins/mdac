class DataFilter {

    static counter = 0;

    constructor (categoryID, thresholdA, thresholdB) {
        this.categoryID = categoryID
        this.thresholdA = thresholdA        
        this.thresholdB = thresholdB      
        this.id = DataFilter.counter

        DataFilter.counter++
        
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
}

export default DataFilter