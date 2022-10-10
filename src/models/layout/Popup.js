
class Popup {

    static count = 0

    constructor (type, title, body) {
        this.id = Popup.count
        this.type = type
        this.title = title
        this.body = body

        // Definable callbacks
        this.okCallback = null
        this.cancelCallback = null

        Popup.count++
    }

    setOkCallback (fn) {
        this.okCallback = fn
    }

    setCancelCallback (fn) {
        this.cancelCallback = fn
    }
    
}

export default Popup