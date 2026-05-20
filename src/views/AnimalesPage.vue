<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="success">
                <ion-buttons slot="start">
                    <ion-back-button default-href="/fincas" />
                </ion-buttons>
                <ion-title>Animales</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div v-if="loading" class="ion-text-center ion-padding">
                <ion-spinner />
            </div>

            <div v-else>
                <ion-list>
                    <ion-item
                        v-for="animal in animales"
                        :key="animal.n_arete"
                        button
                        @click="seleccionarAnimal(animal)"
                    >
                        <ion-label>
                            <h2>{{ animal.nombre_animal || 'Sin nombre' }}</h2>
                            <p>Arete: {{ animal.n_arete }} | Raza: {{ animal.raza || '-' }}</p>
                            <p>Peso: {{ animal.peso }} kg | Estado: {{ animal.estado }}</p>
                        </ion-label>
                        <ion-icon :icon="chevronForwardOutline" slot="end" />
                    </ion-item>

                    <ion-item v-if="animales.length === 0">
                        <ion-label class="ion-text-center">
                            No hay animales en esta finca.
                        </ion-label>
                    </ion-item>
                </ion-list>

                <!-- Detalle del animal seleccionado -->
                <div v-if="animalSeleccionado" class="detalle">
                    <div class="detalle-header">
                        <h3>{{ animalSeleccionado.nombre_animal || 'Sin nombre' }}</h3>
                        <ion-button size="small" fill="outline" color="success" @click="verTratamientos">
                            Ver Tratamientos
                        </ion-button>
                    </div>

                    <div v-if="loadingPesajes" class="ion-text-center ion-padding">
                        <ion-spinner />
                    </div>

                    <div v-else>
                        <div v-if="pesajes.length === 0" class="ion-text-center ion-padding">
                            <p>No hay pesajes registrados.</p>
                        </div>

                        <div v-else>
                            <!-- Lista de pesajes -->
                            <h4 class="seccion-titulo">Historial de Pesajes</h4>
                            <ion-list>
                                <ion-item v-for="p in pesajes" :key="p.id_pesaje">
                                    <ion-label>
                                        <h3>{{ p.peso_aproximado }} kg</h3>
                                        <p>{{ formatFecha(p.fecha_pesaje) }}</p>
                                    </ion-label>
                                </ion-item>
                            </ion-list>

                            <!-- Gráfico -->
                            <h4 class="seccion-titulo">Evolución del Peso</h4>
                            <div class="grafico-container">
                                <canvas ref="chartRef" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonIcon, IonSpinner,
    IonButtons, IonBackButton, IonButton
} from '@ionic/vue'
import { chevronForwardOutline } from 'ionicons/icons'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js'
import { veterinarioService } from '../services/veterinario'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler)

const router = useRouter()
const route = useRoute()
const animales = ref([])
const loading = ref(true)
const animalSeleccionado = ref(null)
const pesajes = ref([])
const loadingPesajes = ref(false)
const chartRef = ref(null)
let chartInstance = null

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
    router.push(`/animales/${animalSeleccionado.value.n_arete}/tratamientos?idFinca=${route.params.idFinca}`)
}

function formatFecha(fecha) {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleDateString('es-CR')
}

onMounted(cargarAnimales)
</script>

<style scoped>
.detalle {
    padding: 1rem;
    margin-top: 1rem;
    background: white;
    border-radius: 12px;
    margin: 1rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.detalle-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.detalle-header h3 {
    margin: 0;
    color: #2d6a4f;
}

.seccion-titulo {
    color: #555;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 1rem 0 0.5rem;
}

.grafico-container {
    padding: 1rem 0;
}
</style>