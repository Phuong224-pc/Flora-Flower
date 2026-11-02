import { useState, useEffect } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../../services/api'
import useToastStore from '../../store/useToastStore'
import { formatDate, formatVND } from '../../utils/helpers'

export default function AdminCoupons() {
  const toast = useToastStore()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    api.get('/admin/coupons').then(r => setCoupons(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const onSave = async (data) => {
    setSaving(true)
    try {
      const res = await api.post('/admin/coupons', {
        ...data,
        value: Number(data.value),
        minOrder: Number(data.minOrder || 0),
        maxUses: Number(data.maxUses || 0),
      })
      setCoupons(c => [res.data, ...c])
      toast.success('Tạo mã giảm giá thành công')
      setModal(false)
      reset()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi tạo mã')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa mã giảm giá này?')) return
    try {
      await api.delete(`/admin/coupons/${id}`)
      setCoupons(c => c.filter(cp => cp.id !== id))
      toast.success('Đã xóa mã giảm giá')
    } catch { toast.error('Không thể xóa') }
  }

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="admin-page-title">Mã giảm giá</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '.875rem' }}>{coupons.length} mã giảm giá</p>
        </div>
        <button className="btn btn-primary" onClick={() => { reset(); setModal(true) }}>
          <Plus size={18} /> Tạo mã mới
        </button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}><div className="spinner spinner-lg" style={{ margin: '0 auto' }} /></div>
        ) : coupons.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <div className="empty-state__icon">🎟️</div>
            <div className="empty-state__title">Chưa có mã giảm giá nào</div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Loại giảm</th>
                <th>Giá trị</th>
                <th>Đơn tối thiểu</th>
                <th>Lượt dùng</th>
                <th>Hết hạn</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id}>
                  <td><code style={{ fontWeight: 700, color: 'var(--color-primary)', background: 'var(--color-accent)', padding: '.2rem .5rem', borderRadius: 'var(--radius-sm)' }}>{c.code}</code></td>
                  <td>{c.type === 'percent' ? 'Phần trăm' : 'Cố định'}</td>
                  <td><b>{c.type === 'percent' ? `${c.value}%` : formatVND(c.value)}</b></td>
                  <td>{c.minOrder > 0 ? formatVND(c.minOrder) : '—'}</td>
                  <td>{c.usedCount || 0}{c.maxUses > 0 ? `/${c.maxUses}` : ''}</td>
                  <td style={{ fontSize: '.875rem' }}>{c.expiresAt ? formatDate(c.expiresAt) : 'Không giới hạn'}</td>
                  <td>
                    <span className={`badge ${c.isActive ? 'badge-success' : 'badge-gray'}`}>
                      {c.isActive ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => handleDelete(c.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Tạo mã giảm giá</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form id="coupon-form" onSubmit={handleSubmit(onSave)}>
                <div className="form-group">
                  <label className="form-label">Mã giảm giá *</label>
                  <input className="form-input" {...register('code', { required: true })} placeholder="VD: FLORA10" style={{ textTransform: 'uppercase' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Loại giảm</label>
                    <select className="form-select" {...register('type')}>
                      <option value="percent">Phần trăm (%)</option>
                      <option value="fixed">Cố định (đ)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Giá trị giảm *</label>
                    <input className="form-input" type="number" {...register('value', { required: true, min: 1 })} placeholder="VD: 10 hoặc 50000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Đơn hàng tối thiểu (đ)</label>
                    <input className="form-input" type="number" {...register('minOrder')} placeholder="0 = không giới hạn" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Giới hạn số lượt dùng</label>
                    <input className="form-input" type="number" {...register('maxUses')} placeholder="0 = không giới hạn" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày hết hạn</label>
                    <input className="form-input" type="date" {...register('expiresAt')} />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Hủy</button>
              <button className="btn btn-primary" form="coupon-form" type="submit" disabled={saving}>
                {saving ? <><div className="spinner spinner-sm" /> Đang tạo...</> : 'Tạo mã giảm giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
