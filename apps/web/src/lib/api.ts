import axios from 'axios'

const API_URL = 'http://localhost:9020/api/v1'
const AI_URL = 'http://localhost:8000'

const getToken = () => {
  try {
    const auth = localStorage.getItem('wetalk-auth')
    if (auth) return JSON.parse(auth)?.state?.token
  } catch {}
  return null
}

export const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data || err)
)

export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

export const channelsApi = {
  getAll: () => api.get('/channels'),
  getOne: (id: string) => api.get(`/channels/${id}`),
  createDirect: (targetId: string) => api.post('/channels/direct', { targetId }),
  createGroup: (data: any) => api.post('/channels/group', data),
}

export const messagesApi = {
  getByChannel: (channelId: string, cursor?: string) =>
    api.get(`/messages/channel/${channelId}${cursor ? `?cursor=${cursor}` : ''}`),
  send: (data: any) => api.post('/messages', data),
  edit: (id: string, content: string) => api.put(`/messages/${id}`, { content }),
  delete: (id: string) => api.delete(`/messages/${id}`),
  react: (id: string, emoji: string) => api.post(`/messages/${id}/reactions`, { emoji }),
}

export const aiApi = {
  analyze: (text: string, userId?: string) =>
    axios.post(`${AI_URL}/emotion/analyze`, { text, userId }),
}
