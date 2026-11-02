import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: (user, token) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        set({ user, token })
      },

      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({ user: null, token: null })
      },

      updateUser: (data) => {
        set((state) => {
          const updated = { ...state.user, ...data }
          localStorage.setItem('user', JSON.stringify(updated))
          return { user: updated }
        })
      },

      isAdmin: () => {
        const state = useAuthStore.getState()
        return state.user?.role === 'admin'
      },
    }),
    { name: 'flora-auth' }
  )
)

export default useAuthStore
