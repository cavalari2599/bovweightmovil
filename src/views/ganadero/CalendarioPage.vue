<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="success">
                <ion-buttons slot="start">
                    <ion-back-button :default-href="paths.ganadero.menu" />
                </ion-buttons>
                <ion-title>Calendario de Pesajes</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="abrirAgendar">
                        <ion-icon :icon="addOutline" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <div v-if="loading" class="ion-text-center ion-padding">
                <ion-spinner />
            </div>

            <div v-else>
                <!-- Atrasados -->
                <div v-if="atrasados.length > 0" class="seccion atrasados">
                    <h3 class="seccion-titulo">
                        <ion-icon :icon="alertCircle" /> Atrasados ({{ atrasados.length }})
                    </h3>
                    <ion-list>
                        <ion-item v-for="a in atrasados" :key="a.n_arete" lines="full">
                            <ion-thumbnail slot="start" v-if="a.foto_animal">
                                <img :src="fotoUrl(a.foto_animal)" alt="foto" />
                            </ion-thumbnail>
                            <ion-label>
                                <h3>{{ a.nombre_animal || a.n_arete }}</h3>
                                <p>Programado: {{ formatFecha(a.proximo_pesaje) }}</p>
                            </ion-label>
                            <ion-buttons slot="end">
                                <ion-button color="success" @click="pesar()">Pesar</ion-button>
                                <ion-button color="medium" @click="quitar(a)">
                                    <ion-icon :icon="closeOutline" />
                                </ion-button>
                            </ion-buttons>
                        </ion-item>
                    </ion-list>
                </div>

                <!-- Calendario -->
                <ion-datetime
                    presentation="date"
                    :highlighted-dates="diasMarcados"
                    v-model="diaSel"
                    :prefer-wheel="false"
                    class="calendario"
                />

                <!-- Pesajes del dia seleccionado -->
                <div class="seccion">
                    <h3 class="seccion-titulo">Programados para {{ formatFecha(diaSelCorto) }}</h3>
                    <ion-list>
                        <ion-item v-for="a in delDia" :key="a.n_arete" lines="full">
                            <ion-thumbnail slot="start" v-if="a.foto_animal">
                                <img :src="fotoUrl(a.foto_animal)" alt="foto" />
                            </ion-thumbnail>
                            <ion-label>
                                <h3>{{ a.nombre_animal || a.n_arete }}</h3>
                                <p>Arete: {{ a.n_arete }}
                                    <span v-if="a.repetir_cada_dias"> · repite c/{{ a.repetir_cada_dias }} días</span>
                                </p>
                            </ion-label>
                            <ion-buttons slot="end">
                                <ion-button color="success" @click="pesar()">Pesar</ion-button>
                                <ion-button color="medium" @click="quitar(a)">
                                    <ion-icon :icon="closeOutline" />
                                </ion-button>
                            </ion-buttons>
                        </ion-item>
                        <ion-item v-if="delDia.length === 0" lines="none">
                            <ion-label class="ion-text-center vacio">Sin pesajes programados este día.</ion-label>
                        </ion-item>
                    </ion-list>
                </div>
            </div>

            <!-- Modal agendar pesaje -->
            <ion-modal :is-open="modalAgendar" @did-dismiss="modalAgendar = false">
                <ion-header>
                    <ion-toolbar color="success">
                        <ion-title>Agendar pesaje</ion-title>
                        <ion-buttons slot="end">
                            <ion-button @click="modalAgendar = false">Cerrar</ion-button>
                        </ion-buttons>
                    </ion-toolbar>
                </ion-header>
                <ion-content class="ion-padding">
                    <!-- Paso 1: elegir animal -->
                    <template v-if="!animalSel">
                        <p class="modal-label">Elige el animal</p>
                        <ion-searchbar v-model="busqueda" placeholder="Buscar por arete o nombre" />
                        <ion-list>
                            <ion-item button v-for="a in animalesFiltrados" :key="a.n_arete" @click="animalSel = a">
                                <ion-thumbnail slot="start" v-if="a.foto_animal">
                                    <img :src="fotoUrl(a.foto_animal)" alt="foto" />
                                </ion-thumbnail>
                                <ion-label>
                                    <h3>{{ a.nombre_animal || 'Sin nombre' }}</h3>
                                    <p>Arete: {{ a.n_arete }}
                                        <span v-if="a.proximo_pesaje"> · ya programado</span>
                                    </p>
                                </ion-label>
                            </ion-item>
                            <ion-item v-if="animalesFiltrados.length === 0">
                                <ion-label class="ion-text-center vacio">No hay animales.</ion-label>
                            </ion-item>
                        </ion-list>
                    </template>

                    <!-- Paso 2: fecha + repetir -->
                    <template v-else>
                        <div class="elegido">
                            <strong>{{ animalSel.nombre_animal || animalSel.n_arete }}</strong>
                            <ion-button size="small" fill="clear" @click="animalSel = null">Cambiar</ion-button>
                        </div>

                        <p class="modal-label">Fecha del pesaje</p>
                        <ion-datetime presentation="date" v-model="formFecha" :min="hoy()" :prefer-wheel="false" />

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
                            :disabled="!formFecha || guardando" @click="guardarAgenda">
                            {{ guardando ? 'Guardando...' : 'Agendar' }}
                        </ion-button>
                    </template>
                </ion-content>
            </ion-modal>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner,
    IonList, IonItem, IonLabel, IonThumbnail, IonDatetime, onIonViewWillEnter,
    IonModal, IonSearchbar, IonSelect, IonSelectOption,
} from '@ionic/vue'
import { alertCircle, closeOutline, addOutline } from 'ionicons/icons'
import { ganaderoService } from '../../services/ganadero'
import { fotoUrl } from '../../services/media'
import { paths } from '../../router/paths'

