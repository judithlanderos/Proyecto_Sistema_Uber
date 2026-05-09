import axios from 'axios'

const BASE_URL = 'http://localhost:3000/api'

const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
})

export const apiGet = (url) => axios.get(`${BASE_URL}${url}`, { headers: getHeaders() })
export const apiPost = (url, data) => axios.post(`${BASE_URL}${url}`, data, { headers: getHeaders() })
export const apiPut = (url, data) => axios.put(`${BASE_URL}${url}`, data, { headers: getHeaders() })
export const apiDelete = (url) => axios.delete(`${BASE_URL}${url}`, { headers: getHeaders() })
export const apiPostPublic = (url, data) => axios.post(`${BASE_URL}${url}`, data)