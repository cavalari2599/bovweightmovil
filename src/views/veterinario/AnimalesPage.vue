<template>
    <ion-page class="animales-page">
        <ion-header class="ion-no-border">
            <ion-toolbar class="bw-toolbar">
                <ion-buttons slot="start">
                    <ion-back-button :default-href="paths.veterinario.fincas" text="" />
                </ion-buttons>
                <div slot="start" class="bw-brand">
                    <img src="../../assets/cow-icon.png" alt="BovWeight CR" class="bw-brand-img" />
                </div>
                <ion-title>Animales</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="handleLogout">
                        <ion-icon :icon="logOutOutline" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="bw-content">
            <ion-searchbar
                v-model="busqueda"
                class="bw-search"
                placeholder="Buscar por nombre o número de arete..."
            />

            <div v-if="loading" class="bw-estado">
                <ion-spinner name="crescent" />
                <p>Cargando animales...</p>
            </div>

            <div v-else class="animales-lista">
                <div
                    v-for="animal in animalesFiltrados"
                    :key="animal.n_arete"
                    class="animal-card"
                >
                    <!-- Fila clickeable -->
                    <button class="animal-row" @click="toggleAnimal(animal)">
                        <div class="animal-foto">
                            <img v-if="animal.foto_animal" :src="fotoUrl(animal.foto_animal)" alt="" />
                            <ion-icon v-else :icon="pawOutline" />
                        </div>
                        <div class="animal-info">
                            <span class="animal-arete">{{ animal.n_arete }}</span>
                            <span class="animal-nombre">{{ animal.nombre_animal || 'Sin nombre' }}</span>
                            <span class="animal-meta">Raza: {{ animal.raza || '-' }}</span>
                            <span class="animal-peso">Peso actual: {{ animal.peso }} kg</span>
                        </div>
                        <span
                            class="estado"
                            :class="esActivo(animal) ? 'estado--activo' : 'estado--inactivo'"
                        >
                            {{ animal.estado }}
                        </span>
                        <ion-icon
                            class="animal-chevron"
                            :icon="estaAbierto(animal) ? chevronUpOutline : chevronDownOutline"
                        />
                    </button>

                    <!-- Detalle expandible -->
                    <div v-if="estaAbierto(animal)" class="animal-detalle">
                        <div v-if="loadingPesajes" class="bw-estado">
                            <ion-spinner name="crescent" />
                        </div>

                        <template v-else>
                            <!-- Historial -->
                            <div class="sec">
                                <div class="sec-ico"><ion-icon :icon="documentTextOutline" /></div>
                                <span class="sec-titulo">Historial de pesajes</span>
                                <button class="btn-trat" @click="verTratamientos">Ver tratamientos</button>
                            </div>

                            <p v-if="pesajes.length === 0" class="bw-vacio">No hay pesajes registrados.</p>

                            <template v-else>
                                <div class="timeline">
                                    <div v-for="p in pesajes" :key="p.id_pesaje" class="tl-row">
                                        <span class="tl-dot"></span>
                                        <span class="tl-fecha">{{ formatFecha(p.fecha_pesaje) }}</span>
                                        <span class="tl-peso">{{ p.peso_aproximado }} kg</span>
                                    </div>
                                </div>

                                <!-- Evolución -->
                                <div class="sec">
                                    <div class="sec-ico"><ion-icon :icon="trendingUpOutline" /></div>
                                    <span class="sec-titulo">Evolución del peso</span>
                                </div>
                                <div class="grafico-container">
                                    <canvas :ref="setChartRef" />
                                </div>
                            </template>
                        </template>
                    </div>
                </div>

                <p v-if="animales.length === 0" class="bw-vacio">No hay animales en esta finca.</p>
                <p v-else-if="animalesFiltrados.length === 0" class="bw-vacio">No se encontraron animales.</p>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonIcon, IonSpinner, IonButtons, IonBackButton, IonButton, IonSearchbar
} from '@ionic/vue'
import {
    chevronUpOutline, chevronDownOutline, documentTextOutline,
    trendingUpOutline, pawOutline, logOutOutline
} from 'ionicons/icons'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js'
import { veterinarioService } from '../../services/veterinario'
import { fotoUrl } from '../../services/media'
import { useAuthStore } from '../../stores/auth'
import { paths } from '../../router/paths'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler)

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const animales = ref([])
const loading = ref(true)
const busqueda = ref('')
const animalSeleccionado = ref(null)
const pesajes = ref([])
const loadingPesajes = ref(false)
const chartRef = ref(null)
let chartInstance = null

