module.exports = {
    root: true,
    env: {
        node: true
    },
    'extends': [
        "plugin:vue/vue3-recommended"
    ],
    parserOptions: {
        parser: '@babel/eslint-parser'
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'indent': ['error', 4],
        'vue/html-indent': ['error', 4],
        'vue/max-attributes-per-line': 'off',
        'vue/singleline-html-element-content-newline': 'off',
        'vue/multi-word-component-names': 'off',
        'vue/require-default-prop': 'off',
        'vue/require-prop-types': 'off',
        'vue/html-indent': 'off',
    }
}