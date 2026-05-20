<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="success">
                <ion-buttons slot="start">
                    <ion-back-button :default-href="`/ganadero/fincas/${idFinca}/animales`" />
                </ion-buttons>
                <ion-title>{{ animal?.nombre_animal || 'Animal' }}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div v-if="loading" class="ion-text-center ion-padding">
                <ion-spinner />
            </div>

            <div v-else>
                <!-- Info animal -->
                <div class="info-card">
                    <h3>{{ animal?.nombre_animal || 'Sin nombre' }}</h3>
                    <p>Arete: {{ animal?.n_arete }}</p>
                    <p>Raza: {{ animal?.raza || '-' }}</p>
                    <p>Peso actual: {{ animal?.peso }} kg</p>
                    <p>Estado: {{ animal?.estado }}</p>
                </div>

                <!-- Tabs -->
                <ion-segment v-model="tab">
                    <ion-segment-button value="pesajes">Pesajes</ion-segment-button>
                    <ion-segment-button value="tratamientos">Tratamientos</ion-segment-button>
                </ion-segment>

                <!-- Pesajes -->
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

                <!-- Tratamientos -->
                <div v-if="tab === 'tratamientos'">
                    <ion-list>
                        <ion-item v-for="t in tratamientos" :key="t.id_tratamiento">
                            <ion-label>
                                <h3>{{ t.tipo_tratamiento }}</h3>
                                <p>Medicamento: {{ t.medicamento || '-' }}</p>
                                <p>Inicio: {{ t.fecha_inicio }} | Fin: {{ t.fecha_fin || 'En curso' }}</p>
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
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonSpinner,
    IonButtons, IonBackButton, IonSegment, IonSegmentButton
} from '@ionic/vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js'
import { ganaderoService } from '../services/ganadero'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler)

const route = useRoute()
const nArete = route.params.nArete
const idFinca = route.query.idFinca

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
            ganaderoService.getAnimal(nArete),
            ganaderoService.getPesajes(nArete),
            ganaderoService.getTratamientos(nArete),
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
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: false } }
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
.info-card {
    background: white;
    margin: 1rem;
    padding: 1rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.info-card h3 {
    color: #2d6a4f;
    margin: 0 0 0.5rem;
}

.info-card p {
    margin: 0.25rem 0;
    color: #555;
    font-size: 0.9rem;
}

.grafico-container {
    padding: 1rem;
}

.seccion-titulo {
    color: #555;
    font-size: 0.9rem;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
}
</style>