// Filtro por nombre o arete (en cliente, sin backend)
const animalesFiltrados = computed(() => {
    const texto = busqueda.value.trim().toLowerCase()
    if (!texto) return animales.value
    return animales.value.filter((a) =>
        (a.n_arete ?? '').toLowerCase().includes(texto) ||
        (a.nombre_animal ?? '').toLowerCase().includes(texto)
    )
})

function esActivo(animal) {
    return (animal.estado ?? '').toLowerCase() === 'activo'
}

function estaAbierto(animal) {
    return animalSeleccionado.value?.n_arete === animal.n_arete
}

function setChartRef(el) {
    chartRef.value = el
}

async function cargarAnimales() {
    try {
        const response = await veterinarioService.getAnimales(route.params.idFinca)
        animales.value = response.data
    } finally {
        loading.value = false
    }
}

watch(chartRef, (val) => {
    if (val && pesajes.value.length > 0) {
        renderGrafico()
    }
})

// Acordeón: si toco el que ya está abierto, lo cierro; si no, lo abro
function toggleAnimal(animal) {
    if (estaAbierto(animal)) {
        animalSeleccionado.value = null
        pesajes.value = []
        if (chartInstance) {
            chartInstance.destroy()
            chartInstance = null
        }
        return
    }
    seleccionarAnimal(animal)
}

async function seleccionarAnimal(animal) {
    animalSeleccionado.value = animal
    loadingPesajes.value = true
    pesajes.value = []

    if (chartInstance) {
        chartInstance.destroy()
        chartInstance = null
    }

    try {
        const response = await veterinarioService.getPesajes(animal.n_arete)
        pesajes.value = response.data.sort((a, b) => new Date(a.fecha_pesaje) - new Date(b.fecha_pesaje))
    } finally {
        loadingPesajes.value = false
    }
}

function renderGrafico() {
    if (!chartRef.value) return

    if (chartInstance) {
        chartInstance.destroy()
    }

    const labels = pesajes.value.map(p => formatFecha(p.fecha_pesaje))
    const data = pesajes.value.map(p => p.peso_aproximado)

    chartInstance = new Chart(chartRef.value, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Peso (kg)',
                data,
                borderColor: '#2d6a4f',
                backgroundColor: 'rgba(45, 106, 79, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#2d6a4f',
                pointRadius: 5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: { enabled: true },
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: { display: true, text: 'kg' }
                }
            }
        }
    })
}

function verTratamientos() {
    router.push(`${paths.veterinario.tratamientos(animalSeleccionado.value.n_arete)}?idFinca=${route.params.idFinca}`)
}

function formatFecha(fecha) {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleDateString('es-CR')
}

async function handleLogout() {
    await auth.logout()
    router.push(paths.login)
}

onMounted(cargarAnimales)
</script>

<style scoped>
.animales-page {
    --bw-dark: #1d6045;
    --bw-primary: #2d6a4f;
    --bw-pale: #e7f3ec;
    --bw-bg: #f3f7f4;
    --bw-border: #e7ede9;
    --bw-text: #2b3a32;
    --bw-muted: #6f8077;
    --bw-red: #c0392b;
    --bw-red-pale: #fdecea;
}

/* ── Header (igual a Fincas) ── */
.bw-toolbar {
    --background: var(--bw-dark);
    --color: #ffffff;
}
.bw-brand {
    display: flex;
    align-items: center;
    padding-inline-start: 2px;
}
.bw-brand-img {
    width: 26px;
    height: 26px;
    object-fit: contain;
    filter: brightness(0) invert(1);
}

