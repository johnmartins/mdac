import Category from "@/models/plots/Category"
import { useDataStore } from "@/store/DataStore"

async function calculateIntersimilarity (fidelityColumnTitle, targetColValue, ioType) {
    const dataStore = useDataStore()

    let cols = []
    if (ioType === 'input') {
        cols = dataStore.inputColumns
    } else if (ioType === 'output') {
        cols = dataStore.outputColumns
    } else {
        throw new Error('Unsupported analysis configuration.')
    }

    const normalized = true
    const intersimCol = '$intersim$'

    const lofiData = dataStore.data.filter(d => d[fidelityColumnTitle] !== targetColValue)
    const hifiData = dataStore.data.filter(d => d[fidelityColumnTitle] === targetColValue)

    // Add an $inter-similarity$ category
    const intersimCategory = new Category(intersimCol, 0, 1, {
        usesCategoricalData: false,
    })
    dataStore.addCategory(intersimCategory)

    let maxIntersim = 0

    for (let dlf of lofiData) {
        // Lofi data loop

        // Get identifier
        const vlf = dataStore.getArrayFromDataPoint(dlf, cols, {normalize: normalized})

        let closestSimilarityValue = null

        for (let dhf of hifiData) {
            // Hifi data loop
            const vhf = dataStore.getArrayFromDataPoint(dhf, cols, {normalize: normalized}) // TODO: We only really need to do this once for each data doint. This should be outside the loops.

            // Calculate similarity
            const s = euclideanDistance(vlf, vhf, normalized)

            // Store nearest similarity value
            if (!closestSimilarityValue) {
                closestSimilarityValue = s
            } else if (closestSimilarityValue > s) {
                closestSimilarityValue = s
            }

            dhf[intersimCol] = 0
        }

        dlf[intersimCol] = closestSimilarityValue
        if (closestSimilarityValue > maxIntersim) maxIntersim = closestSimilarityValue
    }

    intersimCategory.lb = 0
    intersimCategory.ub = maxIntersim
    intersimCategory.displayTitle = 'INTER-SIMILARITY'

    return
}


function euclideanDistance (v, w, normalized=false) {
    const sum = v.map((value, i) => {
        return Math.pow(value - w[i], 2) 
    }).reduce((sum, value) => sum+value)
    return normalized ? Math.sqrt(sum)/Math.sqrt(v.length) : Math.sqrt(sum)
}

export {euclideanDistance, calculateIntersimilarity}