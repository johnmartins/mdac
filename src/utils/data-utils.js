import * as d3 from "d3";

import { useDataStore } from "@/store/DataStore";
import { useOptionsStore } from "@/store/OptionsStore";
import { usePCPStore } from "@/store/PCPStore";

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

function createDataArray(d) {
    const dataStore = useDataStore();
    const pcpStore = usePCPStore();

    const horizontalOffset = pcpStore.horizontalOffset;
    const axisLength = pcpStore.axisLength;

    let dataCats = Object.keys(d);
    let dataArray = Array(dataCats.length).fill(null);

    for (let i = 0; i < dataCats.length; i++) {		
        let c = dataStore.getCategoryWithName(dataCats[i]);

        // Ignore disabled categories
        if (!c || !c.enabled)  {
            continue;
        }

        // Set data point coordinates
        const x = dataStore.getTrueCategoryPosition(c.title)*horizontalOffset;
        const y = c.scaleLinear(d[c.title])*axisLength;

        // Build data array
        dataArray[c.position] = {
            x: x, 
            y: y
        }
    }

    dataArray = dataArray.filter((obj) => { return obj != null });

    return dataArray;
}

function lineGenerator(d, rasterContext = null) {
    const optionsStore = useOptionsStore();
    const dataArray = createDataArray(d);

    let d3CurveType = d3.curveMonotoneX;
    if (optionsStore.curveType === 'curve') {
        d3CurveType = d3.curveMonotoneX;
    } else if (optionsStore.curveType === 'line') {
        d3CurveType = d3.curveLinear;
    }

    let line = d3.line([])
        .x((de) => {return de.x})
        .y((de) => {return de.y})
        .curve(d3CurveType)
        .digits(0);

    if (rasterContext) {
        // Used only for raster-based rendering
        line.context(rasterContext);
    }

    return line(dataArray);
}

export {truncateDecimals, isNumeric, linspace, createDataArray, lineGenerator}
