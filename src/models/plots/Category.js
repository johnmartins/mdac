import * as d3 from "d3"

class Category {

    static count = 0

    constructor (title, lb, ub, position=Category.count, ticks=5) {
        this.title = title
        this.lb = lb
        this.ub = ub
        this.position = position
        this.ticks = ticks
        this.magnitude = this.lb > 0 ? Math.floor(Math.log10(this.lb)) : 0
        this.id = Category.count

        Category.count++
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

    morph (c) {
        this.title = c.title
        this.lb = c.lb
        this.ub = c.ub
        this.position = c.position
        this.ticks = c.ticks
    }
}

export default Category