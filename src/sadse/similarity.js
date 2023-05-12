function euclideanDistance (v, w, normalized=false) {
    const sum = v.map((value, i) => {
        return Math.pow(value - w[i], 2) 
    }).reduce((sum, value) => sum+value)
    return normalized ? Math.sqrt(sum)/Math.sqrt(v.length) : Math.sqrt(sum)
}

export {euclideanDistance}