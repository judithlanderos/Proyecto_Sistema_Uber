<template>
    <router-view />
</template>

<script setup>
</script>
<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', sans-serif;
}

html, body {
    background-color: #0a0a0a !important;
    min-height: 100vh;
}

#app {
    background-color: #0a0a0a;
    min-height: 100vh;
}

.main-sidebar {
    display: block !important;
    visibility: visible !important;
    z-index: 1038 !important;
}

.contenedor {
    margin-left: 0 !important;
}
</style>