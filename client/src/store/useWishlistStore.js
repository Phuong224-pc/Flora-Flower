import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [], // array of product objects

      toggle: (product) => {
        const items = get().items
        const exists = items.find(p => p.id === product.id)
        if (exists) {
          set({ items: items.filter(p => p.id !== product.id) })
          return false // removed
        } else {
          set({ items: [{ ...product, wishedAt: new Date().toISOString() }, ...items] })
          return true // added
        }
      },

      isWished: (productId) => {
        return get().items.some(p => p.id === productId)
      },

      clear: () => set({ items: [] }),
    }),
    {
      name: 'flora-wishlist',
    }
  )
)

export default useWishlistStore
