import Filter from '@/models/filters/Filter'

class CategoricFilter extends Filter {

    constructor (columnID, includedValueArray = [], boundaryRatioA, boundaryRatioB) {
        super()
        this.type = 'categoric'
        this.columnID = columnID
        this.includedValueSet = new Set(includedValueArray)

        // The ratios are used by the plots to render the filters.
        // Categorical columns can not change column boundaries, so this should be fine™ 
        
        this.upperBoundRatio = boundaryRatioA > boundaryRatioB ? boundaryRatioA : boundaryRatioB         
        this.lowerBoundRatio = boundaryRatioB < boundaryRatioA ? boundaryRatioB : boundaryRatioA        

    }

    filter (value) {
        return this.includedValueSet.has(value)
    }

    static createFromRatios (c, y1Ratio, y2Ratio) {
        // y1 is always higher than y2
        if (y2Ratio > y1Ratio) {
            const inter = y2Ratio
            y2Ratio = y1Ratio
            y1Ratio = inter
        }
    
        let lowerBoundRatio = 2
        let lowerBoundValue = null
        let upperBoundRatio = -1
        let upperBoundValue = null
    
        const includedCategories = []
        for (let categoricalValue of c.availableCategoricalValues) {
            const categoryRangeValue = c.scaleLinear(categoricalValue)
            if (y1Ratio >= categoryRangeValue && categoryRangeValue >= y2Ratio) {
                includedCategories.push(categoricalValue)
    
                if (categoryRangeValue < lowerBoundRatio) {
                    lowerBoundRatio = categoryRangeValue
                    lowerBoundValue = categoricalValue
                }
    
                if (categoryRangeValue > upperBoundRatio) {
                    upperBoundRatio = categoryRangeValue
                    upperBoundValue = categoricalValue
                }
            }		
        }
    
        if (lowerBoundValue === 2 || upperBoundValue === -1) {
            console.warn(`Failed to get bounds of categorical filter. Bounds: [${lowerBoundValue}, ${upperBoundValue}]`)
            return
        }
        
        return new CategoricFilter(c.title, includedCategories, y1Ratio, y2Ratio)
    }
}

export default CategoricFilter