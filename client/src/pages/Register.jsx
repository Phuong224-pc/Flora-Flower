import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../services/api'
import useAuthStore from '../store/useAuthStore'
import useToastStore from '../store/useToastStore'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const toast = useToastStore()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/register', { name: data.name, email: data.email, password: data.password, phone: data.phone })
      login(res.data.user, res.data.token)
      toast.success('Đăng ký thành công! Chào mừng bạn đến với Flora Flower 🌸')
      navigate('/')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#fff0f3,#ffe4e6,#fecdd3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '.5rem' }}>🌸</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-heading)' }}>Đăng ký tài khoản</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Tham gia Flora Flower để nhận ưu đãi đặc biệt</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <input className={`form-input${errors.name ? ' border-error' : ''}`}
                placeholder="Nguyễn Văn A"
                {...register('name', { required: 'Vui lòng nhập họ tên' })} />
              {errors.name && <div className="form-error">{errors.name.message}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className={`form-input${errors.email ? ' border-error' : ''}`}
                type="email" placeholder="email@example.com"
                {...register('email', { required: 'Vui lòng nhập email', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email không hợp lệ' } })} />
              {errors.email && <div className="form-error">{errors.email.message}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input className="form-input" placeholder="0901234567" {...register('phone')} />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu *</label>
              <input className={`form-input${errors.password ? ' border-error' : ''}`}
                type="password" placeholder="Ít nhất 6 ký tự"
                {...register('password', { required: 'Vui lòng nhập mật khẩu', minLength: { value: 6, message: 'Mật khẩu ít nhất 6 ký tự' } })} />
              {errors.password && <div className="form-error">{errors.password.message}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu *</label>
              <input className={`form-input${errors.confirmPassword ? ' border-error' : ''}`}
                type="password" placeholder="Nhập lại mật khẩu"
                {...register('confirmPassword', { required: 'Vui lòng xác nhận mật khẩu', validate: v => v === watch('password') || 'Mật khẩu không khớp' })} />
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword.message}</div>}
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <><div className="spinner spinner-sm" /> Đang đăng ký...</> : 'Đăng ký'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.875rem', color: 'var(--color-text-muted)' }}>
            Đã có tài khoản?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
