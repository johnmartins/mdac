function getTrueEventCoordinates (evt, svg) {
    let p = new DOMPoint()

    function cursorPoint (evt) {
        p.x = evt.clientX; p.y = evt.clientY;
        return p.matrixTransform(svg.getScreenCTM().inverse())
    }

    let loc = cursorPoint(evt)

    return loc
}

export {getTrueEventCoordinates}
