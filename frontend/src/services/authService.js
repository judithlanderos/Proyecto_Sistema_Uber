import { apiPostPublic } from '../api/index'

export const loginService = (correo, password) => {
    return apiPostPublic('/auth/login', { correo, password })
}

export const registroService = (datos) => {
    return apiPostPublic('/auth/registro', datos)
}

export const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
}

export const getUsuario = () => {
    return JSON.parse(localStorage.getItem('usuario'))
}

export const getToken = () => {
    return localStorage.getItem('token')
}