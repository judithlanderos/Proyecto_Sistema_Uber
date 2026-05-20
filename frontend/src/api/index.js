import axios from 'axios'
import router from '../router'

const BASE_URL =  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
})


const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('usuario')
            alert('Tu sesion ha expirado. Por favor vuelve a iniciar sesion.')
            router.push('/login')
        }
        return Promise.reject(error)
    }
)

export const apiGet = (url) => axios.get(`${BASE_URL}${url}`, { headers: getHeaders() })
export const apiPost = (url, data) => axios.post(`${BASE_URL}${url}`, data, { headers: getHeaders() })
export const apiPut = (url, data) => axios.put(`${BASE_URL}${url}`, data, { headers: getHeaders() })
export const apiDelete = (url) => axios.delete(`${BASE_URL}${url}`, { headers: getHeaders() })
export const apiPostPublic = (url, data) => axios.post(`${BASE_URL}${url}`, data)

