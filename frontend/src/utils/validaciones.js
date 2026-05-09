const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
const soloNumeros = /^[0-9]*$/
const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const regexMonto = /^\d+(\.\d{1,2})?$/
const regexFecha = /^\d{4}-\d{2}-\d{2}$/

export const validarNombre = (valor) => {
    if (!valor) return 'El nombre es obligatorio'
    if (!soloLetras.test(valor)) return 'Solo se permiten letras'
    if (valor.length < 2) return 'Minimo 2 caracteres'
    return ''
}

export const validarApellido = (valor, obligatorio = true) => {
    if (!valor && obligatorio) return 'El apellido es obligatorio'
    if (valor && !soloLetras.test(valor)) return 'Solo se permiten letras'
    return ''
}

export const validarCorreo = (valor) => {
    if (!valor) return 'El correo es obligatorio'
    if (!regexCorreo.test(valor)) return 'Formato invalido, ejemplo: correo@gmail.com'
    return ''
}

export const validarTelefono = (valor) => {
    if (!valor) return 'El telefono es obligatorio'
    if (!soloNumeros.test(valor)) return 'Solo se permiten numeros'
    if (valor.length !== 10) return 'El telefono debe tener 10 digitos'
    return ''
}

export const validarPassword = (valor) => {
    if (!valor) return 'La contrasena es obligatoria'
    if (valor.length < 6) return 'Minimo 6 caracteres'
    return ''
}

export const validarMonto = (valor) => {
    if (!valor) return ''
    if (!regexMonto.test(valor)) return 'Ingresa un monto valido, ejemplo: 150.00'
    return ''
}

export const validarFecha = (valor) => {
    if (!valor) return 'La fecha es obligatoria'
    if (!regexFecha.test(valor)) return 'Formato invalido, usa: 2024-01-01'
    return ''
}

export const validarRequerido = (valor, campo) => {
    if (!valor) return `${campo} es obligatorio`
    return ''
}