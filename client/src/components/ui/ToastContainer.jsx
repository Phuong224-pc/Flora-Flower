import useToastStore from '../../store/useToastStore'

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{icons[t.type]}</span>
          <span style={{ flex: 1 }}>{t.message}</span>
          <button className="toast-close" onClick={() => removeToast(t.id)}>×</button>
        </div>
      ))}
    </div>
  )
}
