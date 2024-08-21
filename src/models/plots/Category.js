import * as d3 from "d3"

class Category {

    static count = 0
    static lookupTable = new Map()
    static idLookupTable = new Map()

    constructor (title, lb, ub, {
        ticks=3, 
        displayTitle=null, 
        overwrite=false, 
        position=Category.lookupTable.size, 
        usesCategoricalData=false,
        availableCategoricalValues=[],
        undefinedIO=false
    } = {}) { 

        // Validate input
        if (Category.lookupTable.get(title) && !overwrite) {
            throw new Error(`Data category with title "${title}" already exists. 
            For the plot to function as intended, the header may only contain unique titles.`)
        } 

        // Configure instance
        this.displayTitle = displayTitle === null ? title : displayTitle
        this.title = title
        this.lb = lb
        this.ub = ub
        this.position = position
        this.ticks = ticks
        this.magnitude = Math.abs(this.ub) > 0  ? Math.floor(Math.log10(this.ub)) : 0
        this.id = Category.count
        this.enabled = true

        // Set IO type
        if (undefinedIO === true) {
            this.io = null
        } else {
            // Input or output column. Can be 'input', 'output', or null.
            this.io = usesCategoricalData ? null : 'input' 
        }

        // Categorical data variables
        this.usesCategoricalData = usesCategoricalData
        this.availableCategoricalValues = availableCategoricalValues

        // Manage static variables
        Category.count++
        Category.lookupTable.set(this.title, this)
        Category.idLookupTable.set(this.id, this)
    }

    getTickString (value) {
        return !this.usesCategoricalData ? this.getTickStringNumeric(value) : value
    }

    getTickStringNumeric (value) {
        return this.getFormattedNumericValue (value)
    }

    getFormattedNumericValue (value) {
        if (isNaN(parseFloat(value))) {
            console.warn(`Encountered non-numeric data in a data series (${this.title}) that was expected to be numeric.`)
            return null
        }

        let formattedValue
        
        if (this.magnitude < -1) {
            let rounded = Math.round(value * Math.pow(10,(Math.abs(this.magnitude)+3)))/Math.pow(10,3)
            formattedValue = `${rounded}e${this.magnitude}`
        } else if (this.magnitude > 3) {
            let rounded = Math.round(value / Math.pow(10,(this.magnitude-3)))*Math.pow(10,(this.magnitude-3))
            formattedValue = `${rounded/Math.pow(10, this.magnitude)}e${this.magnitude}`
        } else {
            formattedValue = `${Math.round(value * 1000) / 1000}`
        }

        return formattedValue
    }

    scaleLinear (value) {
        return this.getScale()(value)
    }

    getScale () {
        if (this.usesCategoricalData) {
            // Categorical data
            return d3.scalePoint().range([0,1]).domain(this.availableCategoricalValues)
        } else {
            // Numeric data
            return d3.scaleLinear().range([0,1]).domain([this.ub, this.lb])
        }
    }

    getOutputFromRatio (ratio) {
        if (!this.usesCategoricalData) {
            return this.getScale().invert(ratio)
        } else {
            const scale = this.getScale()
            const domain = scale.domain(); 
            const range = scale.range();
            const rangePoints = d3.range(range[0], range[1], scale.step())
            return domain[d3.bisect(rangePoints, ratio) -1];
        }
    }

    getTickArray () {
        if (this.usesCategoricalData) {
            return this.availableCategoricalValues
        }
        
        let ta = [this.lb]
        const tickStep = (this.ub - this.lb)/(this.ticks-1)
        for (let i=0; i<(this.ticks-1); i++) {
            ta.push(ta[ta.length-1]+tickStep)
        }
        return ta
    }

    morph (c, {migrateReference = false} = {}) {
        this.displayTitle = c.displayTitle
        this.title = c.title
        this.id = c.id
        this.lb = c.lb
        this.ub = c.ub
        this.position = c.position
        this.ticks = c.ticks
        this.enabled = c.enabled
        this.io = c.io
        this.usesCategoricalData = c.usesCategoricalData
        this.availableCategoricalValues = c.availableCategoricalValues

        if (migrateReference) { 
            Category.lookupTable.set(this.title, this)
            Category.idLookupTable.set(this.id, this)
        }
    }

    static wipeLookupTable () {
        Category.lookupTable.clear()
        Category.idLookupTable.clear()
    }

    static lookup (title) {
        return Category.lookupTable.get(title)
    }

    static lookupID (id) {
        return Category.idLookupTable.get(id)
    }
}

export default Category