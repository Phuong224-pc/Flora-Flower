import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, ExternalLink } from 'lucide-react'
import api from '../../services/api'
import useToastStore from '../../store/useToastStore'

const EMPTY = {
  label: '', slug: '', icon: '🌸', description: '', content: '',
  bannerImage: '', showInMenu: true, order: 99,
  status: 'published', seoTitle: '', seoDesc: '',
}

function slugify(str) {
  return str.toLowerCase()
    .replace(/[àáâãäả]/g, 'a').replace(/[èéêẽëẻ]/g, 'e')
    .replace(/[ìíîĩïỉ]/g, 'i').replace(/[òóôõöọ]/g, 'o')
    .replace(/[ùúûũüụ]/g, 'u').replace(/[ýỳỷỹỵ]/g, 'y')
    .replace(/đ/g, 'd').replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

export default function AdminOccasions() {
  const toast = useToastStore()
  const [occasions, setOccasions] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const r = await api.get('/occasions/admin/all')
      setOccasions(r.data)
    } catch {
      toast.error('Không tải được danh sách dịp')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY)
    setModalOpen(true)
  }

  const openEdit = (occ) => {
    setEditing(occ)
    setForm({ ...EMPTY, ...occ })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.label.trim() || !form.slug.trim()) {
      toast.error('Vui lòng nhập tên và slug')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/occasions/admin/${editing.id}`, form)
        toast.success('Đã cập nhật dịp')
      } else {
        await api.post('/occasions/admin', form)
        toast.success('Đã tạo dịp mới')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi lưu dữ liệu')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (occ) => {
    const newStatus = occ.status === 'published' ? 'draft' : 'published'
    try {
      await api.put(`/occasions/admin/${occ.id}`, { ...occ, status: newStatus })
      toast.success(newStatus === 'published' ? 'Đã xuất bản' : 'Đã ẩn dịp')
      load()
    } catch {
      toast.error('Lỗi cập nhật trạng thái')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/occasions/admin/${deleteId}`)
      toast.success('Đã xóa dịp')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Không xóa được dịp này')
    }
  }

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="admin-page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-page-title">Dịp tặng hoa</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '.875rem', marginTop: '.25rem' }}>
            Quản lý các dịp tặng hoa — xuất bản sẽ hiển thị trong menu và trang web
          </p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={18} /> Thêm dịp mới
        </button>
      </div>

      {/* Help note */}
      <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
        💡 Sau khi thêm và xuất bản dịp mới, menu điều hướng và trang <strong>/dip/slug</strong> sẽ tự động cập nhật không cần build lại.
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-page"><div className="spinner spinner-lg" /></div>
      ) : (
        <div className="table-wrapper">
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Thứ tự</th>
                  <th>Icon</th>
                  <th>Tên dịp</th>
                  <th>Slug (URL)</th>
                  <th>Trong menu</th>
                  <th>Trạng thái</th>
                  <th>Xem trước</th>
                  <th style={{ width: '120px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {occasions.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                      Chưa có dịp tặng hoa nào. Nhấn <strong>Thêm dịp mới</strong> để bắt đầu.
                    </td>
                  </tr>
                ) : occasions.map(occ => (
                  <tr key={occ.id}>
                    <td style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{occ.order}</td>
                    <td style={{ fontSize: '1.4rem' }}>{occ.icon}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{occ.label}</div>
                      {occ.description && (
                        <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)', marginTop: '.15rem' }}>
                          {occ.description.slice(0, 60)}{occ.description.length > 60 ? '…' : ''}
                        </div>
                      )}
                    </td>
                    <td>
                      <code style={{ background: 'var(--color-bg-subtle)', padding: '.15rem .5rem', borderRadius: 'var(--r-sm)', fontSize: '.8rem' }}>
                        {occ.slug}
                      </code>
                    </td>
                    <td>
                      {occ.showInMenu
                        ? <span className="badge badge-success">Có</span>
                        : <span className="badge badge-gray">Ẩn</span>}
                    </td>
                    <td>
                      {occ.status === 'published'
                        ? <span className="badge badge-success">Đã xuất bản</span>
                        : occ.status === 'draft'
                          ? <span className="badge badge-warning">Nháp</span>
                          : <span className="badge badge-gray">Lưu trữ</span>}
                    </td>
                    <td>
                      <a href={`/dip/${occ.slug}`} target="_blank" rel="noreferrer"
                        style={{ color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '.25rem', fontSize: '.85rem' }}>
                        <ExternalLink size={14} /> Xem
                      </a>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '.375rem' }}>
                        <button
                          className="btn btn-ghost btn-icon btn-icon-sm"
                          onClick={() => handleToggleStatus(occ)}
                          title={occ.status === 'published' ? 'Ẩn dịp' : 'Xuất bản'}
                        >
                          {occ.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-icon-sm"
                          onClick={() => openEdit(occ)}
                          title="Chỉnh sửa"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-icon-sm"
                          style={{ color: 'var(--color-error)' }}
                          onClick={() => setDeleteId(occ.id)}
                          title="Xóa"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Chỉnh sửa dịp' : 'Thêm dịp mới'}</h3>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tên dịp *</label>
                    <input
                      className="form-input"
                      value={form.label}
                      onChange={e => {
                        const v = e.target.value
                        setField('label', v)
                        if (!editing) setField('slug', slugify(v))
                      }}
                      placeholder="vd: Sinh nhật"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Slug (URL) *</label>
                    <input
                      className="form-input"
                      value={form.slug}
                      onChange={e => setField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="vd: sinh-nhat"
                      required
                    />
                    <div className="form-hint">/dip/<strong>{form.slug || 'slug'}</strong></div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Icon</label>
                    <input
                      className="form-input"
                      style={{ textAlign: 'center', fontSize: '1.4rem' }}
                      value={form.icon}
                      onChange={e => setField('icon', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Mô tả ngắn</label>
                    <input
                      className="form-input"
                      value={form.description}
                      onChange={e => setField('description', e.target.value)}
                      placeholder="Hiển thị dưới banner trang dịp"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Ảnh banner (URL)</label>
                  <input
                    className="form-input"
                    value={form.bannerImage}
                    onChange={e => setField('bannerImage', e.target.value)}
                    placeholder="https://... (để trống dùng ảnh mặc định)"
                  />
                  {form.bannerImage && (
                    <img src={form.bannerImage} alt="Banner preview"
                      style={{ marginTop: '.5rem', height: '100px', width: '100%', objectFit: 'cover', borderRadius: 'var(--r-md)' }}
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nội dung tư vấn (hiện ở cuối trang dịp)</label>
                  <textarea
                    className="form-textarea"
                    value={form.content}
                    onChange={e => setField('content', e.target.value)}
                    rows={3}
                    placeholder="Tư vấn chọn hoa, ý nghĩa, lưu ý..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Thứ tự</label>
                    <input
                      className="form-input" type="number" min="1" max="999"
                      value={form.order}
                      onChange={e => setField('order', Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Trạng thái</label>
                    <select
                      className="form-select"
                      value={form.status}
                      onChange={e => setField('status', e.target.value)}
                    >
                      <option value="published">Xuất bản</option>
                      <option value="draft">Nháp</option>
                      <option value="archived">Lưu trữ</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                    <label className="form-label">Hiển thị menu</label>
                    <label className="form-check" style={{ marginTop: '.5rem' }}>
                      <input
                        type="checkbox"
                        checked={form.showInMenu}
                        onChange={e => setField('showInMenu', e.target.checked)}
                      />
                      Có trong menu
                    </label>
                  </div>
                </div>

                <details style={{ background: 'var(--color-bg-subtle)', borderRadius: 'var(--r-md)', padding: '1rem' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '.875rem', color: 'var(--color-heading)' }}>
                    SEO (tùy chọn)
                  </summary>
                  <div style={{ marginTop: '.875rem', display: 'grid', gap: '.75rem' }}>
                    <div>
                      <label className="form-label">Tiêu đề SEO</label>
                      <input className="form-input" value={form.seoTitle} onChange={e => setField('seoTitle', e.target.value)} placeholder={form.label} />
                    </div>
                    <div>
                      <label className="form-label">Mô tả SEO</label>
                      <textarea className="form-textarea" rows={2} value={form.seoDesc} onChange={e => setField('seoDesc', e.target.value)} />
                    </div>
                  </div>
                </details>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner spinner-sm" /> Đang lưu...</> : (editing ? 'Lưu thay đổi' : 'Tạo dịp')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Xác nhận xóa</h3>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--color-text-muted)' }}>
                Bạn có chắc muốn xóa dịp này? Thao tác không thể hoàn tác.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Hủy</button>
              <button className="btn btn-danger" onClick={handleDelete}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
