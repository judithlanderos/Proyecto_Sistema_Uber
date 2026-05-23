import Swal from 'sweetalert2'

const estilos = {
    background: '#141414',
    color: '#ffffff',
    confirmButtonColor: '#4ade80',
    cancelButtonColor: '#7f1d1d',
    iconColor: '#4ade80'
}

export const alertaExito = (mensaje) => {
    Swal.fire({
        ...estilos,
        icon: 'success',
        title: 'Exito',
        text: mensaje,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
    })
}

export const alertaError = (mensaje) => {
    Swal.fire({
        ...estilos,
        icon: 'error',
        title: 'Error',
        text: mensaje,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
    })
}

export const alertaConfirmar = (mensaje) => {
    return Swal.fire({
        ...estilos,
        icon: 'warning',
        title: 'Confirmar',
        text: mensaje,
        showCancelButton: true,
        confirmButtonText: 'Si, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#7f1d1d',
        cancelButtonColor: '#1f1f1f',
        iconColor: '#f87171'
    })
}

export const alertaSesionExpirada = () => {
    return Swal.fire({
        ...estilos,
        icon: 'warning',
        title: 'Sesion expirada',
        text: 'Por favor vuelve a iniciar sesion',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false
    })
}