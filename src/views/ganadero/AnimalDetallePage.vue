<template>
    <ion-page>
        <ganadero-header :title="animal?.nombre_animal || 'Animal'" :back-href="paths.ganadero.animales(idFinca)" />

        <ion-content>
            <div v-if="loading" class="ion-text-center ion-padding">
                <ion-spinner />
            </div>

            <div v-else>
                <!-- Info animal -->
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
                    <p>Edad: {{ animal?.edad != null ? animal.edad + ' años' : '-' }}</p>
                    <p>Peso actual: {{ animal?.peso }} kg</p>
                    <p>Estado: {{ animal?.estado }}</p>
                    <p v-if="animal?.proximo_pesaje" class="proximo">
                        <ion-icon :icon="calendarOutline" /> Próximo pesaje: {{ formatFecha(animal.proximo_pesaje) }}
                        <span v-if="animal.repetir_cada_dias"> · repite c/{{ animal.repetir_cada_dias }} días</span>
                    </p>
                    <ion-button size="small" fill="outline" color="success" class="btn-programar" @click="abrirProgramar">
                        <ion-icon :icon="calendarOutline" slot="start" />
                        {{ animal?.proximo_pesaje ? 'Reprogramar pesaje' : 'Programar pesaje' }}
                    </ion-button>
                </div>

                <!-- Modal programar -->
                <ion-modal :is-open="modalProgramar" @did-dismiss="modalProgramar = false">
                    <ion-header>
                        <ion-toolbar color="success">
                            <ion-title>Programar pesaje</ion-title>
                            <ion-buttons slot="end">
                                <ion-button @click="modalProgramar = false">Cerrar</ion-button>
                            </ion-buttons>
                        </ion-toolbar>
                    </ion-header>
                    <ion-content class="ion-padding">
                        <p class="modal-label">Fecha del próximo pesaje</p>
                        <ion-datetime
                            presentation="date"
                            v-model="formFecha"
                            :min="hoy"
                            :prefer-wheel="false"
                        />

                        <ion-item>
                            <ion-label>Repetir</ion-label>
                            <ion-select v-model="formRepetir" interface="action-sheet" placeholder="Ninguno">
                                <ion-select-option :value="null">Ninguno</ion-select-option>
                                <ion-select-option :value="7">Semanal</ion-select-option>
                                <ion-select-option :value="15">Quincenal</ion-select-option>
                                <ion-select-option :value="30">Mensual</ion-select-option>
                                <ion-select-option :value="60">Cada 2 meses</ion-select-option>
                                <ion-select-option :value="90">Cada 3 meses</ion-select-option>
                            </ion-select>
                        </ion-item>

                        <ion-button expand="block" class="ion-margin-top" style="--background: #2d6a4f"
                            :disabled="!formFecha || guardando" @click="guardarPrograma">
                            {{ guardando ? 'Guardando...' : 'Guardar' }}
                        </ion-button>
                        <ion-button v-if="animal?.proximo_pesaje" expand="block" fill="clear" color="medium"
                            :disabled="guardando" @click="quitarPrograma">
                            Quitar recordatorio
                        </ion-button>
                    </ion-content>
                </ion-modal>

                <!-- Tabs -->
                <ion-segment v-model="tab">
                    <ion-segment-button value="pesajes">Pesajes</ion-segment-button>
                    <ion-segment-button value="tratamientos">Tratamientos</ion-segment-button>
                </ion-segment>

                <!-- Pesajes -->
                <div v-if="tab === 'pesajes'">
                    <div v-if="pesajes.length > 0" class="export-bar">
                        <ion-button size="small" fill="outline" color="success" @click="exportar">
                            <ion-icon :icon="downloadOutline" slot="start" />
                            Exportar a Excel
                        </ion-button>
                    </div>
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
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import {
    IonPage, IonContent,
    IonList, IonItem, IonLabel, IonSpinner,
    IonSegment, IonSegmentButton, IonButton, IonIcon,
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons,
    IonDatetime, IonSelect, IonSelectOption
} from '@ionic/vue'
import { downloadOutline, calendarOutline } from 'ionicons/icons'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js'
import { ganaderoService } from '../../services/ganadero'
import { fotoUrl } from '../../services/media'
import { exportarPesajes } from '../../services/export'
import { paths } from '../../router/paths'
import GanaderoHeader from '../../components/ganadero/GanaderoHeader.vue'

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

const hoy = new Date().toISOString().slice(0, 10)
const modalProgramar = ref(false)
const formFecha = ref('')
const formRepetir = ref(null)
const guardando = ref(false)

function abrirProgramar() {
    formFecha.value = (animal.value?.proximo_pesaje || hoy).slice(0, 10)
    formRepetir.value = animal.value?.repetir_cada_dias ?? null
    modalProgramar.value = true
}

async function guardarPrograma() {
    guardando.value = true
    try {
        await ganaderoService.programarPesaje(nArete, {
            proximo_pesaje: formFecha.value.slice(0, 10),
            repetir_cada_dias: formRepetir.value,
        })
        const { data } = await ganaderoService.getAnimal(nArete)
        animal.value = data
        modalProgramar.value = false
    } finally {
        guardando.value = false
    }
}

async function quitarPrograma() {
    guardando.value = true
    try {
        await ganaderoService.programarPesaje(nArete, { proximo_pesaje: null })
        const { data } = await ganaderoService.getAnimal(nArete)
        animal.value = data
        modalProgramar.value = false
    } finally {
        guardando.value = false
    }
}

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
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: false } }
        }
    })
}

function formatFecha(fecha) {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleDateString('es-CR')
}

function exportar() {
    if (!animal.value || pesajes.value.length === 0) return
    exportarPesajes(animal.value, pesajes.value)
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

.foto-animal {
    display: block;
    width: 100%;
    max-width: 360px;
    max-height: 280px;
    object-fit: contain;
    border-radius: 10px;
    margin: 0 auto 0.75rem;
    background: #f4f4f4;
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

.proximo {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: #2d6a4f !important;
    font-weight: 600;
}
.proximo ion-icon { font-size: 1rem; }

.btn-programar {
    margin-top: 0.75rem;
}

.modal-label {
    color: #555;
    font-size: 0.85rem;
    font-weight: 600;
    margin: 0 0 0.25rem;
}

.export-bar {
    display: flex;
    justify-content: flex-end;
    padding: 0.5rem 1rem 0;
}

.grafico-container {
    position: relative;
    height: 260px;
    padding: 1rem 0;
}

.seccion-titulo {
    color: #555;
    font-size: 0.9rem;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
}
</style>