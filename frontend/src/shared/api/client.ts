import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const response = error.response

    if (response) {
      const message = response.data?.message || `API Error: ${response.status}`
      return Promise.reject(new Error(message))
    }

    if (error.request) {
      return Promise.reject(new Error('Network error — please check your connection'))
    }

    return Promise.reject(error)
  }
)
