import axios from 'axios'

const BASE = 'http://localhost:3000/api'

const getHeaders = () => {
    const token = localStorage.getItem('token')
    return { Authorization: `Bearer ${token}` }
}

export const getViajes = () =>
    axios.get(`${BASE}/viajes`, { headers: getHeaders() })

export const getUsuarios = () =>
    axios.get(`${BASE}/usuarios`, { headers: getHeaders() })

export const getConductores = () =>
    axios.get(`${BASE}/conductores`, { headers: getHeaders() })

export const getVehiculos = () =>
    axios.get(`${BASE}/vehiculos`, { headers: getHeaders() })

export const createViaje = (data) =>
    axios.post(`${BASE}/viajes`, data, { headers: getHeaders() })

export const updateViaje = (id, data) =>
    axios.put(`${BASE}/viajes/${id}`, data, { headers: getHeaders() })

export const deleteViaje = (id) =>
    axios.delete(`${BASE}/viajes/${id}`, { headers: getHeaders() })