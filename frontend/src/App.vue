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
    margin-left: 0 !important;
    padding-left: 0 !important;
}

#app {
    background-color: #0a0a0a;
    min-height: 100vh;
    margin-left: 0 !important;
}

.main-sidebar {
    display: none !important;
}

.content-wrapper {
    margin-left: 0 !important;
}
</style>