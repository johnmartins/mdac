import * as d3 from "d3"

class Category {

    static count = 0
    static lookupTable = new Map()

    constructor (title, lb, ub, 
        {ticks=5, titlePreviewed=null, overwrite=false, position=Category.lookupTable.size} = {}) { 

        // Validate input
        if (Category.lookupTable.get(title) && !overwrite) {
            throw new Error(`Data category with title "${title}" already exists. 
            For the plot to function as intended, the header may only contain unique titles.`)
        } 

        // Configure instance
        this.titlePreviewed = titlePreviewed === null ? title : titlePreviewed
        this.title = title
        this.lb = lb
        this.ub = ub
        this.position = position
        this.ticks = ticks
        this.magnitude = this.lb > 0 ? Math.floor(Math.log10(this.lb)) : 0
        this.id = Category.count
        this.disabled = false

        // Manage static variables
        Category.count++
        Category.lookupTable.set(this.title, this)
    }

    getTickString (value) {
        if (isNaN(parseFloat(value))) {
            return "String"
        }

        let tickStr = "Whoops"
        
        if (this.magnitude < -1) {
            let rounded = Math.round(value * Math.pow(10,(Math.abs(this.magnitude)+3)))/Math.pow(10,3)
            tickStr = `${rounded}e${this.magnitude}`
        } else if (this.magnitude > 3) {
            let rounded = Math.round(value / Math.pow(10,(this.magnitude-3)))*Math.pow(10,(this.magnitude-3))
            tickStr = `${rounded/Math.pow(10, this.magnitude)}e${this.magnitude}`
        } else {
            tickStr = `${Math.round(value * 1000) / 1000}`
        }

        return tickStr
    }

    scaleLinear (value) {
        return this.getScale()(value)
    }

    getScale () {
        return d3.scaleLinear().range([0,1]).domain([this.ub, this.lb])
    }

    getTickArray () {
        let ta = [this.lb]
        const tickStep = (this.ub - this.lb)/(this.ticks-1)
        for (let i=0; i<(this.ticks-1); i++) {
            ta.push(ta[ta.length-1]+tickStep)
        }
        return ta
    }

    morph (c, {migrateReference = false} = {}) {
        this.titlePreviewed = c.titlePreviewed
        this.title = c.title
        this.id = c.id
        this.lb = c.lb
        this.ub = c.ub
        this.position = c.position
        this.ticks = c.ticks
        this.disabled = c.disabled

        if (migrateReference) { 
            Category.lookupTable.set(this.title, this)
        }
    }

    static wipeLookupTable () {
        Category.lookupTable.clear()
    }

    static lookup (title) {
        return Category.lookupTable.get(title)
    }
}

export default Category