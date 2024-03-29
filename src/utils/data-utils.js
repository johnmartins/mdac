
/**
 * Deletes decimals without mercy. No rounding.
 * @param {*} decimals 
 */
function truncateDecimals (float, decimals) {
    const str = String(float)
    let [integerPart, decimalPart] = str.split(".")
    if (!decimalPart) return float
    decimalPart = decimalPart.length > decimals ? decimalPart.substring(0, decimals) : decimalPart
    return parseFloat([integerPart, decimalPart].join("."))
}

function isNumeric (str) {
    if (typeof(str) != 'string') return false
    return !isNaN(str) && !isNaN(parseFloat(str))
}

function linspace (start, stop, n) {
    let range = stop - start
    let step = range / (n - 1)
    let linspaceArray = []
    for (let i = 0; i < n; i++) {
        linspaceArray.push(start + step * i)
    }
    return linspaceArray
}

export {truncateDecimals, isNumeric, linspace}
