class WorkerMessage {
    constructor (channel, payload) {
        this.channel = channel  // String
        this.payload = payload  // Whatever
    }
}

export default WorkerMessage