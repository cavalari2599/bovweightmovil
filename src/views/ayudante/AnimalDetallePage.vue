<template>
    <ion-page>
        <ion-header class="ion-no-border">
            <ion-toolbar class="bw-toolbar">
                <ion-buttons slot="start">
                    <ion-back-button :default-href="paths.ayudante.animales" />
                </ion-buttons>
                <ion-title>{{ animal?.nombre_animal || 'Animal' }}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="bw-content">
            <div v-if="loading" class="ion-text-center ion-padding">
                <ion-spinner />
            </div>

            <div v-else>
                <div class="info-card">
                    <img
                        v-if="animal?.foto_animal"
                        :src="fotoUrl(animal.foto_animal)"
                        alt="foto del animal"
                        class="foto-animal"
                    />
                    <h3>{{ animal?.nombre_animal || 'Sin nombre' }}</h3>
                    <p>Arete: {{ animal?.n_arete }}</p>
                    <p>Raza: {{ animal?.raza || '-' }}</p>
                    <p>Sexo: {{ animal?.sexo === 'M' ? 'Macho' : animal?.sexo === 'F' ? 'Hembra' : '-' }}</p>
                    <p>Edad: {{ animal?.edad != null ? animal.edad + ' años' : '-' }}</p>
                    <p>Peso actual: {{ animal?.peso ?? '-' }} kg</p>
                    <p>Estado: {{ animal?.estado }}</p>
                </div>

                <ion-segment v-model="tab">
                    <ion-segment-button value="pesajes">Pesajes</ion-segment-button>
                    <ion-segment-button value="tratamientos">Tratamientos</ion-segment-button>
                </ion-segment>

                <div v-if="tab === 'pesajes'">
                    <ion-list>
                        <ion-item v-for="p in pesajes" :key="p.id_pesaje">
                            <ion-label>
                                <h3>{{ p.peso_aproximado }} kg</h3>
                                <p>{{ formatFecha(p.fecha_pesaje) }}</p>
                            </ion-label>
                        </ion-item>
                        <ion-item v-if="pesajes.length === 0">
                            <ion-label class="ion-text-center">No hay pesajes registrados.</ion-label>
                        </ion-item>
                    </ion-list>

                    <div v-if="pesajes.length > 0" class="grafico-container">
                        <h4 class="seccion-titulo">Evolución del Peso</h4>
                        <canvas ref="chartRef" />
                    </div>
                </div>

                <div v-if="tab === 'tratamientos'">
                    <ion-list>
                        <ion-item v-for="t in tratamientos" :key="t.id_tratamiento">
                            <ion-label class="ion-text-wrap">
                                <h3>{{ t.tipo_tratamiento }}</h3>
                                <p>Medicamento: {{ t.medicamento || '-' }}</p>
                                <p v-if="t.descripcion">Descripción: {{ t.descripcion }}</p>
                                <p>Inicio: {{ formatFecha(t.fecha_inicio) }} | Fin: {{ t.fecha_fin ? formatFecha(t.fecha_fin) : 'En curso' }}</p>
                                <p v-if="t.usuario">Veterinario: {{ t.usuario.nombre_usuario }} {{ t.usuario.apellido1_usuario }}</p>
                            </ion-label>
                        </ion-item>
                        <ion-item v-if="tratamientos.length === 0">
                            <ion-label class="ion-text-center">No hay tratamientos registrados.</ion-label>
                        </ion-item>
                    </ion-list>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonSpinner,
    IonSegment, IonSegmentButton
} from '@ionic/vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js'
import { ayudanteService } from '../../services/ayudante'
import { fotoUrl } from '../../services/media'
import { paths } from '../../router/paths'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler)

const route = useRoute()
const nArete = route.params.nArete

const animal = ref(null)
const pesajes = ref([])
const tratamientos = ref([])
const loading = ref(true)
const tab = ref('pesajes')
const chartRef = ref(null)
let chartInstance = null

async function cargarDatos() {
    try {
        const [animalRes, pesajesRes, tratamientosRes] = await Promise.all([
            ayudanteService.getAnimal(nArete),
            ayudanteService.getPesajes(nArete),
            ayudanteService.getTratamientos(nArete),
        ])
        animal.value = animalRes.data
        pesajes.value = pesajesRes.data.sort((a, b) => new Date(a.fecha_pesaje) - new Date(b.fecha_pesaje))
        tratamientos.value = tratamientosRes.data
    } finally {
        loading.value = false
    }
}

watch(chartRef, (val) => {
    if (val && pesajes.value.length > 0) renderGrafico()
})

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
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    ticks: { color: 'rgba(255,255,255,0.5)' },
                    grid: { color: 'rgba(255,255,255,0.08)' }
                },
                y: {
                    beginAtZero: false,
                    ticks: { color: 'rgba(255,255,255,0.5)' },
                    grid: { color: 'rgba(255,255,255,0.08)' }
                }
            }
        }
    })
}

function formatFecha(fecha) {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleDateString('es-CR')
}

onMounted(cargarDatos)
</script>

<style scoped>
.bw-toolbar {
    --background: #0f2318;
    --color: #ffffff;
    --border-width: 0;
    border-bottom: 2px solid #1D9E75;
}
.bw-toolbar ion-title {
    font-family: Georgia, serif;
}
.bw-content {
    --background: #0f2318;
}

.info-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.09);
    margin: 1rem;
    padding: 1rem;
    border-radius: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.foto-animal {
    display: block;
    width: 100%;
    max-width: 360px;
    max-height: 280px;
    object-fit: contain;
    border-radius: 10px;
    margin: 0 auto 0.75rem;
    background: rgba(0, 0, 0, 0.25);
}

.info-card h3 {
    color: #ffffff;
    font-family: Georgia, serif;
    margin: 0 0 0.5rem;
}

.info-card p {
    margin: 0.25rem 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
}

.grafico-container {
    position: relative;
    height: 260px;
    padding: 1rem 0;
}

.seccion-titulo {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
    padding: 0 1rem;
}

/* Segmento de tabs */
ion-segment {
    --background: rgba(255, 255, 255, 0.05);
    margin: 0 1rem;
    border-radius: 12px;
}
ion-segment-button {
    --color: rgba(255, 255, 255, 0.5);
    --color-checked: #ffffff;
    --indicator-color: #1D9E75;
    --border-radius: 10px;
}

/* Listas oscuras */
ion-list {
    background: transparent;
    padding: 0 1rem;
}
ion-item {
    --background: rgba(255, 255, 255, 0.05);
    --color: #ffffff;
    --border-color: rgba(255, 255, 255, 0.09);
    --border-radius: 12px;
    margin: 0.5rem 0;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 12px;
}
ion-item h3 {
    color: #ffffff;
    font-weight: 600;
}
ion-item p {
    color: rgba(255, 255, 255, 0.5);
}
ion-spinner {
    --color: #1D9E75;
}
</style>
