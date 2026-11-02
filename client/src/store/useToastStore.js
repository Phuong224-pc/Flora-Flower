import { create } from 'zustand'

const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: (message, type = 'info', duration = 3500) => {
    const id = Date.now()
    set({ toasts: [...get().toasts, { id, message, type }] })
    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) })
    }, duration)
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) })
  },

  success: (msg) => get().addToast(msg, 'success'),
  error: (msg) => get().addToast(msg, 'error'),
  warning: (msg) => get().addToast(msg, 'warning'),
  info: (msg) => get().addToast(msg, 'info'),
}))

export default useToastStore
