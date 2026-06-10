<template>
    <pendientes-view :service="ayudanteService" :back-href="paths.ayudante.menu" />
</template>

<script setup>
import PendientesView from '../../components/PendientesView.vue'
import { ayudanteService } from '../../services/ayudante'
import { paths } from '../../router/paths'
</script>
