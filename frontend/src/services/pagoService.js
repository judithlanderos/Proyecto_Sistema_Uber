import { apiGet, apiPost, apiPut, apiDelete } from '../api/index'

export const getPagos = () => apiGet('/pagos/lista')
export const getViajesCompletados = () => apiGet('/pagos/viajes-completados')
export const crearPago = (data) => apiPost('/pagos/crear', data)
export const actualizarPago = (id, data) => apiPut(`/pagos/${id}`, data)
export const eliminarPago = (id) => apiDelete(`/pagos/${id}`)
export const getMetodosPago = (id_usuario) => apiGet(`/pagos/metodos?id_usuario=${id_usuario}`)