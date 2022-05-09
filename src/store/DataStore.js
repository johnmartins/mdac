import { defineStore } from 'pinia'
import Category from "@/models/plots/Category"

export const useDataStore = defineStore('data', {
    state: () => ({
            data: [],
            categories: [],
            categoryNameMap: new Map(),
            filters: {},         // "categoryName" -> [filterA, filterB, ..]
            filterIDMap: new Map()
        }),
    getters: {},
    actions: {
        wipeAllData () {
            this.data = []
            this.categories = []
            this.categoryNameMap.clear()
            this.clearFilters()

            // Reset static class data
            Category.wipeLookupTable()
            Category.count = 0;
        },
        setData (data) {
            this.data = data
        },
        addFilter (f) {
            if (!this.filters[f.targetCategoryTitle]) {
                this.filters[f.targetCategoryTitle] = []
            }
            this.filters[f.targetCategoryTitle].push(f)
            this.filterIDMap.set(f.id, f)
        },
        getFilterByID (id) {
            return this.filterIDMap.get(id)
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
            this.filterIDMap.delete(filterToDelete.id)
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
        clearFilters () {
            for (let categoryName in this.filters) {
                delete this.filters[categoryName];
            }
            this.filterIDMap.clear()
        },
        addCategory (c) {
            let position = 0
            if (this.categories.length > 0) {
                position = this.categories[this.categories.length - 1].position + 1
            }
            this.categories.push(c)
            this.categoryNameMap.set(c.title, c)
        },
        getCategoryWithName (categoryName) {
            return this.categoryNameMap.get(categoryName)
        },
        deleteCategory (c) {
            if (!c) return
            // Delete category from category list
            let deleteIndex = -1
            for (let i = 0; i < this.categories.length; i++) {
                const cat = this.categories[i]
                if (c.title !== cat.title) continue
                deleteIndex = i
                break
            }
            this.categoryNameMap.set(c.title, null)
            this.categories.splice(deleteIndex, 1)
        
            // Adjust positions of other categories
            for (let i=deleteIndex; i < this.categories.length; i++) {
                const cat = this.categories[i]
                cat.position--
            }
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
