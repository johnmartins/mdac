import * as d3 from "d3"

class Category {

    static count = 0

    constructor (title, lb, ub, position=Category.count, ticks=5) {
        this.title = title
        this.lb = lb
        this.ub = ub
        this.position = position
        this.ticks = ticks

        Category.count++
    }

    scaleLinear (value) {
        return d3.scaleLinear().range([0,1]).domain([this.ub, this.lb])(value)
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