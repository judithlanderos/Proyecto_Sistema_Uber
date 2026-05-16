import { apiGet, apiPost, apiPut, apiDelete } from '../api/index'

export const getVehiculos = () => apiGet('/vehiculos/lista')
export const crearVehiculo = (data) => apiPost('/vehiculos/crear', data)
export const actualizarVehiculo = (id, data) => apiPut(`/vehiculos/${id}`, data)
export const eliminarVehiculo = (id) => apiDelete(`/vehiculos/${id}`)