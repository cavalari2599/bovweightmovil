<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="success">
                <ion-title>BovWeight CR</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="handleLogout">
                        <ion-icon :icon="logOutOutline" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <div class="bienvenida">
                <h2>Bienvenido, {{ auth.usuario?.nombre }}</h2>
                <p>¿Qué deseas hacer hoy?</p>
            </div>

            <div class="menu">
                <div class="menu-card" @click="router.push(paths.ganadero.captura)">
                    <ion-icon :icon="scaleOutline" class="menu-icon" />
                    <h3>Captura Rápida</h3>
                    <p>Estima el peso de un animal con una foto</p>
                </div>

                <div v-if="pendientesSync > 0" class="menu-card alerta" @click="router.push(paths.ganadero.pendientes)">
                    <div class="badge-pendiente">{{ pendientesSync }}</div>
                    <ion-icon :icon="cloudUploadOutline" class="menu-icon pulse" />
                    <h3>Pendientes de sincronizar</h3>
                    <p class="pendiente-texto">
                        {{ pendientesSync }} captura{{ pendientesSync > 1 ? 's' : '' }} sin subir
                    </p>
                </div>

                <div class="menu-card" @click="router.push(paths.ganadero.calendario)">
                    <div v-if="pendientes > 0" class="badge-pendiente">{{ pendientes }}</div>
                    <ion-icon :icon="calendarOutline" class="menu-icon" :class="{ pulse: pendientes > 0 }" />
                    <h3>Calendario de Pesajes</h3>
                    <p v-if="pendientes > 0" class="pendiente-texto">
                        Tienes {{ pendientes }} pesaje{{ pendientes > 1 ? 's' : '' }} pendiente{{ pendientes > 1 ? 's' : '' }}
                    </p>
                    <p v-else>Programa y revisa tus próximos pesajes</p>
                </div>

                <div class="menu-card" @click="router.push(`${paths.ganadero.fincas}?modo=animales`)">
                    <ion-icon :icon="pawOutline" class="menu-icon" />
                    <h3>Gestionar Animales</h3>
                    <p>Gestiona tus animales, pesajes y tratamientos</p>
                </div>

                <div class="menu-card" @click="router.push(paths.ganadero.fincas)">
                    <ion-icon :icon="homeOutline" class="menu-icon" />
                    <h3>Gestionar Fincas</h3>
                    <p>Gestiona tus fincas, veterinarios y ayudantes</p>
                </div>

                <div class="menu-card" @click="router.push(`${paths.ganadero.fincas}?modo=reporte`)">
                    <ion-icon :icon="documentTextOutline" class="menu-icon" />
                    <h3>Reportes</h3>
                    <p>Genera un PDF de animales disponibles para compradores</p>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon, onIonViewWillEnter
} from '@ionic/vue'
import { homeOutline, scaleOutline, pawOutline, logOutOutline, documentTextOutline, calendarOutline, cloudUploadOutline } from 'ionicons/icons'
import { useAuthStore } from '../../stores/auth'
import { ganaderoService } from '../../services/ganadero'
import { colaPesajes } from '../../services/colaPesajes'
import { estimarPendientes } from '../../services/sincronizar'
import { paths } from '../../router/paths'

const router = useRouter()
const auth = useAuthStore()
const pendientes = ref(0)
const pendientesSync = ref(0)

function hoy() {
    return new Date().toISOString().slice(0, 10)
}

async function cargarPendientes() {
    try {
        const { data } = await ganaderoService.getRecordatorios()
        pendientes.value = data.filter(a => (a.proximo_pesaje || '').slice(0, 10) <= hoy()).length
    } catch {
        pendientes.value = 0
    }
    try {
        pendientesSync.value = await colaPesajes.contar()
        // Con internet, estima en segundo plano las capturas en cola.
        if (navigator.onLine && pendientesSync.value > 0) {
            estimarPendientes(ganaderoService)
        }
    } catch {
        pendientesSync.value = 0
    }
}

async function handleLogout() {
    await auth.logout()
    router.push(paths.login)
}

onIonViewWillEnter(cargarPendientes)
</script>

<style scoped>
.bienvenida {
    margin-bottom: 2rem;
}

.bienvenida h2 {
    color: #2d6a4f;
    margin: 0;
}

.bienvenida p {
    color: #888;
    margin: 0.25rem 0 0;
}

.menu {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.menu-card {
    position: relative;
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    cursor: pointer;
    border-left: 4px solid #2d6a4f;
    transition: transform 0.1s;
}

.badge-pendiente {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    min-width: 1.5rem;
    height: 1.5rem;
    padding: 0 0.4rem;
    background: #c0392b;
    color: #fff;
    border-radius: 1rem;
    font-size: 0.85rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 0 rgba(192, 57, 43, 0.5);
    animation: pulse-badge 1.5s infinite;
}

.pendiente-texto {
    color: #c0392b !important;
    font-weight: 600;
}

.pulse {
    animation: pulse-icon 1.5s infinite;
}

@keyframes pulse-badge {
    0%   { box-shadow: 0 0 0 0 rgba(192, 57, 43, 0.5); }
    70%  { box-shadow: 0 0 0 10px rgba(192, 57, 43, 0); }
    100% { box-shadow: 0 0 0 0 rgba(192, 57, 43, 0); }
}

@keyframes pulse-icon {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.15); }
}

.menu-card:active {
    transform: scale(0.98);
}

.menu-card.deshabilitado {
    border-left-color: #ccc;
    opacity: 0.6;
    cursor: not-allowed;
}

.menu-icon {
    font-size: 2rem;
    color: #2d6a4f;
    margin-bottom: 0.5rem;
}

.deshabilitado .menu-icon {
    color: #aaa;
}

.menu-card h3 {
    margin: 0 0 0.25rem;
    color: #333;
}

.menu-card p {
    margin: 0;
    color: #888;
    font-size: 0.85rem;
}
</style>