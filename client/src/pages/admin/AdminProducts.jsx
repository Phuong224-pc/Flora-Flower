import { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, X, Upload, Image } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../../services/api'
import useToastStore from '../../store/useToastStore'
import { formatVND } from '../../utils/helpers'

const TYPES = ['Bó hoa','Giỏ hoa','Hộp hoa','Bình hoa','Kệ hoa']

export default function AdminProducts() {
  const toast = useToastStore()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [previewUrls, setPreviewUrls] = useState([])
  const [occasionList, setOccasionList] = useState([])   // từ API
  const [selectedOccasions, setSelectedOccasions] = useState([]) // dịp được chọn
  const fileInputRef = useRef(null)
  const { register, handleSubmit, reset, setValue, watch, getValues } = useForm()

  useEffect(() => { loadProducts() }, [])

  // Fetch danh sách dịp từ API
  useEffect(() => {
    api.get('/occasions').then(res => setOccasionList(res.data || [])).catch(() => {})
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/products?limit=100')
      setProducts(res.data.data || res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const openCreate = () => {
    reset({ name: '', slug: '', description: '', type: TYPES[0], occasions: [], isFeatured: false, status: 'active', imagesText: '', variants: [{ size: 'Tiêu chuẩn', price: 150000, stock: 50, sku: '' }] })
    setPreviewUrls([])
    setSelectedOccasions([])
    setEditing(null)
    setModal(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    const imgText = product.images?.join('\n') || ''
    const existingOccasions = product.occasions || product.occasion || []
    reset({
      ...product,
      imagesText: imgText,
      variants: product.variants?.length ? product.variants : [{ size: 'Tiêu chuẩn', price: 150000, stock: 50, sku: '' }],
    })
    setPreviewUrls(product.images || [])
    setSelectedOccasions(existingOccasions)
    setModal(true)
  }

  const onSave = async (data) => {
    setSaving(true)
    try {
      const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const payload = { ...data, slug, occasions: selectedOccasions }
      if (editing) {
        const res = await api.put(`/admin/products/${editing._id || editing.id}`, payload)
        setProducts(p => p.map(pr => (pr._id || pr.id) === (editing._id || editing.id) ? res.data : pr))
        toast.success('Cập nhật sản phẩm thành công')
      } else {
        const res = await api.post('/admin/products', payload)
        setProducts(p => [res.data, ...p])
        toast.success('Thêm sản phẩm thành công')
      }
      setModal(false)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi lưu sản phẩm')
    } finally {
      setSaving(false)
    }
  }

  const toggleOccasion = (label) => {
    setSelectedOccasions(prev =>
      prev.includes(label) ? prev.filter(o => o !== label) : [...prev, label]
    )
  }

  // Upload ảnh từ máy tính
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const newUrls = []
      for (const file of files) {
        const formData = new FormData()
        formData.append('image', file)
        const res = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        // Server trả URL dạng /uploads/products/..., cần full URL
        const fullUrl = `http://localhost:5000${res.data.url}`
        newUrls.push(fullUrl)
      }
      // Thêm URL mới vào textarea
      const current = getValues('imagesText') || ''
      const updated = current ? `${current}\n${newUrls.join('\n')}` : newUrls.join('\n')
      setValue('imagesText', updated)
      setPreviewUrls(prev => [...prev, ...newUrls])
      toast.success(`Đã upload ${newUrls.length} ảnh thành công`)
    } catch (e) {
      toast.error('Lỗi upload ảnh: ' + (e.response?.data?.message || e.message))
    } finally {
      setUploading(false)
      e.target.value = '' // reset input
    }
  }

  // Cập nhật preview khi thay URL
  const handleImagesTextChange = (e) => {
    const urls = e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
    setPreviewUrls(urls)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa sản phẩm này?')) return
    try {
      await api.delete(`/admin/products/${id}`)
      setProducts(p => p.filter(pr => pr.id !== id))
      toast.success('Đã xóa sản phẩm')
    } catch (e) {
      toast.error('Không thể xóa sản phẩm này')
    }
  }

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="admin-page-title">Quản lý mẫu hoa</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '.875rem' }}>{products.length} sản phẩm</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Thêm mẫu hoa
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input className="form-input" style={{ maxWidth: '320px' }}
          placeholder="Tìm tên sản phẩm..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}><div className="spinner spinner-lg" style={{ margin: '0 auto' }} /></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Loại</th>
                <th>Giá từ</th>
                <th>Tồn kho</th>
                <th>Đã bán</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                      <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0, background: 'var(--color-accent)' }}>
                        <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1487530811015-780b21f4f0e5?w=48&h=48&fit=crop&auto=format'} alt={p.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1487530811015-780b21f4f0e5?w=48&h=48&fit=crop&auto=format' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--color-text-muted)' }}>{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-gray">{p.type}</span></td>
                  <td><span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatVND(p.variants?.[0]?.price)}</span></td>
                  <td>{p.variants?.reduce((s, v) => s + (v.stock || 0), 0)}</td>
                  <td>{p.soldCount || 0}</td>
                  <td>
                    <span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
                      {p.status === 'active' ? 'Đang bán' : 'Tạm dừng'}
                    </span>
                    {p.isFeatured && <span className="badge badge-primary" style={{ marginLeft: '.25rem' }}>Nổi bật</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(p)} title="Sửa">
                        <Edit size={16} />
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => handleDelete(p.id)} title="Xóa">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Sửa mẫu hoa' : 'Thêm mẫu hoa mới'}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <form id="product-form" onSubmit={handleSubmit(onSave)}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Tên sản phẩm *</label>
                    <input className="form-input" {...register('name', { required: true })} placeholder="VD: Bó hoa hồng đỏ tình yêu" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Loại trình bày</label>
                    <select className="form-select" {...register('type')}>
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Trạng thái</label>
                    <select className="form-select" {...register('status')}>
                      <option value="active">Đang bán</option>
                      <option value="inactive">Tạm dừng</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Mô tả sản phẩm</label>
                    <textarea className="form-textarea" rows={3} {...register('description')} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">URL hình ảnh (mỗi dòng 1 URL)</label>

                    {/* Nút upload từ máy */}
                    <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.5rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}
                      >
                        {uploading
                          ? <><div className="spinner spinner-sm" /> Đang upload...</>
                          : <><Upload size={14} /> Chọn ảnh từ máy</>}
                      </button>
                      <span style={{ fontSize: '.75rem', color: 'var(--color-text-muted)' }}>hoặc dán URL bên dưới</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />
                    </div>

                    <textarea
                      className="form-textarea"
                      rows={3}
                      {...register('imagesText', {
                        onChange: handleImagesTextChange
                      })}
                      placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                    />
                    <div className="form-hint">Có thể dùng URL Unsplash: https://images.unsplash.com/photo-...</div>

                    {/* Preview ảnh */}
                    {previewUrls.length > 0 && (
                      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '.5rem' }}>
                        {previewUrls.map((url, i) => (
                          <div key={i} style={{ position: 'relative', width: '72px', height: '72px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px solid var(--color-border)' }}>
                            <img src={url} alt={`preview-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={e => e.target.style.display = 'none'} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Nổi bật</label>
                    <label className="form-check">
                      <input type="checkbox" {...register('isFeatured')} />
                      <span>Hiển thị trong mục sản phẩm nổi bật trên trang chủ</span>
                    </label>
                  </div>

                  {/* Dịp sử dụng */}
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Dịp sử dụng</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginTop: '.25rem' }}>
                      {occasionList.map(occ => {
                        const selected = selectedOccasions.includes(occ.label)
                        return (
                          <button
                            key={occ.slug}
                            type="button"
                            onClick={() => toggleOccasion(occ.label)}
                            style={{
                              padding: '.3rem .75rem',
                              borderRadius: '9999px',
                              border: `1.5px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                              background: selected ? 'var(--color-primary)' : '#fff',
                              color: selected ? '#fff' : 'var(--color-text)',
                              fontSize: '.8rem',
                              fontWeight: selected ? 700 : 400,
                              cursor: 'pointer',
                              transition: 'all .15s',
                              display: 'flex', alignItems: 'center', gap: '.3rem'
                            }}
                          >
                            <span>{occ.icon}</span> {occ.label}
                          </button>
                        )
                      })}
                    </div>
                    {selectedOccasions.length > 0 && (
                      <div style={{ marginTop: '.4rem', fontSize: '.75rem', color: 'var(--color-text-muted)' }}>
                        Đã chọn: {selectedOccasions.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Variants */}
                <div style={{ marginTop: '1rem' }}>
                  <label className="form-label">Biến thể (kích thước & giá) *</label>
                  <VariantsEditor register={register} watch={watch} setValue={setValue} />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Hủy</button>
              <button className="btn btn-primary" form="product-form" type="submit" disabled={saving}>
                {saving ? <><div className="spinner spinner-sm" /> Đang lưu...</> : (editing ? 'Cập nhật' : 'Thêm mẫu hoa')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function VariantsEditor({ register, watch, setValue }) {
  const variants = watch('variants') || [{ size: 'Tiêu chuẩn', price: 150000, stock: 50, sku: '' }]

  const add = () => setValue('variants', [...variants, { size: '', price: 0, stock: 0, sku: '' }])
  const remove = (i) => setValue('variants', variants.filter((_, idx) => idx !== i))

  return (
    <div>
      {variants.map((v, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '.5rem', marginBottom: '.5rem', alignItems: 'center' }}>
          <input className="form-input" {...register(`variants.${i}.size`)} placeholder="Size (VD: Nhỏ, Vừa, Lớn)" />
          <input className="form-input" type="number" {...register(`variants.${i}.price`)} placeholder="Giá (đ)" />
          <input className="form-input" type="number" {...register(`variants.${i}.stock`)} placeholder="Tồn kho" />
          <input className="form-input" {...register(`variants.${i}.sku`)} placeholder="SKU" />
          {variants.length > 1 && (
            <button type="button" className="btn btn-ghost btn-icon" style={{ color: 'var(--color-error)' }} onClick={() => remove(i)}>
              <X size={16} />
            </button>
          )}
        </div>
      ))}
      <button type="button" className="btn btn-outline btn-sm" onClick={add} style={{ marginTop: '.5rem' }}>
        <Plus size={14} /> Thêm biến thể
      </button>
    </div>
  )
}
