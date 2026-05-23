import api from './axiosInstance'

// Step 1: upload image + GPS → get AI detection preview
export async function uploadReport(imageFile, coords) {
  const formData = new FormData()
  formData.append('image', imageFile)
  if (coords) {
    formData.append('lat', coords.lat)
    formData.append('lng', coords.lng)
  }
  const res = await api.post('/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data
}

// Step 2: confirm/correct detection, finalize report
export async function confirmReport({ tempId, damageType, description, email }) {
  const res = await api.post('/reports/confirm', {
    tempId,
    damageType,
    description,
    email,
  })
  return res.data.data
}

// Get single report by tracking ID (public)
export async function getReportByTrackingId(trackingId) {
  const res = await api.get(`/reports/${trackingId}`)
  return res.data.data
}

// Get logged-in citizen's own reports
export async function getMyReports() {
  const res = await api.get('/reports/mine')
  return res.data.data
}

// Get all reports for municipal dashboard
export async function getAllReports(filters = {}) {
  const res = await api.get('/reports', { params: filters })
  return res.data.data
}

// Update report status (municipal only)
export async function updateReportStatus(id, status) {
  const res = await api.patch(`/reports/${id}/status`, { status })
  return res.data.data
}