const router = useRouter()
const loading = ref(true)
const recordatorios = ref([])
const diaSel = ref(hoy())

// Agendar
const modalAgendar = ref(false)
const todosAnimales = ref([])
const busqueda = ref('')
const animalSel = ref(null)
const formFecha = ref('')
const formRepetir = ref(null)
const guardando = ref(false)

function hoy() {
    return new Date().toISOString().slice(0, 10)
}

function fecha(a) {
    return (a.proximo_pesaje || '').slice(0, 10)
}

const diaSelCorto = computed(() => (diaSel.value || '').slice(0, 10))

const atrasados = computed(() =>
    recordatorios.value.filter(a => fecha(a) < hoy()))

const delDia = computed(() =>
    recordatorios.value.filter(a => fecha(a) === diaSelCorto.value))

const diasMarcados = computed(() =>
    recordatorios.value.map(a => ({
        date: fecha(a),
        textColor: '#ffffff',
        backgroundColor: fecha(a) < hoy() ? '#c0392b' : '#2d6a4f',
    })))

function formatFecha(f) {
    if (!f) return '-'
    return new Date(f + 'T00:00:00').toLocaleDateString('es-CR', { weekday: 'short', day: 'numeric', month: 'short' })
}

const animalesFiltrados = computed(() => {
    const q = busqueda.value.trim().toLowerCase()
    if (!q) return todosAnimales.value
    return todosAnimales.value.filter(a =>
        String(a.n_arete).toLowerCase().includes(q) ||
        (a.nombre_animal || '').toLowerCase().includes(q))
})

async function abrirAgendar() {
    animalSel.value = null
    busqueda.value = ''
    formFecha.value = hoy()
    formRepetir.value = null
    modalAgendar.value = true
    const { data } = await ganaderoService.getTodosAnimales()
    todosAnimales.value = data
}

async function guardarAgenda() {
    guardando.value = true
    try {
        await ganaderoService.programarPesaje(animalSel.value.n_arete, {
            proximo_pesaje: formFecha.value.slice(0, 10),
            repetir_cada_dias: formRepetir.value,
        })
        modalAgendar.value = false
        await cargar()
    } finally {
        guardando.value = false
    }
}

function pesar() {
    router.push(paths.ganadero.captura)
}

async function quitar(animal) {
    await ganaderoService.programarPesaje(animal.n_arete, { proximo_pesaje: null })
    await cargar()
}

async function cargar() {
    loading.value = true
    try {
        const { data } = await ganaderoService.getRecordatorios()
        recordatorios.value = data
    } finally {
        loading.value = false
    }
}

onIonViewWillEnter(cargar)
</script>

<style scoped>
.seccion { margin-bottom: 1rem; }
.seccion-titulo {
    color: #2d6a4f; font-size: 0.95rem; font-weight: 600;
    display: flex; align-items: center; gap: 0.35rem; margin: 0.5rem 0;
}
.atrasados .seccion-titulo { color: #c0392b; }
.calendario {
    width: 100%; margin: 0 auto 1rem; border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.vacio { color: #999; font-size: 0.85rem; }
.modal-label { color: #555; font-size: 0.85rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
.elegido {
    display: flex; align-items: center; justify-content: space-between;
    background: #eef5f1; border-radius: 10px; padding: 0.5rem 0.85rem; margin-bottom: 0.5rem;
    color: #2d6a4f;
}
</style>
