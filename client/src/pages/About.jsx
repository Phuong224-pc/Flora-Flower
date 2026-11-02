export default function About() {
  return (
    <div style={{ padding: '4rem 0', background: 'var(--color-bg)' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--color-primary)', marginBottom: '.75rem' }}>Câu chuyện của chúng tôi</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-heading)', marginBottom: '1rem' }}>Về Flora Flower</h1>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, fontSize: '1.1rem' }}>
            Flora Flower được thành lập với một mục tiêu đơn giản: mang những đóa hoa tươi đẹp nhất 
            đến tay người nhận, kèm theo tình cảm chân thành nhất.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden', aspectRatio: '4/3' }}>
            <img src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=500&h=375&fit=crop&q=80" alt="Flora Flower shop"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-heading)', marginBottom: '1rem' }}>
              Hơn 5 năm gửi trao yêu thương
            </h2>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: '1rem' }}>
              Kể từ khi thành lập, Flora Flower đã phục vụ hơn 50,000 khách hàng với hàng nghìn 
              bó hoa tươi được trao gửi mỗi ngày trên khắp TP. Hồ Chí Minh.
            </p>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
              Mỗi mẫu hoa đều được thiết kế bởi đội ngũ florist chuyên nghiệp, 
              lựa chọn từ những bông hoa tươi nhất và đóng gói cẩn thận để đến tay bạn trong tình trạng hoàn hảo.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {[
            { num: '50,000+', label: 'Khách hàng hài lòng' },
            { num: '200+', label: 'Mẫu hoa đa dạng' },
            { num: '5 năm', label: 'Kinh nghiệm phục vụ' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-primary)', fontWeight: 700 }}>{stat.num}</div>
              <div style={{ color: 'var(--color-text-muted)', marginTop: '.5rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
