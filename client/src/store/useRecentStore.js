import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MAX_RECENT = 12

const useRecentStore = create(
  persist(
    (set, get) => ({
      items: [], // [{id, slug, name, image, price, type}]

      track: (product) => {
        if (!product?.id) return
        const current = get().items.filter(p => p.id !== product.id)
        const entry = {
          id: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images?.[0] || null,
          price: product.variants?.[0]?.price || product.basePrice || 0,
          type: product.type || '',
          viewedAt: new Date().toISOString(),
        }
        set({ items: [entry, ...current].slice(0, MAX_RECENT) })
      },

      clear: () => set({ items: [] }),
    }),
    { name: 'flora-recent' }
  )
)

export default useRecentStore
