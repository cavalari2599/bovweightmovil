<template>
    <ion-page>
        <ion-router-outlet />

        <!-- Barra de navegación: no se muestra en Fincas -->
        <div v-if="mostrarNav" class="bw-nav">
            <button class="bw-nav__btn" @click="volverAFincas">
                <ion-icon :icon="homeOutline" aria-hidden="true" />
                <span>Fincas</span>
            </button>

            <button v-if="enTratamientos" class="bw-nav__btn" @click="volverAAnimales">
                <ion-icon :icon="pawOutline" aria-hidden="true" />
                <span>Animales</span>
            </button>
        </div>
    </ion-page>
</template>

<script setup>
import { computed } from 'vue'
import { IonPage, IonRouterOutlet, IonIcon } from '@ionic/vue'
import { useRoute, useRouter } from 'vue-router'
import { homeOutline, pawOutline } from 'ionicons/icons'
import { paths } from '../../router/paths'

const route = useRoute()
const router = useRouter()

// Detecta la pantalla actual por la ruta
const enMenu = computed(() => route.path.endsWith('/menu'))
const enFincas = computed(() => route.path.endsWith('/fincas'))
const enTratamientos = computed(() => route.path.endsWith('/tratamientos'))

// La barra NO se muestra en el menú ni en Fincas
const mostrarNav = computed(() => !enMenu.value && !enFincas.value)

// idFinca: param en Animales, query en Tratamientos
const idFinca = computed(() => route.params.idFinca || route.query.idFinca)

function volverAFincas() {
    router.push(paths.veterinario.fincas)
}

function volverAAnimales() {
    router.push(paths.veterinario.animales(idFinca.value))
}
</script>

<style scoped>
.bw-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    display: flex;
    justify-content: center;
    gap: 10px;
    padding: 10px 14px calc(12px + env(safe-area-inset-bottom));
    pointer-events: none;
}
.bw-nav__btn {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 7px;
    background: #1D9E75;        /* verde primario de la app */
    color: #ffffff;
    border: none;
    border-radius: 14px;
    padding: 10px 18px;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(29, 158, 117, 0.3);
    cursor: pointer;
}
.bw-nav__btn ion-icon {
    font-size: 18px;
}
.bw-nav__btn:active {
    background: #0d6e50;
}
</style>