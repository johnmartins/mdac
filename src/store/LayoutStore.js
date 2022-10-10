import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', {
    state: () => ({ 
        popups: []
    }),
    actions: {
        queuePopup (popup) {
            this.popups.push(popup)
        },
        clearPopup (popupID) {
            for (let i = 0; i < this.popups.length; i++) {
                const popup = this.popups[i]
                if (popup.id !== popupID) {
                    continue
                } 
                this.popups.splice(i, 1)
                return true
            }
            
            throw new Error(`Failed to delete popup with ID = ${popupID}`)
        },
        getPopupByID (popupID) {
            for (let popup of this.popups) {
                if (popup.id === popupID) return popup
            }
        }
    },
})