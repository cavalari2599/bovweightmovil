<template>
    <ion-page>
        <ion-content :scroll-y="true">
            <div class="page-container">

                <div class="page-header">
                    <button class="back-btn" @click="router.back()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div class="header-title-wrap">
                        <div class="header-title">Animales</div>
                        <div class="header-sub">{{ animalesFiltrados.length }} animal{{ animalesFiltrados.length !== 1 ? 'es' : '' }}</div>
                    </div>
                    <div class="header-actions">
                        <button class="icon-btn icon-btn-label" @click="exportarExcel" :disabled="animales.length === 0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            <span>Excel</span>
                        </button>
                        <button class="icon-btn" @click="handleLogout">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        </button>
                    </div>
                </div>

                <div v-if="resumen" class="resumen-strip">
                    <div class="resumen-item">
                        <div class="resumen-num">{{ resumen.total_animales }}</div>
                        <div class="resumen-label">Animales</div>
                    </div>
                    <div class="resumen-divider"></div>
                    <div class="resumen-item">
                        <div class="resumen-num">{{ resumen.peso_promedio }}</div>
                        <div class="resumen-label">Peso prom. (kg)</div>
                    </div>
                    <div class="resumen-divider"></div>
                    <div class="resumen-item">
                        <div class="resumen-num">{{ resumen.peso_maximo }}</div>
                        <div class="resumen-label">Peso máx. (kg)</div>
                    </div>
                </div>

                <div class="search-wrap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input v-model="busqueda" type="text" placeholder="Buscar por nombre o arete..." />
                    <button v-if="busqueda" class="clear-search" @click="busqueda = ''">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <div class="filtros-wrap">
                    <div class="filtro-group">
                        <span class="filtro-static">Solo activos</span>
                    </div>
                    <div class="orden-select-wrap">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="10" y2="18"/></svg>
                        <select v-model="ordenar" class="orden-select">
                            <option value="peso">Por peso</option>
                            <option value="nombre">Por nombre</option>
                        </select>
                    </div>
                </div>

                <div v-if="loading" class="loading-wrap">
                    <ion-spinner color="success" />
                </div>

                <div v-else class="animals-list">

                    <div v-if="animalesFiltrados.length === 0" class="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        <p>No hay animales en esta vista.</p>
                    </div>

                    <div
                        v-for="(animal, i) in animalesFiltrados"
                        :key="animal.n_arete"
                        class="animal-card"
                        :class="{ open: estaAbierto(animal) }"
                        :style="{ animationDelay: `${i * 50}ms` }"
                    >
                        <div class="animal-card-head" @click="toggleAnimal(animal)">
                            <div class="animal-avatar">
                                <img v-if="animal.foto_animal" :src="fotoUrl(animal.foto_animal)" alt="foto" />
                                <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                            </div>

                            <div class="animal-info">
                                <div class="animal-top">
                                    <div class="animal-nombre">{{ animal.nombre_animal || 'Sin nombre' }}</div>
                                    <div class="estado-badge" :class="estadoClass(animal.estado)">{{ animal.estado }}</div>
                                </div>
                                <div class="animal-meta">
                                    <span>{{ animal.n_arete }}</span>
                                    <span class="dot">·</span>
                                    <span>{{ animal.raza || 'Sin raza' }}</span>
                                </div>
                                <div class="animal-peso">{{ animal.peso }} kg</div>
                            </div>

                            <svg class="chevron" :class="{ rot: estaAbierto(animal) }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </div>

                        <!-- Detalle expandible: historial + evolución -->
                        <div v-if="estaAbierto(animal)" class="animal-detalle" @click.stop>
                            <div v-if="loadingPesajes" class="loading-wrap">
                                <ion-spinner color="success" />
                            </div>

                            <template v-else>
                                <div class="sec">
                                    <div class="sec-ico">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
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

                                    <div class="sec">
                                        <div class="sec-ico">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                                        </div>
                                        <span class="sec-titulo">Evolución del peso</span>
                                    </div>
                                    <div class="grafico-container">
                                        <canvas :ref="setChartRef" />
                                    </div>
                                </template>
                            </template>
                        </div>
                    </div>

                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { IonPage, IonContent, IonSpinner } from '@ionic/vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js'
import { veterinarioService } from '../../services/veterinario'
import { fotoUrl } from '../../services/media'
import { exportarAnimales } from '../../services/export'
import { useAuthStore } from '../../stores/auth'
import { paths } from '../../router/paths'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler)

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const idFinca = route.params.idFinca

const animales = ref([])
const loading = ref(true)
const busqueda = ref('')
const ordenar = ref('peso')

const animalSeleccionado = ref(null)
const pesajes = ref([])
const loadingPesajes = ref(false)
const chartRef = ref(null)
let chartInstance = null

const resumen = computed(() => {
    const list = animales.value.filter(a => a.estado === 'Activo')
    if (!list.length) return null
    const pesos = list.map(a => Number(a.peso)).filter(n => n > 0)
    const prom = pesos.length ? pesos.reduce((s, n) => s + n, 0) / pesos.length : 0
    const max = pesos.length ? Math.max(...pesos) : 0
    return {
        total_animales: list.length,
        peso_promedio: prom.toFixed(2),
        peso_maximo: max.toFixed(2),
    }
})

