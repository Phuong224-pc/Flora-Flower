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
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ mode: 'onTouched' })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        phone: data.phone.trim()
      })
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
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <input
                className={`form-input${errors.name ? ' error' : ''}`}
                placeholder="Nguyễn Văn A"
                {...register('name', {
                  required: 'Vui lòng nhập họ và tên',
                  minLength: { value: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' },
                  maxLength: { value: 50, message: 'Họ và tên tối đa 50 ký tự' },
                  validate: v => v.trim().length >= 2 || 'Họ và tên không hợp lệ'
                })}
              />
              {errors.name && <div className="form-error">{errors.name.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                className={`form-input${errors.email ? ' error' : ''}`}
                type="email"
                placeholder="email@example.com"
                {...register('email', {
                  required: 'Vui lòng nhập địa chỉ email',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Email không đúng định dạng (VD: example@domain.com)'
                  }
                })}
              />
              {errors.email && <div className="form-error">{errors.email.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại *</label>
              <input
                className={`form-input${errors.phone ? ' error' : ''}`}
                type="tel"
                placeholder="0901234567"
                {...register('phone', {
                  required: 'Vui lòng nhập số điện thoại',
                  pattern: {
                    value: /^(0[3|5|7|8|9])[0-9]{8}$/,
                    message: 'Số điện thoại phải gồm 10 chữ số hợp lệ (VD: 0901234567)'
                  }
                })}
              />
              {errors.phone && <div className="form-error">{errors.phone.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu *</label>
              <input
                className={`form-input${errors.password ? ' error' : ''}`}
                type="password"
                placeholder="Ít nhất 6 ký tự"
                {...register('password', {
                  required: 'Vui lòng nhập mật khẩu',
                  minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                  maxLength: { value: 32, message: 'Mật khẩu tối đa 32 ký tự' },
                  validate: v => !/\s/.test(v) || 'Mật khẩu không được chứa khoảng trắng'
                })}
              />
              {errors.password && <div className="form-error">{errors.password.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu *</label>
              <input
                className={`form-input${errors.confirmPassword ? ' error' : ''}`}
                type="password"
                placeholder="Nhập lại mật khẩu"
                {...register('confirmPassword', {
                  required: 'Vui lòng xác nhận mật khẩu',
                  validate: v => v === watch('password') || 'Mật khẩu xác nhận không trùng khớp'
                })}
              />
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
