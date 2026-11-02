import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product, variant, quantity = 1, extras = {}) => {
        const key = `${product.id || product._id}-${variant.size}`
        const existing = get().items.find((i) => i.key === key)
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + quantity } : i
            ),
          })
        } else {
          set({
            items: [
              ...get().items,
              {
                key,
                productId: product.id || product._id,
                name: product.name,
                image: product.images?.[0] || '',
                slug: product.slug,
                variant,
                quantity,
                ...extras,
              },
            ],
          })
        }
      },

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.key !== key) })
        } else {
          set({ items: get().items.map((i) => (i.key === key ? { ...i, quantity } : i)) })
        }
      },

      removeFromCart: (key) => {
        set({ items: get().items.filter((i) => i.key !== key) })
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0)
      },

      getCount: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },
    }),
    { name: 'flora-cart' }
  )
)

export default useCartStore
