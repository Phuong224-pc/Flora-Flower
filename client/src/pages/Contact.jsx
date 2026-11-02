import { useForm } from 'react-hook-form'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import useToastStore from '../store/useToastStore'

export default function Contact() {
  const toast = useToastStore()
  const { register, handleSubmit, reset } = useForm()

  const onSubmit = (data) => {
    toast.success('Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ lại trong 24 giờ.')
    reset()
  }

  return (
    <div style={{ padding: '4rem 0', background: 'var(--color-bg)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--color-primary)', marginBottom: '.75rem' }}>Liên hệ</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-heading)' }}>Chúng tôi luôn sẵn lòng lắng nghe</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', maxWidth: '900px', margin: '0 auto' }}>
          {/* Info */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-heading)', marginBottom: '1.5rem' }}>Thông tin liên hệ</h2>
            {[
              { icon: MapPin, title: 'Địa chỉ', desc: '123 Đường Hoa Hồng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh' },
              { icon: Phone, title: 'Điện thoại', desc: '0909 123 456 (7:00 – 21:00, Thứ 2 – CN)' },
              { icon: Mail, title: 'Email', desc: 'hello@floraflower.vn' },
              { icon: Clock, title: 'Giờ làm việc', desc: 'Thứ Hai – Chủ Nhật: 7:00 – 21:00' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', background: 'var(--color-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color="var(--color-primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-heading)', marginBottom: '.25rem' }}>{title}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '.875rem' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="card" style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label">Họ tên *</label>
                <input className="form-input" {...register('name', { required: true })} placeholder="Nguyễn Văn A" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" {...register('email', { required: true })} placeholder="email@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Nội dung *</label>
                <textarea className="form-textarea" rows={5} {...register('message', { required: true })} placeholder="Bạn muốn hỏi gì?" />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Gửi tin nhắn
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
