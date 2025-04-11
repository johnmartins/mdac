import { defineStore } from 'pinia';
import Category from "@/models/plots/Category";
import { useStateStore } from './StateStore';

export const useDataStore = defineStore('data', {
    state: () => ({
        data: [],
        categories: [],
        categoryNameMap: new Map(),
        filters: {},         // "ColumnID" -> [filterA, filterB, ..]
        filterIDMap: new Map(),
        idCol: '$ID$',
        distributionBucketCount: 20,
        distributionMap: new Map(), // "ColumnID" -> [0,0,...,0]
    }),
    getters: {
        inputColumns: (state) => {
            let icols = []
            for (let c of state.categories) {
                if (c.io == 'input') {
                    icols.push(c.title)
                }
            }
            return icols
        },
        outputColumns: (state) => {
            let ocols = []
            for (let c of state.categories) {
                if (c.io == 'output') {
                    ocols.push(c.title)
                }
            }
            return ocols
        },
        enabledCategoriesCount: (state) => {
            if (state.categories.length === 0) return 0
            let enabledCats = state.categories.filter((c) => {
                return c.enabled
            })
            return enabledCats.length
        },
        categoriesSorted: (state) => {
            return state.categories.sort((a, b) => {
                if (a.position > b.position) return 1
                if (a.position < b.position) return -1
                return 0
            })
        },
        /**
         * Returns all enabled categories, sorted by position
         * @param {*} state 
         */
        enabledCategoriesSorted: (state) => {
            return state.categories.filter((c) => {
                return c.enabled
            }).sort((a, b) => {
                if (a.position > b.position) return 1
                if (a.position < b.position) return -1
                return 0
            })
        }
    },
    actions: {
        wipeAllData () {
            this.data = [];
            this.categories = [];
            this.categoryNameMap.clear();
            this.clearFilters();
            this.distributionBucketCount = 20;
            this.distributionMap.clear();

            // Reset static class data
            Category.wipeLookupTable();
            Category.count = 0;
        },
        setData (data) {
            this.data = data;
        },
        addFilter (f) {
            const stateStore = useStateStore();

            if (!this.filters[f.columnID]) {
                this.filters[f.columnID] = [];
            }
            this.filters[f.columnID].push(f);
            this.filterIDMap.set(f.id, f);

            // Queue rerenders
            stateStore.reRenderMvGrid = true;

            return f;
        },
        getFilterByID (id) {
            return this.filterIDMap.get(id)
        },
        deleteFilter (filterToDelete) {
            const stateStore = useStateStore();

            let deleteIndex = -1
            for (let i = 0; i < this.filters[filterToDelete.columnID].length; i++) {
                const f = this.filters[filterToDelete.columnID][i]
                if (f.id === filterToDelete.id) {
                    deleteIndex = i
                    break;
                }
            }
            if (deleteIndex === -1) {
                throw new Error('Failed to identify filter to delete.')
            }
        
            this.filters[filterToDelete.columnID].splice(deleteIndex, 1)

            // If there are no remaining filters for a category, then delete the key
            if (this.filters[filterToDelete.columnID].length === 0) {
                delete this.filters[filterToDelete.columnID]
            }
            this.filterIDMap.delete(filterToDelete.id)

            // Queue rerenders
            stateStore.reRenderMvGrid = true;
        },
        clearFilters () {
            for (let categoryName in this.filters) {
                delete this.filters[categoryName];
            }
            this.filterIDMap.clear()
        },
        addCategory (c) {
            let position = 0;
            if (this.categories.length > 0) {
                position = this.categories[this.categories.length - 1].position + 1;
            }
            this.categories.push(c);
            this.categoryNameMap.set(c.title, c);
            this.distributionMap.set(c.title, new Uint32Array(parseInt(this.distributionBucketCount)));   // Empty array of 0s.
        },
        getCategoryWithName (categoryName) {
            return this.categoryNameMap.get(categoryName)
        },
        getTrueCategoryPosition (categoryName) {
            const sortedCats = this.enabledCategoriesSorted
            const targetCat = this.getCategoryWithName(categoryName)
            for (let i = 0; i < sortedCats.length; i++) {
                if (sortedCats[i].id === targetCat.id) return i
            }
            throw new Error('Could not resolve true category position')
        },
        deleteCategory (c) {
            if (!c) return;
            // Delete category from category list
            let deleteIndex = -1;
            for (let i = 0; i < this.categories.length; i++) {
                const cat = this.categories[i];
                if (c.title !== cat.title) continue;
                deleteIndex = i;
                break;
            }
            this.categoryNameMap.set(c.title, null);
            this.distributionMap.delete(c.title);
            this.categories.splice(deleteIndex, 1);
        
            // Adjust positions of other categories
            for (let i=deleteIndex; i < this.categories.length; i++) {
                const cat = this.categories[i];
                cat.position--;
            }
        },
        dataPointFilterCheck (dataPoint) {
            /**
             * Returns true if the data point passes the filter
             */
            for (let key of Object.keys(this.filters)) {
                let passed = false;
                // If there are no filters, then pass
                if (this.filters[key].length === 0) return true;
                for (let filter of this.filters[key]) {
                    if (filter.filter(dataPoint[key])) {
                        passed = true;
                    } 
                }
                if (!passed) return false;
            }
            return true;
        },
        getArrayFromDataPoint (d, cols, {normalize = false} = {}) {
            if (!normalize) {
                return cols.map((col) => d[col])
            }

            let normalizedArray = []
            for (let col of cols) {
                const c = this.getCategoryWithName(col)
                const scaledValue = c.scaleLinear(d[col])
                normalizedArray.push(scaledValue)
            }
            return normalizedArray
        },
        /**
         * 
         * @param {*} category category to move
         * @param {*} n negative numbers moves to left, positive to the right
         */
        moveCategory (category, n) {
            if (n === 0) return 
            if (category.position === 0 && n < 0) {
                return 
            }
            if (category.position === this.categories.length - 1 && n > 0) {
                return 
            }  

            const p0 = category.position
            category.position += n
            
            this.categories.forEach((c) => {
                if (c.id == category.id) return c
                if (n < 0) {
                    // Down-shift
                    if (c.position >= p0 + n && c.position < p0) {
                        c.position += 1
                    }
                } else {
                    // Up-shift
                    if (c.position <= p0 + n && c.position > p0) {
                        c.position -= 1
                    }
                }
                return c
            })
        }
    },
})
