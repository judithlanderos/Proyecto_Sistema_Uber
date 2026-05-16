import { apiGet, apiPost, apiPut, apiDelete } from '../api/index'

export const getConductores = () => apiGet('/conductores/lista')

export const crearConductor = (data) => apiPost('/conductores/crear', data)

export const actualizarConductor = (id, data) => apiPut(`/conductores/${id}`, data)

export const eliminarConductor = (id) => apiDelete(`/conductores/${id}`)