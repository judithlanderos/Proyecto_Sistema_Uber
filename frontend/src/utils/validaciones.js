const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?$/
const soloNumeros = /^[0-9]*$/
const regexCorreo = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
const regexMonto =  /^(?!0+(\.0{1,2})?$)\d+(\.\d{1,2})?$/
const regexFecha = /^\d{4}-\d{2}-\d{2}$/
const regexLugar  = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ][a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s,.\-#]*$/
const regexDireccion = /^(?:\d{1,2}\s)?[a-zA-ZáéíóúÁÉÍÓÚñÑ][a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+(?:\s\d{1,2})?$/


export const validarNombre = (valor) => {
    const v = (valor ?? '').trim()
    if (!valor) return 'El nombre es obligatorio'
    if (!soloLetras.test(valor)) return 'Solo se permiten letras'
    if (valor.length < 3) return 'Minimo 3 caracteres'
    if (v.length > 50) return 'El nombre no puede exceder 50 caracteres.'
    return ''
}

export const validarApellido = (valor, obligatorio = true) => {
    const v = (valor ?? '').trim()
    if (!valor && obligatorio) return 'El apellido es obligatorio'
    if (valor && !soloLetras.test(valor)) return 'Solo se permiten letras'
    if (v.length < 3) return 'El apellido debe tener al menos 3 caracteres.'
    if (v.length > 50) return 'El apellido no puede exceder 50 caracteres.'
    return ''
}

export const validarCorreo = (valor) => {
        const v = (valor ?? '').trim()

    if (!valor) return 'El correo es obligatorio'
    if (!regexCorreo.test(valor)) return 'Formato invalido, ejemplo: correo@gmail.com'
    if (v.length > 254) return 'El correo no puede exceder 254 caracteres.'
    return ''
}

export const validarTelefono = (valor) => {
    const v = (valor ?? '').trim()
    if (!valor) return 'El telefono es obligatorio'
    if (!soloNumeros.test(valor)) return 'Solo se permiten numeros'
    if (valor.length !== 10) return 'El telefono debe tener 10 digitos'
    if (/^(\d)\1{9}$/.test(v)) return 'El teléfono no puede tener todos los dígitos iguales.'
    return ''
}

export const validarPassword = (valor) => {
    const v = (valor ?? '').trim()
    if (!valor) return 'La contrasena es obligatoria'
    if (valor.length < 6) return 'Minimo 6 caracteres'
    return ''
}

export const validarMonto = (valor) => {
    const v = (valor ?? '').toString().trim()
    if (!valor) return ''
    if (!regexMonto.test(valor)) return 'Ingresa un monto valido, ejemplo: 150.00'
    if (!regexMonto.test(v)) return 'Monto inválido; debe ser mayor a 0, ejemplo: 150.00'
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

export const validarDistancia = (valor) => {
    if (!valor) return ''
    if (!regexMonto.test(valor)) return 'Distancia invalida, ejemplo: 10.50'
    return ''
}

export const validarSeleccion = (valor, campo) => {
    if (!valor) return `Selecciona ${campo}`
    return ''
}
export const validarOrigen = (valor) => {
    const v = (valor ?? '').trim()
    if (!v) return 'El origen es obligatorio.'
    if (v.length < 3) return 'El origen debe tener al menos 3 caracteres.'
    if (v.length > 100) return 'El origen no puede exceder 100 caracteres.'
    if (!regexDireccion.test(v)) return 'El origen debe contener letras. Solo se permiten hasta 2 números al inicio o al final.'
    return ''
}

export const validarDestino = (valor) => {
    const v = (valor ?? '').trim()
    if (!v) return 'El destino es obligatorio.'
    if (v.length < 3) return 'El destino debe tener al menos 3 caracteres.'
    if (v.length > 100) return 'El destino no puede exceder 100 caracteres.'
    if (!regexDireccion.test(v)) return 'El destino debe contener letras. Solo se permiten hasta 2 números al inicio o al final.'
    return ''
}