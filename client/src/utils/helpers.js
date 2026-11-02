/** Format số VND */
export const formatVND = (amount) => {
  if (!amount && amount !== 0) return '0đ'
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ'
}

/** Format datetime VN */
export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Stars render */
export const renderStars = (rating) => {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    stars.push(i <= Math.round(rating) ? '★' : '☆')
  }
  return stars.join('')
}

/** Slugify Vietnamese */
export const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/[àáâãäả]/g, 'a')
    .replace(/[èéêẽëẻ]/g, 'e')
    .replace(/[ìíîĩïỉ]/g, 'i')
    .replace(/[òóôõöọ]/g, 'o')
    .replace(/[ùúûũüụ]/g, 'u')
    .replace(/[ýỳỷỹỵ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/** Get order status label */
export const getStatusLabel = (status) => {
  const map = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    preparing: 'Đang chuẩn bị',
    ready: 'Sẵn sàng',
    delivering: 'Đang giao',
    completed: 'Hoàn tất',
    cancelled: 'Đã hủy',
  }
  return map[status] || status
}

export const getStatusClass = (status) => {
  const map = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    preparing: 'status-preparing',
    ready: 'status-ready',
    delivering: 'status-delivering',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
  }
  return map[status] || 'badge-gray'
}

/** Get payment status */
export const getPaymentLabel = (status) => {
  const map = {
    unpaid: 'Chưa thanh toán',
    paid: 'Đã thanh toán',
    refunded: 'Đã hoàn tiền',
  }
  return map[status] || status
}

export const getPaymentMethodLabel = (method) => {
  const map = {
    cod: 'Thanh toán khi nhận hàng (COD)',
    bank_transfer: 'Chuyển khoản ngân hàng',
    demo_online: 'Thanh toán trực tuyến (Demo)',
  }
  return map[method] || method
}

/** Truncate text */
export const truncate = (str, max = 100) => {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '...' : str
}