/* ── Contenido ── */
.bw-content {
    --background: var(--bw-bg);
    /* Fondo inferior opcional:
       --background: var(--bw-bg) url('../../assets/TU-FONDO.png') bottom / 100% auto no-repeat; */
}
.bw-search {
    --background: #ffffff;
    --border-radius: 12px;
    --box-shadow: none;
    --color: var(--bw-text);
    --placeholder-color: var(--bw-muted);
    --icon-color: var(--bw-muted);
    padding: 12px 14px 6px;
}
.bw-search :deep(.searchbar-input) {
    height: 42px;
}

/* ── Lista de animales ── */
.animales-lista {
    padding: 4px 14px 96px;   /* el padding-bottom evita que la barra de navegación tape la última fila */
}
.animal-card {
    background: #ffffff;
    border: 1px solid var(--bw-border);
    border-radius: 16px;
    margin-bottom: 12px;
    overflow: hidden;
}
.animal-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px;
    background: none;
    border: none;
    text-align: left;
    font-family: inherit;
    cursor: pointer;
}
.animal-foto {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    background: var(--bw-pale);
    display: flex;
    align-items: center;
    justify-content: center;
}
.animal-foto img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.animal-foto ion-icon {
    font-size: 22px;
    color: var(--bw-primary);
}
.animal-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}
.animal-arete {
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--bw-text);
}
.animal-nombre {
    font-size: 0.85rem;
    font-weight: 400;
    color: var(--bw-muted);
}
.animal-meta {
    font-size: 0.78rem;
    color: var(--bw-muted);
}
.animal-peso {
    font-size: 0.82rem;
    font-weight: 550;
    color: var(--bw-primary);   /* el verde de la app (#2d6a4f) */
    margin-top: 3px;
}
.estado {
    font-size: 0.72rem;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
    white-space: nowrap;
    text-transform: capitalize;
}
.estado--activo {
    background: var(--bw-pale);
    color: var(--bw-dark);
}
.estado--inactivo {
    background: var(--bw-red-pale);
    color: var(--bw-red);
}
.animal-chevron {
    font-size: 18px;
    color: var(--bw-muted);
    flex-shrink: 0;
}

/* ── Detalle expandible ── */
.animal-detalle {
    padding: 2px 14px 14px;
    border-top: 1px solid var(--bw-border);
}
.sec {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 14px 0 10px;
}
.sec-ico {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: var(--bw-pale);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.sec-ico ion-icon {
    font-size: 18px;
    color: var(--bw-primary);
}
.sec-titulo {
    flex: 1;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--bw-text);
}
.btn-trat {
    border: 1px solid var(--bw-primary);
    color: #ffffff;
    background: #40916c;
    border-radius: 9px;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 5px 10px;
    font-family: inherit;
    white-space: nowrap;
    cursor: pointer;
}

/* ── Timeline de pesajes ── */
.timeline {
    position: relative;
    padding: 2px 0 2px 2px;
}
.timeline::before {
    content: '';
    position: absolute;
    left: 7px;
    top: 12px;
    bottom: 12px;
    width: 2px;
    background: var(--bw-pale);
}
.tl-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 5px 0;
    position: relative;
}
.tl-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--bw-primary);
    border: 2px solid #ffffff;
    z-index: 1;
    flex-shrink: 0;
}
.tl-fecha {
    flex: 1;
    font-size: 0.8rem;
    color: var(--bw-muted);
}

.tl-peso {
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--bw-text);
}

/* ── Gráfico ── */
.grafico-container {
    position: relative;
    height: 220px;
    margin-top: 4px;
}

/* ── Estados ── */
.bw-estado {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    padding: 2rem 1rem;
    color: var(--bw-muted);
}
.bw-vacio {
    text-align: center;
    color: var(--bw-muted);
    font-size: 0.85rem;
    padding: 1rem;
}
</style>