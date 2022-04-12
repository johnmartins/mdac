import { defineStore } from 'pinia'
import { inject } from 'vue'


export const useDataStore = defineStore('data', {
    state: () => ({
            data: [],
            categories: [],
            filters: {}         // "categoryName" -> [filterA, filterB, ..]
        }),
    getters: {},
    actions: {
        wipeAllData () {
            this.data = []
        },
        setData (data) {
            this.data = data
        },
        addFilter (f) {
            if (!this.filters[f.targetCategoryTitle]) {
                this.filters[f.targetCategoryTitle] = []
            }
            this.filters[f.targetCategoryTitle].push(f)
        },
        deleteFilter (filterToDelete) {
            let deleteIndex = -1
            for (let i = 0; i < this.filters[filterToDelete.targetCategoryTitle].length; i++) {
                const f = this.filters[filterToDelete.targetCategoryTitle][i]
                if (f.id === filterToDelete.id) {
                    deleteIndex = i
                    break;
                }
            }
            if (deleteIndex === -1) {
                console.error('Failed to identify filter to delete.')
            }
        
            this.filters[filterToDelete.targetCategoryTitle].splice(deleteIndex, 1)

            // If there are no remaining filters for a category, then delete the key
            if (this.filters[filterToDelete.targetCategoryTitle].length === 0) {
                delete this.filters[filterToDelete.targetCategoryTitle]
            }
        },
        editFilter (oldFilter, newFilter) {
            let changeIndex = -1
            for (let i = 0; i < this.filters[oldFilter.targetCategoryTitle].length; i++) {
                const f = this.filters[oldFilter.targetCategoryTitle][i]
        
                if (f.id == oldFilter.id) {
                    changeIndex = i
                    break
                }
            }
        
            if (changeIndex >= 0) {
                const f = this.filters[oldFilter.targetCategoryTitle][changeIndex]
                f.thresholdA = newFilter.thresholdA
                f.thresholdB = newFilter.thresholdB
            }
        },
        addCategory (category) {

        },
        deleteCategory (category) {

        },
        dataPointFilterCheck (dataPoint) {
            /**
             * Returns true if the data point passes the filter
             */
            for (let key of Object.keys(this.filters)) {
                let passed = false
                // If there are no filters, then pass
                if (this.filters[key].length === 0) passed = true        // TODO: Return true?
                for (let filter of this.filters[key]) {
                    if (filter.filter(dataPoint[key])) {
                        passed = true
                    } 
                }
                if (!passed) return false
            }
            return true
        }
    },
})
