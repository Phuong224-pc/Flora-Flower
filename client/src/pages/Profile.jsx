import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { User, Lock, Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import useToastStore from '../store/useToastStore'
import api from '../services/api'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const toast = useToastStore()
  const [tab, setTab] = useState('info')
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset } = useForm({ defaultValues: { name: user?.name, phone: user?.phone, address: user?.address } })

  const onSaveInfo = async (data) => {
    setSaving(true)
    try {
      const res = await api.patch('/auth/profile', data)
      updateUser(res.data)
      toast.success('Cập nhật thông tin thành công!')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi cập nhật')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return (
    <div className="empty-state" style={{ padding: '5rem 0' }}>
      <div className="empty-state__icon">🔒</div>
      <div className="empty-state__title">Vui lòng đăng nhập</div>
      <Link to="/login"><button className="btn btn-primary" style={{ marginTop: '1rem' }}>Đăng nhập</button></Link>
    </div>
  )

  return (
    <div style={{ padding: '2rem 0', background: 'var(--color-bg)', minHeight: '70vh' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-heading)', marginBottom: '2rem' }}>Tài khoản của tôi</h1>

        <div className="tabs" style={{ marginBottom: '2rem' }}>
          <button className={`tab-btn${tab === 'info' ? ' active' : ''}`} onClick={() => setTab('info')}>
            <User size={16} style={{ verticalAlign: 'middle', marginRight: '.3rem' }} /> Thông tin cá nhân
          </button>
          <button className={`tab-btn${tab === 'orders' ? ' active' : ''}`} onClick={() => setTab('orders')}>
            <Package size={16} style={{ verticalAlign: 'middle', marginRight: '.3rem' }} /> Đơn hàng
          </button>
        </div>

        {tab === 'info' && (
          <div className="card" style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit(onSaveInfo)}>
              <div className="form-group">
                <label className="form-label">Họ và tên</label>
                <input className="form-input" {...register('name')} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={user.email} disabled style={{ opacity: .6 }} />
                <div className="form-hint">Email không thể thay đổi</div>
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input className="form-input" {...register('phone')} placeholder="0901234567" />
              </div>
              <div className="form-group">
                <label className="form-label">Địa chỉ mặc định</label>
                <textarea className="form-textarea" rows={3} {...register('address')} placeholder="Địa chỉ giao hàng thường dùng" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><div className="spinner spinner-sm" /> Đang lưu...</> : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        )}

        {tab === 'orders' && (
          <div style={{ textAlign: 'center' }}>
            <Link to="/orders"><button className="btn btn-primary">Xem tất cả đơn hàng</button></Link>
          </div>
        )}
      </div>
    </div>
  )
}
