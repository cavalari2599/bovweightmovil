<template>
    <pendientes-view :service="ganaderoService" :back-href="paths.ganadero.menu" />
</template>

<script setup>
import PendientesView from '../../components/PendientesView.vue'
import { ganaderoService } from '../../services/ganadero'
import { paths } from '../../router/paths'
</script>
