<template>
    <div class="pagina">

        <!-- NAVBAR -->
        <nav class="navbar">
            <span class="logo">SistemaUber</span>
            <div class="nav-botones">
                <router-link to="/login" class="btn-outline">Iniciar Sesion</router-link>
                <router-link to="/registro" class="btn-verde">Registrarse</router-link>
            </div>
        </nav>

        <!-- HERO -->
        <section class="hero">
            <h1 class="hero-titulo">Gestion de Viajes <span class="verde">Uber</span></h1>
            <p class="hero-descripcion">
                Administra usuarios, conductores, vehiculos, viajes y pagos
                desde una sola plataforma. Simple, rapido y seguro.
            </p>
            <div class="hero-botones">
                <router-link to="/registro" class="btn-verde grande">Comenzar Ahora</router-link>
                <router-link to="/login" class="btn-outline grande">Iniciar Sesion</router-link>
            </div>
        </section>

        <!-- QUE OFRECE -->
        <section class="caracteristicas">
            <h2 class="seccion-titulo">Que ofrece el sistema</h2>
            <div class="tarjetas">

                <div class="tarjeta">
                    <div class="icono">🧑‍💼</div>
                    <h3>Gestion de Usuarios</h3>
                    <p>Registra y administra pasajeros con su informacion completa y metodos de pago.</p>
                </div>

                <div class="tarjeta">
                    <div class="icono">🚗</div>
                    <h3>Control de Conductores</h3>
                    <p>Gestiona conductores, sus vehiculos y calificaciones en tiempo real.</p>
                </div>

                <div class="tarjeta">
                    <div class="icono">📍</div>
                    <h3>Seguimiento de Viajes</h3>
                    <p>Registra origen, destino, distancia, estado y monto de cada viaje.</p>
                </div>

                <div class="tarjeta">
                    <div class="icono">💳</div>
                    <h3>Gestion de Pagos</h3>
                    <p>Controla los pagos generados por cada viaje completado.</p>
                </div>

                <div class="tarjeta">
                    <div class="icono">⭐</div>
                    <h3>Sistema de Calificaciones</h3>
                    <p>Usuarios y conductores pueden calificarse mutuamente al finalizar el viaje.</p>
                </div>

                <div class="tarjeta">
                    <div class="icono">🔒</div>
                    <h3>Acceso Seguro</h3>
                    <p>Sistema con autenticacion, sesiones protegidas y cifrado de contrasenas.</p>
                </div>

            </div>
        </section>

        <!-- FOOTER -->
        <footer class="footer">
            <p>SistemaUber &copy; 2026 — Proyecto </p>
        </footer>

    </div>
</template>

<script setup>
</script>

<style scoped>
.pagina {
    background-color: #0a0a0a;
    color: #ffffff;
    min-height: 100vh;
    width: 100vw;
    overflow-x: hidden;
    position: relative;
    left: 0;
}

/* NAVBAR */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 40px;
    border-bottom: 1px solid #1f1f1f;
    width: 100%;
    box-sizing: border-box;

}

.logo {
    font-size: 22px;
    font-weight: 700;
    color: #4ade80;
}

.nav-botones {
    display: flex;
    gap: 12px;
}

/* HERO */
.hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 100px 20px;
    width: 100%;
    box-sizing: border-box;
}

.hero-titulo {
    font-size: 52px;
    font-weight: 800;
    line-height: 1.2;
    max-width: 700px;
    margin-bottom: 24px;
}

.verde {
    color: #4ade80;
}

.hero-descripcion {
    font-size: 18px;
    color: #a0a0a0;
    max-width: 550px;
    line-height: 1.7;
    margin-bottom: 40px;
}

.hero-botones {
    display: flex;
    gap: 16px;
}

/* CARACTERISTICAS */
.caracteristicas {
    padding: 80px 60px;
    background-color: #0f0f0f;
}

.seccion-titulo {
    text-align: center;
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 50px;
    color: #ffffff;
}

.tarjetas {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    max-width: 1100px;
    margin: 0 auto;
}

.tarjeta {
    background-color: #141414;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 30px;
    transition: border-color 0.3s;
}

.tarjeta:hover {
    border-color: #4ade80;
}

.icono {
    font-size: 36px;
    margin-bottom: 16px;
}

.tarjeta h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #ffffff;
}

.tarjeta p {
    font-size: 14px;
    color: #a0a0a0;
    line-height: 1.6;
}

/* FOOTER */
.footer {
    text-align: center;
    padding: 30px;
    color: #444444;
    font-size: 14px;
    border-top: 1px solid #1f1f1f;
}

/* BOTONES */
.btn-verde {
    background-color: #4ade80;
    color: #0a0a0a;
    padding: 10px 22px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    transition: background-color 0.3s;
}

.btn-verde:hover {
    background-color: #22c55e;
}

.btn-outline {
    border: 1px solid #4ade80;
    color: #4ade80;
    padding: 10px 22px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s;
}

.btn-outline:hover {
    background-color: #4ade80;
    color: #0a0a0a;
}

.grande {
    padding: 14px 32px;
    font-size: 16px;
}

@media (min-width: 0px) {
    .pagina {
        margin-left: 0 !important;
        padding-left: 0 !important;
    }
}
</style>