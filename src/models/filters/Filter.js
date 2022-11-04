class Filter {

    static counter = 0

    constructor () {
        this.id = Filter.counter
        Filter.counter++
    }

}

export default Filter