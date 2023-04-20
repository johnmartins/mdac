process.env.VUE_APP_VERSION = require('./package.json').version

module.exports = {
    productionSourceMap: false,
    publicPath: process.env.VUE_APP_SUBDIR ? VUE_APP_SUBDIR : '',
}
