export default {
    /**
     * Deletes decimals without mercy. No rounding.
     * @param {*} decimals 
     */
    mercilessDecimalDeleter: function (float, decimals) {
        const str = String(float)
        let [integerPart, decimalPart] = str.split(".")
        if (!decimalPart) return float
        decimalPart = decimalPart.length > decimals ? decimalPart.substring(0, decimals) : decimalPart
        return parseFloat([integerPart, decimalPart].join("."))
    },

    isNumeric: function(str) {
        if (typeof(str) != 'string') return false
        return !isNaN(str) && !isNaN(parseFloat(str))
    }
}