import { apiGet, apiPost, apiPut, apiDelete } from '../api/index'

export const getViajes = () => apiGet('/viajes')
export const getViajeDetalle = (id) => apiGet(`/viajes/detalle/${id}`)
export const postViaje = (datos) => apiPost('/viajes', datos)
export const putViaje = (id, datos) => apiPut(`/viajes/${id}`, datos)
export const deleteViaje = (id) => apiDelete(`/viajes/${id}`)
export const getUsuarios = () => apiGet('/usuarios')
export const getConductores = () => apiGet('/conductores')
export const getVehiculos = () => apiGet('/vehiculos')