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

        console.log(`${this.lowerBoundRatio} -> ${this.upperBoundRatio}`)
    }

    filter (value) {
        return this.includedValueSet.has(value)
    }
}

export default CategoricFilter