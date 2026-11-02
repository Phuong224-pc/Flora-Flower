import { useState, useEffect } from 'react'
import { Save, RefreshCw, Building2, Store, Truck, Eye } from 'lucide-react'
import api from '../../services/api'
import useToastStore from '../../store/useToastStore'

const VIET_QR_BANKS = [
  { code: 'VCB',  name: 'Vietcombank' },
  { code: 'TCB',  name: 'Techcombank' },
  { code: 'MB',   name: 'MBBank' },
  { code: 'ACB',  name: 'ACB' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'VTB',  name: 'Vietinbank' },
  { code: 'VPB',  name: 'VPBank' },
  { code: 'TPB',  name: 'TPBank' },
  { code: 'STB',  name: 'Sacombank' },
  { code: 'HDB',  name: 'HDBank' },
  { code: 'OCB',  name: 'OCB' },
  { code: 'MSB',  name: 'MSB' },
]

function Section({ icon: Icon, title, children }) {
  return (
    <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--color-heading)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
        <Icon size={18} color="var(--color-primary)" /> {title}
      </h3>
      {children}
    </div>
  )
}

export default function AdminSettings() {
  const toast = useToastStore()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [qrPreview, setQrPreview] = useState(false)

  useEffect(() => {
    api.get('/settings')
      .then(r => setSettings(r.data))
      .catch(() => toast.error('Không tải được cài đặt'))
      .finally(() => setLoading(false))
  }, [])

  const setField = (section, key, val) => {
    setSettings(s => ({ ...s, [section]: { ...s[section], [key]: val } }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/settings', settings)
      toast.success('Đã lưu cài đặt')
    } catch {
      toast.error('Lỗi lưu cài đặt')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading-page"><div className="spinner" /></div>
  if (!settings) return null

  const qrUrl = `https://img.vietqr.io/image/${settings.bank?.bankCode || 'VCB'}-${settings.bank?.accountNumber || '0'}-compact2.png?amount=100000&addInfo=${encodeURIComponent('FLORA TEST')}&accountName=${encodeURIComponent(settings.bank?.accountName || 'FLORA FLOWER')}`

  return (
    <div className="admin-page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-page-title">Cài đặt cửa hàng</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '.875rem', marginTop: '.25rem' }}>
            Cấu hình thông tin shop và phương thức thanh toán QR
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <><div className="spinner spinner-sm" /> Đang lưu...</> : <><Save size={16} /> Lưu cài đặt</>}
        </button>
      </div>

      {/* Shop info */}
      <Section icon={Store} title="Thông tin cửa hàng">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { label: 'Tên cửa hàng', key: 'name', placeholder: 'Flora Flower' },
            { label: 'Slogan', key: 'tagline', placeholder: 'Hoa tươi cao cấp TP.HCM' },
            { label: 'Số điện thoại', key: 'phone', placeholder: '0909 123 456' },
            { label: 'Email', key: 'email', placeholder: 'hello@floraflower.vn' },
            { label: 'Giờ mở cửa', key: 'openHours', placeholder: '08:00 – 21:00 (T2–CN)' },
            { label: 'Facebook', key: 'facebook', placeholder: 'https://facebook.com/...' },
          ].map(f => (
            <div key={f.key} className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{f.label}</label>
              <input className="form-input" value={settings.shop?.[f.key] || ''} onChange={e => setField('shop', f.key, e.target.value)} placeholder={f.placeholder} />
            </div>
          ))}
        </div>
        <div className="form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
          <label className="form-label">Địa chỉ cửa hàng</label>
          <input className="form-input" value={settings.shop?.address || ''} onChange={e => setField('shop', 'address', e.target.value)} placeholder="123 Đường Hoa Hồng, Q.1, TP.HCM" />
        </div>
      </Section>

      {/* Shipping */}
      <Section icon={Truck} title="Cài đặt giao hàng">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Phí giao hàng (đ)</label>
            <input className="form-input" type="number" value={settings.shipping?.fee || 30000}
              onChange={e => setField('shipping', 'fee', Number(e.target.value))} />
            <div className="form-hint">Áp dụng cho đơn giao tận nơi</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Miễn phí giao từ (đ)</label>
            <input className="form-input" type="number" value={settings.shipping?.freeFrom || 0}
              onChange={e => setField('shipping', 'freeFrom', Number(e.target.value))} />
            <div className="form-hint">0 = không có miễn phí</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Xác nhận tự động (phút)</label>
            <input className="form-input" type="number" value={settings.order?.confirmTimeout || 30}
              onChange={e => setField('order', 'confirmTimeout', Number(e.target.value))} />
          </div>
        </div>
      </Section>

      {/* Bank / QR */}
      <Section icon={Building2} title="Tài khoản ngân hàng & Mã QR VietQR">
        <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
          💡 Cấu hình tài khoản ngân hàng để khách hàng quét mã QR trên trang thanh toán và đơn hàng.
          Sử dụng chuẩn <strong>VietQR.io</strong> — tương thích với tất cả ngân hàng nội địa.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Ngân hàng *</label>
            <select className="form-select" value={settings.bank?.bankCode || 'VCB'}
              onChange={e => {
                const bank = VIET_QR_BANKS.find(b => b.code === e.target.value)
                setField('bank', 'bankCode', e.target.value)
                if (bank) setField('bank', 'bankName', bank.name)
              }}>
              {VIET_QR_BANKS.map(b => <option key={b.code} value={b.code}>{b.name} ({b.code})</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Số tài khoản *</label>
            <input className="form-input" value={settings.bank?.accountNumber || ''}
              onChange={e => setField('bank', 'accountNumber', e.target.value)}
              placeholder="1234567890" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tên chủ tài khoản *</label>
            <input className="form-input" value={settings.bank?.accountName || ''}
              onChange={e => setField('bank', 'accountName', e.target.value.toUpperCase())}
              placeholder="FLORA FLOWER" style={{ textTransform: 'uppercase' }} />
            <div className="form-hint">Viết HOA không dấu, đúng tên trên tài khoản</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nội dung chuyển khoản</label>
            <input className="form-input" value={settings.bank?.transferNote || 'FLORA {ORDER_ID}'}
              onChange={e => setField('bank', 'transferNote', e.target.value)}
              placeholder="FLORA {ORDER_ID}" />
            <div className="form-hint"><code>{'{ORDER_ID}'}</code> sẽ được thay bằng mã đơn hàng tự động</div>
          </div>
        </div>

        {/* QR Preview */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.875rem' }}>
            <span style={{ fontWeight: 600, fontSize: '.9rem', color: 'var(--color-heading)' }}>Xem trước mã QR</span>
            <button className="btn btn-outline btn-sm" onClick={() => setQrPreview(v => !v)}>
              <Eye size={15} /> {qrPreview ? 'Ẩn' : 'Xem thử'}
            </button>
          </div>

          {qrPreview && (
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div className="qr-box" style={{ maxWidth: '200px' }}>
                <img src={qrUrl} alt="QR Preview" style={{ maxWidth: '180px', margin: '0 auto', borderRadius: 'var(--r-lg)' }}
                  onError={e => { e.target.parentNode.innerHTML = '<p style="color:red;font-size:.8rem;padding:1rem">Không tải được QR. Kiểm tra số tài khoản và mã ngân hàng.</p>' }} />
                <p style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginTop: '.5rem' }}>
                  Mẫu xem thử: 100,000đ
                </p>
              </div>
              <div style={{ fontSize: '.85rem', color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
                <div><strong>Ngân hàng:</strong> {settings.bank?.bankName} ({settings.bank?.bankCode})</div>
                <div><strong>Số TK:</strong> {settings.bank?.accountNumber}</div>
                <div><strong>Tên TK:</strong> {settings.bank?.accountName}</div>
                <div style={{ marginTop: '.5rem', padding: '.625rem', background: 'var(--color-green-bg)', borderRadius: 'var(--r-md)', color: 'var(--color-green)', fontWeight: 600 }}>
                  ✅ Tương thích VietQR — khách dùng app ngân hàng quét được ngay
                </div>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Save at bottom too */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
          {saving ? <><div className="spinner spinner-sm" /> Đang lưu...</> : <><Save size={18} /> Lưu tất cả cài đặt</>}
        </button>
      </div>
    </div>
  )
}
