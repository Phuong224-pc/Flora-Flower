export default function Policy() {
  return (
    <div style={{ padding: '4rem 0', background: 'var(--color-bg)' }}>
      <div className="container" style={{ maxWidth: '760px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-heading)', marginBottom: '2rem' }}>
          Chính sách giao hàng & Đổi trả
        </h1>

        {[
          {
            title: '🚚 Chính sách giao hàng',
            content: [
              'Giao hàng toàn TP. Hồ Chí Minh trong vòng 2–4 giờ kể từ khi đặt hàng.',
              'Phí giao hàng: 30,000đ – 50,000đ tùy khu vực và đơn hàng.',
              'Miễn phí giao hàng cho đơn từ 500,000đ trở lên (nội thành).',
              'Giao hàng theo khung giờ: 8:00–10:00, 10:00–12:00, 13:00–15:00, 15:00–17:00, 17:00–19:00, 19:00–21:00.',
              'Có thể đặt trước để giao đúng ngày dịp đặc biệt.',
            ]
          },
          {
            title: '🌸 Cam kết chất lượng hoa',
            content: [
              'Hoa tươi đảm bảo chất lượng, độ tươi ít nhất 2–3 ngày sau khi nhận.',
              'Hoa tươi là sản phẩm thiên nhiên, màu sắc và hình dáng có thể thay đổi nhẹ theo mùa và tình trạng nguồn hàng.',
              'Chúng tôi sẽ thông báo trước nếu có thay thế cụ thể đáng kể về thành phần hoa.',
            ]
          },
          {
            title: '🔄 Chính sách đổi trả',
            id: 'return',
            content: [
              'Hoàn tiền hoặc làm lại miễn phí nếu hoa bị hỏng, dập nát nghiêm trọng khi nhận.',
              'Yêu cầu đổi trả phải được thông báo trong vòng 30 phút kể từ khi nhận hoa, kèm hình ảnh.',
              'Không áp dụng hoàn trả cho trường hợp khách tự làm hỏng sau khi nhận.',
              'Liên hệ hotline hoặc email để được hỗ trợ nhanh nhất.',
            ]
          },
        ].map(section => (
          <div key={section.title} id={section.id} className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--color-heading)', marginBottom: '1rem' }}>
              {section.title}
            </h2>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {section.content.map((item, i) => (
                <li key={i} style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
