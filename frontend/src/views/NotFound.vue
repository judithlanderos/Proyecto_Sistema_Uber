<template>
    <div class="contenedor">
        <h1 class="codigo">UPS!!!! ERROR 404</h1>
        <p class="mensaje">Pagina no encontrada</p>
        <router-link to="/login" class="boton">Regresar al inicio</router-link>
    </div>
</template>

<style scoped>
.contenedor {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #0a0a0a;
    gap: 16px;
}

.codigo {
    font-size: 100px;
    color: #4ade80;
    font-weight: 700;
}

.mensaje {
    color: #a0a0a0;
    font-size: 20px;
}

.boton {
    padding: 12px 30px;
    background-color: #4ade80;
    color: #0a0a0a;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 15px;
}

.boton:hover {
    background-color: #22c55e;
}
</style>