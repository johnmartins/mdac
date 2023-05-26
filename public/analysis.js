onmessage = (evt) => {
    const channel = evt.data.channel
    const payload = evt.data.payload

    console.log(`${channel}: ${payload}`)
}