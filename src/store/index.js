import { defineStore } from 'pinia'

export const useDataStore = defineStore('data', {
    state: () => ({ data: [] }),
    getters: {
        // double: state => state.count * 2,
    },
    actions: {
        wipeAllData () {
            this.data = []
        },
        setData (data) {
            this.data = data
        }
    },
})