function ordenarLista(lista) {
    const arr = [...lista]
    if (ordenar.value === 'peso') arr.sort((a, b) => (Number(b.peso) || 0) - (Number(a.peso) || 0))
    else if (ordenar.value === 'nombre') arr.sort((a, b) => (a.nombre_animal || '').localeCompare(b.nombre_animal || ''))
    return arr
}

const animalesFiltrados = computed(() => {
    // Veterinario: solo animales activos por finca
    let lista = animales.value.filter(a => a.estado === 'Activo')
    const q = busqueda.value.trim().toLowerCase()
    if (q) lista = lista.filter(a =>
        (a.nombre_animal || '').toLowerCase().includes(q) ||
        String(a.n_arete || '').toLowerCase().includes(q)
    )
    return ordenarLista(lista)
})

function estadoClass(estado) {
    if (estado === 'Activo') return 'estado-activo'
    if (estado === 'Vendido') return 'estado-vendido'
    return 'estado-muerto'
}

function estaAbierto(animal) {
    return animalSeleccionado.value?.n_arete === animal.n_arete
}

function setChartRef(el) {
    chartRef.value = el
}

async function cargarAnimales() {
    loading.value = true
    try {
        const response = await veterinarioService.getAnimales(idFinca)
        animales.value = response.data
    } finally {
        loading.value = false
    }
}

watch(chartRef, (val) => {
    if (val && pesajes.value.length > 0) renderGrafico()
})

// Acordeón: tocar el abierto lo cierra; si no, lo abre y carga sus pesajes
function toggleAnimal(animal) {
    if (estaAbierto(animal)) {
        animalSeleccionado.value = null
        pesajes.value = []
        if (chartInstance) { chartInstance.destroy(); chartInstance = null }
        return
    }
    seleccionarAnimal(animal)
}

async function seleccionarAnimal(animal) {
    animalSeleccionado.value = animal
    loadingPesajes.value = true
    pesajes.value = []
    if (chartInstance) { chartInstance.destroy(); chartInstance = null }
    try {
        const response = await veterinarioService.getPesajes(animal.n_arete)
        pesajes.value = response.data.sort((a, b) => new Date(a.fecha_pesaje) - new Date(b.fecha_pesaje))
    } finally {
        loadingPesajes.value = false
    }
}

function renderGrafico() {
    if (!chartRef.value) return
    if (chartInstance) chartInstance.destroy()

    const labels = pesajes.value.map(p => formatFecha(p.fecha_pesaje))
    const data = pesajes.value.map(p => p.peso_aproximado)

    chartInstance = new Chart(chartRef.value, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Peso (kg)',
                data,
                borderColor: '#1D9E75',
                backgroundColor: 'rgba(29, 158, 117, 0.15)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#24c290',
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
                x: {
                    ticks: { color: 'rgba(255,255,255,0.5)' },
                    grid: { color: 'rgba(255,255,255,0.08)' }
                },
                y: {
                    beginAtZero: false,
                    title: { display: true, text: 'kg', color: 'rgba(255,255,255,0.6)' },
                    ticks: { color: 'rgba(255,255,255,0.5)' },
                    grid: { color: 'rgba(255,255,255,0.08)' }
                }
            }
        }
    })
}

function verTratamientos() {
    router.push(`${paths.veterinario.tratamientos(animalSeleccionado.value.n_arete)}?idFinca=${idFinca}`)
}

