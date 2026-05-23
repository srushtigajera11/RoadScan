import api from './axiosInstance'

export async function registerUser({ name, email, password }) {
  const res = await api.post('/auth/register', { name, email, password })
  return res.data.data
}

export async function loginUser({ email, password }) {
  const res = await api.post('/auth/login', { email, password })
  return res.data.data
}

export async function getMe() {
  const res = await api.get('/auth/me')
  return res.data.data
}
