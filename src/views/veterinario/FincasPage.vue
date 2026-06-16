<template>
    <ion-page class="fincas-page">
        <ion-header class="ion-no-border">
            <ion-toolbar class="bw-toolbar">
                <ion-buttons slot="start">
                    <ion-button @click="router.push(paths.veterinario.menu)">
                        <ion-icon :icon="arrowBackOutline" />
                    </ion-button>
                </ion-buttons>
                <div slot="start" class="bw-brand">
                    <img src="../../assets/cow-icon.png" alt="BovWeight CR" class="bw-brand-img" />
                </div>
                <ion-title>Mis Fincas</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="handleLogout">
                        <ion-icon :icon="logOutOutline" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="bw-content">
            <div class="bw-hero">
                <img src="../../assets/FondoMisFincas.png" alt="" class="bw-banner" />
                <ion-searchbar v-model="busqueda" class="bw-search" placeholder="Buscar finca..." />
            </div>
            <div v-if="loading" class="bw-estado">
                <ion-spinner name="crescent" />
                <p>Cargando fincas...</p>
            </div>

            <template v-else>
                <div class="bw-cards">
                    <ion-item
                        v-for="finca in fincasFiltradas"
                        :key="finca.id_finca"
                        button
                        detail="false"
                        lines="none"
                        class="finca-card"
                        @click="verAnimales(finca.id_finca)"
                    >
                        <div slot="start" class="icon-box">
                            <ion-icon :icon="homeOutline" />
                        </div>
                        <ion-label>
                            <h2>{{ finca.nombre_finca }}</h2>
                            <p class="ubicacion">
                                <ion-icon :icon="locationOutline" />
                                {{ finca.ubicacion_finca }}
                            </p>
                        </ion-label>
                        <ion-icon :icon="chevronForwardOutline" slot="end" class="chevron" />
                    </ion-item>
                </div>

                <div v-if="fincas.length === 0" class="bw-estado">
                    <ion-icon :icon="homeOutline" />
                    <p>No tienes fincas asignadas.</p>
                </div>
                <div v-else-if="fincasFiltradas.length === 0" class="bw-estado">
                    <ion-icon :icon="searchOutline" />
                    <p>No se encontraron fincas.</p>
                </div>
            </template>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonIcon, IonSpinner,
    IonButtons, IonButton, IonSearchbar
} from '@ionic/vue'
import {
    chevronForwardOutline, logOutOutline,
    homeOutline, locationOutline, searchOutline, arrowBackOutline
} from 'ionicons/icons'
import { veterinarioService } from '../../services/veterinario'
import { useAuthStore } from '../../stores/auth'
import { paths } from '../../router/paths'

const router = useRouter()
const auth = useAuthStore()
const fincas = ref([])
const loading = ref(true)
const busqueda = ref('')

const fincasFiltradas = computed(() => {
    const texto = busqueda.value.trim().toLowerCase()
    if (!texto) return fincas.value
    return fincas.value.filter((finca) =>
        (finca.nombre_finca ?? '').toLowerCase().includes(texto) ||
        (finca.ubicacion_finca ?? '').toLowerCase().includes(texto)
    )
})

async function cargarFincas() {
    try {
        const response = await veterinarioService.getFincas()
        fincas.value = response.data
    } finally {
        loading.value = false
    }
}

function verAnimales(idFinca) {
    router.push(paths.veterinario.animales(idFinca))
}

async function handleLogout() {
    await auth.logout()
    router.push(paths.login)
}

onMounted(cargarFincas)
</script>

<style scoped>
.fincas-page {
    --bw-dark: #0f2318;
    --bw-primary: #1D9E75;
    --bw-pale: rgba(29, 158, 117, 0.12);
    --bw-bg: #0f2318;
    --bw-card: rgba(255, 255, 255, 0.05);
    --bw-border: rgba(255, 255, 255, 0.09);
    --bw-text: #ffffff;
    --bw-muted: rgba(255, 255, 255, 0.5);
}

.bw-toolbar {
    --background: var(--bw-dark);
    --color: #ffffff;
    --border-width: 0;
    border-bottom: 2px solid var(--bw-primary);
}
.bw-toolbar ion-title {
    font-family: Georgia, serif;
}
.bw-brand {
    display: flex;
    align-items: center;
    padding-inline-start: 12px;
}
.bw-brand-img {
    width: 28px;
    height: 28px;
    object-fit: contain;
    filter: brightness(0) invert(1);
}

.bw-content {
    --background: var(--bw-bg);
}

.bw-hero {
    position: relative;
}
.bw-banner {
    display: block;
    width: 100%;
    height: auto;
}
.bw-search {
    position: absolute;     /* ← lo pone sobre la imagen */
    top: 10px;              /* ← distancia desde arriba */
    left: 10px;            /* ← lo pega al extremo derecho */
    z-index: 2;
    width: 230px;           /* ← EL LARGO del buscador */
    max-width: 65%;
    padding: 0;
    --background: rgba(15, 35, 24, 0.85);
    --border-radius: 12px;
    --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    --color: var(--bw-text);
    --placeholder-color: var(--bw-muted);
    --icon-color: var(--bw-primary);
}
.bw-search :deep(.searchbar-input) {
    height: 42px;
}

.bw-cards {
    padding: 6px 14px 0;
}
.finca-card {
    --background: var(--bw-card);
    --border-radius: 16px;
    --padding-start: 14px;
    --padding-end: 12px;
    --min-height: 78px;
    margin-bottom: 12px;
    border: 1px solid var(--bw-border);
    border-radius: 16px;
}
.icon-box {
    width: 46px;
    height: 46px;
    border-radius: 13px;
    background: var(--bw-pale);
    border: 1px solid rgba(29, 158, 117, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-inline-end: 14px;
}
.icon-box ion-icon {
    font-size: 24px;
    color: var(--bw-primary);
}
.finca-card h2 {
    font-weight: 600;
    font-size: 1rem;
    color: var(--bw-text);
    margin: 0 0 3px;
}
.ubicacion {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--bw-muted);
    font-size: 0.82rem;
    margin: 0;
}
.ubicacion ion-icon {
    font-size: 15px;
}
.chevron {
    color: var(--bw-muted);
    font-size: 18px;
}

.bw-estado {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    padding: 3rem 1rem;
    color: var(--bw-muted);
}
.bw-estado ion-icon {
    font-size: 34px;
    color: var(--bw-primary);
    opacity: 0.6;
}
</style>