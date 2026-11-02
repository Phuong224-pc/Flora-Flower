import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../services/api'
import useAuthStore from '../store/useAuthStore'
import useToastStore from '../store/useToastStore'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const toast = useToastStore()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', data)
      login(res.data.user, res.data.token)
      toast.success(`Chào mừng trở lại, ${res.data.user.name}!`)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Email hoặc mật khẩu không đúng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#fff0f3,#ffe4e6,#fecdd3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '.5rem' }}>🌸</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-heading)' }}>Flora Flower</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Đăng nhập vào tài khoản của bạn</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                className={`form-input${errors.email ? ' border-error' : ''}`}
                type="email"
                placeholder="email@example.com"
                {...register('email', { required: 'Vui lòng nhập email' })}
              />
              {errors.email && <div className="form-error">{errors.email.message}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu *</label>
              <input
                className={`form-input${errors.password ? ' border-error' : ''}`}
                type="password"
                placeholder="••••••••"
                {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
              />
              {errors.password && <div className="form-error">{errors.password.message}</div>}
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <><div className="spinner spinner-sm" /> Đang đăng nhập...</> : 'Đăng nhập'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.875rem', color: 'var(--color-text-muted)' }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Đăng ký ngay</Link>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--color-accent)', borderRadius: 'var(--radius-lg)', fontSize: '.8rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '.5rem', color: 'var(--color-heading)' }}>Tài khoản demo:</div>
            <div>Admin: <code>admin@floraflower.vn</code> / <code>admin123</code></div>
            <div>Khách: <code>customer@example.com</code> / <code>customer123</code></div>
          </div>
        </div>
      </div>
    </div>
  )
}