function exportarExcel() {
    if (animales.value.length === 0) return
    exportarAnimales(animales.value, `finca_${idFinca}`)
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
ion-content { --background: #0f2318; }

.page-container {
    min-height: 100%;
    background: #0f2318;
    padding-bottom: 6rem;
}

/* HEADER */
.page-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.2rem;
    border-bottom: 1px solid rgba(29,158,117,0.15);
}

.back-btn {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 9px;
    color: rgba(255,255,255,0.7);
    padding: 0.45rem;
    display: flex;
    align-items: center;
    cursor: pointer;
    flex-shrink: 0;
}
.back-btn:active { background: rgba(255,255,255,0.12); }

.header-title-wrap { flex: 1; }
.header-title { color: #ffffff; font-weight: 700; font-size: 1rem; font-family: Georgia, serif; }
.header-sub { color: rgba(255,255,255,0.35); font-size: 0.72rem; margin-top: 1px; }

.header-actions { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }

.icon-btn {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 9px;
    color: rgba(255,255,255,0.6);
    padding: 0.45rem;
    display: flex;
    align-items: center;
    cursor: pointer;
}
.icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.icon-btn-label {
    padding: 0.45rem 0.75rem;
    gap: 0.3rem;
    font-size: 0.78rem;
    font-weight: 600;
    color: rgba(255,255,255,0.7);
}

/* RESUMEN */
.resumen-strip {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 1rem 1.2rem;
    background: rgba(29,158,117,0.08);
    border-bottom: 1px solid rgba(29,158,117,0.12);
}
.resumen-item { text-align: center; }
.resumen-num { color: #1D9E75; font-weight: 700; font-size: 1.4rem; line-height: 1; }
.resumen-label { color: rgba(255,255,255,0.4); font-size: 0.7rem; margin-top: 0.2rem; }
.resumen-divider { width: 1px; height: 32px; background: rgba(255,255,255,0.08); }

.search-wrap {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin: 1rem 1rem 0;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 0.65rem 0.9rem;
    color: rgba(255,255,255,0.4);
}
.search-wrap input {
    flex: 1;
    background: none;
    border: none;
    color: #ffffff;
    font-size: 0.9rem;
    outline: none;
}
.search-wrap input::placeholder { color: rgba(255,255,255,0.25); }

.clear-search {
    background: none;
    border: none;
    color: rgba(255,255,255,0.4);
    padding: 0;
    display: flex;
    align-items: center;
    cursor: pointer;
}

.filtros-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    gap: 0.75rem;
}
.filtro-group { display: flex; gap: 0.4rem; }
.filtro-static {
    background: rgba(29,158,117,0.2);
    border: 1px solid rgba(29,158,117,0.4);
    border-radius: 20px;
    color: #1D9E75;
    padding: 0.3rem 0.75rem;
    font-size: 0.78rem;
    font-weight: 700;
}

.orden-select-wrap {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: rgba(255,255,255,0.35);
}
.orden-select {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: rgba(255,255,255,0.6);
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    outline: none;
}

.loading-wrap { display: flex; justify-content: center; padding: 2rem; }

.animals-list {
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 3rem 1rem;
    color: rgba(255,255,255,0.3);
    text-align: center;
}
.empty-state p { font-size: 0.9rem; margin: 0; }

.animal-card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 14px;
    backdrop-filter: blur(8px);
    animation: slideIn 0.35s ease both;
    transition: background 0.15s;
    overflow: hidden;
}
.animal-card.open { background: rgba(255,255,255,0.07); }

.animal-card-head {
    padding: 0.9rem;
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
    cursor: pointer;
}
.animal-card-head:active { background: rgba(255,255,255,0.04); }

@keyframes slideIn {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
}

.animal-avatar {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(29,158,117,0.12);
    border: 1px solid rgba(29,158,117,0.2);
    color: #1D9E75;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
}
.animal-avatar img { width: 100%; height: 100%; object-fit: cover; }

.animal-info { flex: 1; min-width: 0; }

.animal-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.2rem;
}
.animal-nombre {
    color: #ffffff;
    font-weight: 600;
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.estado-badge {
    font-size: 0.68rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    border-radius: 20px;
    flex-shrink: 0;
}
.estado-activo  { background: rgba(29,158,117,0.2); color: #1D9E75; }
.estado-vendido { background: rgba(230,180,34,0.2); color: #e6b422; }
.estado-muerto  { background: rgba(150,150,150,0.2); color: #aaa; }

.animal-meta {
    color: rgba(255,255,255,0.38);
    font-size: 0.77rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 0.25rem;
}
.dot { opacity: 0.4; }

.animal-peso {
    color: #1D9E75;
    font-weight: 700;
    font-size: 0.95rem;
}

.chevron {
    color: rgba(255,255,255,0.25);
    flex-shrink: 0;
    margin-top: 0.3rem;
    transition: transform 0.2s;
}
.chevron.rot { transform: rotate(90deg); }

/* DETALLE EXPANDIBLE */
.animal-detalle {
    padding: 0.2rem 0.9rem 0.9rem;
    border-top: 1px solid rgba(255,255,255,0.07);
}
.sec {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin: 0.9rem 0 0.6rem;
}
.sec-ico {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: rgba(29,158,117,0.12);
    border: 1px solid rgba(29,158,117,0.2);
    color: #1D9E75;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.sec-titulo {
    flex: 1;
    font-size: 0.82rem;
    font-weight: 600;
    color: rgba(255,255,255,0.85);
}
.btn-trat {
    border: 1px solid rgba(29,158,117,0.4);
    color: #ffffff;
    background: #1D9E75;
    border-radius: 9px;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 5px 10px;
    white-space: nowrap;
    cursor: pointer;
}
.btn-trat:active { background: #167a5a; }

.bw-vacio {
    text-align: center;
    color: rgba(255,255,255,0.4);
    font-size: 0.83rem;
    padding: 0.8rem;
}

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
    background: rgba(29,158,117,0.25);
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
    background: #1D9E75;
    border: 2px solid #0f2318;
    z-index: 1;
    flex-shrink: 0;
}
.tl-fecha {
    flex: 1;
    font-size: 0.8rem;
    color: rgba(255,255,255,0.5);
}
.tl-peso {
    font-weight: 600;
    font-size: 0.85rem;
    color: #ffffff;
}

.grafico-container {
    position: relative;
    height: 220px;
    margin-top: 4px;
}
</style>
