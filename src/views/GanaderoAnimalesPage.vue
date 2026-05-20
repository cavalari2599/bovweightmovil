<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="success">
                <ion-buttons slot="start">
                    <ion-back-button default-href="/ganadero/fincas" />
                </ion-buttons>
                <ion-title>Animales</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="abrirModalCrear">
                        <ion-icon :icon="addOutline" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <!-- Resumen finca -->
            <div class="resumen" v-if="resumen">
                <div class="resumen-card">
                    <span class="numero">{{ resumen.total_animales }}</span>
                    <span class="label">Animales</span>
                </div>
                <div class="resumen-card">
                    <span class="numero">{{ resumen.peso_promedio }}</span>
                    <span class="label">Peso Prom. (kg)</span>
                </div>
                <div class="resumen-card">
                    <span class="numero">{{ resumen.peso_maximo }}</span>
                    <span class="label">Peso Máx. (kg)</span>
                </div>
            </div>

            <!-- Ordenamiento -->
            <div class="ordenamiento">
                <ion-segment v-model="ordenar" @ionChange="cargarAnimales">
                    <ion-segment-button value="peso">Peso</ion-segment-button>
                    <ion-segment-button value="nombre">Nombre</ion-segment-button>
                    <ion-segment-button value="fecha">Fecha</ion-segment-button>
                </ion-segment>
            </div>

            <div v-if="loading" class="ion-text-center ion-padding">
                <ion-spinner />
            </div>

            <ion-list v-else>
                <ion-item
                    v-for="animal in animales"
                    :key="animal.n_arete"
                    button
                    @click="verDetalle(animal)"
                >
                    <ion-label>
                        <h2>{{ animal.nombre_animal || 'Sin nombre' }}</h2>
                        <p>Arete: {{ animal.n_arete }} | Raza: {{ animal.raza || '-' }}</p>
                        <p>Peso: {{ animal.peso }} kg | Estado: {{ animal.estado }}</p>
                    </ion-label>
                    <ion-button fill="clear" slot="end" @click.stop="abrirModalEditar(animal)">
                        <ion-icon :icon="pencilOutline" />
                    </ion-button>
                </ion-item>

                <ion-item v-if="animales.length === 0">
                    <ion-label class="ion-text-center">
                        No hay animales registrados.
                    </ion-label>
                </ion-item>
            </ion-list>
        </ion-content>

        <!-- Modal crear/editar animal -->
        <ion-modal :is-open="modalAbierto" @did-dismiss="cerrarModal">
            <ion-header>
                <ion-toolbar color="success">
                    <ion-title>{{ esEdicion ? 'Editar Animal' : 'Nuevo Animal' }}</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="cerrarModal">Cancelar</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>

            <ion-content class="ion-padding">
                <ion-item>
                    <ion-label position="floating">N° Arete</ion-label>
                    <ion-input v-model="form.n_arete" :disabled="esEdicion" />
                </ion-item>

                <ion-item>
                    <ion-label position="floating">Nombre</ion-label>
                    <ion-input v-model="form.nombre_animal" />
                </ion-item>

                <ion-item>
                    <ion-label position="floating">Raza</ion-label>
                    <ion-input v-model="form.raza" />
                </ion-item>

                <ion-item>
                    <ion-label position="floating">Edad</ion-label>
                    <ion-input v-model="form.edad" type="number" />
                </ion-item>

                <ion-item>
                    <ion-label position="floating">Peso (kg)</ion-label>
                    <ion-input v-model="form.peso" type="number" />
                </ion-item>

                <ion-item>
                    <ion-label position="floating">Estado</ion-label>
                    <ion-select v-model="form.estado">
                        <ion-select-option value="Activo">Activo</ion-select-option>
                        <ion-select-option value="Vendido">Vendido</ion-select-option>
                        <ion-select-option value="Muerto">Muerto</ion-select-option>
                    </ion-select>
                </ion-item>

                <div class="fecha-group">
                    <label>Fecha de nacimiento</label>
                    <ion-datetime
                        presentation="date"
                        v-model="form.fecha_nacimiento"
                        :prefer-wheel="false"
                        max="2030-12-31"
                    />
                </div>

                <p v-if="error" class="error">{{ error }}</p>

                <ion-button
                    expand="block"
                    class="ion-margin-top"
                    :disabled="guardando"
                    @click="guardar"
                    style="--background: #2d6a4f"
                >
                    {{ guardando ? 'Guardando...' : 'Guardar' }}
                </ion-button>
            </ion-content>
        </ion-modal>
    </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonIcon, IonSpinner,
    IonButtons, IonBackButton, IonButton, IonModal,
    IonInput, IonSegment, IonSegmentButton, IonSelect,
    IonSelectOption, IonDatetime
} from '@ionic/vue'
import { addOutline, pencilOutline } from 'ionicons/icons'
import { ganaderoService } from '../services/ganadero'

const router = useRouter()
const route = useRoute()
const idFinca = route.params.idFinca

const animales = ref([])
const resumen = ref(null)
const loading = ref(true)
const ordenar = ref('peso')
const modalAbierto = ref(false)
const guardando = ref(false)
const error = ref('')
const esEdicion = ref(false)
const animalEditando = ref(null)

const form = ref({
    n_arete: '',
    nombre_animal: '',
    raza: '',
    edad: '',
    peso: '',
    estado: 'Activo',
    fecha_nacimiento: '',
})

async function cargarAnimales() {
    loading.value = true
    try {
        const [animalesRes, resumenRes] = await Promise.all([
            ganaderoService.getAnimales(idFinca, ordenar.value),
            ganaderoService.getResumenFinca(idFinca),
        ])
        animales.value = animalesRes.data
        resumen.value = resumenRes.data
    } finally {
        loading.value = false
    }
}

function verDetalle(animal) {
    router.push(`/ganadero/animales/${animal.n_arete}/detalle`)
}

function abrirModalCrear() {
    esEdicion.value = false
    animalEditando.value = null
    form.value = { n_arete: '', nombre_animal: '', raza: '', edad: '', peso: '', estado: 'Activo', fecha_nacimiento: '' }
    modalAbierto.value = true
}

function abrirModalEditar(animal) {
    esEdicion.value = true
    animalEditando.value = animal
    form.value = {
        n_arete: animal.n_arete,
        nombre_animal: animal.nombre_animal || '',
        raza: animal.raza || '',
        edad: animal.edad || '',
        peso: animal.peso || '',
        estado: animal.estado,
        fecha_nacimiento: animal.fecha_nacimiento || '',
    }
    modalAbierto.value = true
}

function cerrarModal() {
    modalAbierto.value = false
    error.value = ''
}

async function guardar() {
    error.value = ''
    guardando.value = true
    try {
        const data = {
            ...form.value,
            fecha_nacimiento: form.value.fecha_nacimiento?.split('T')[0] || null,
        }
        if (esEdicion.value) {
            await ganaderoService.editarAnimal(animalEditando.value.n_arete, data)
        } else {
            await ganaderoService.crearAnimal(idFinca, data)
        }
        cerrarModal()
        await cargarAnimales()
    } catch (e) {
        error.value = e.response?.data?.message || 'Error al guardar.'
    } finally {
        guardando.value = false
    }
}

onMounted(cargarAnimales)
</script>

<style scoped>
.resumen {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: white;
    margin: 1rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    justify-content: space-around;
}

.resumen-card {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.numero {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2d6a4f;
}

.label {
    font-size: 0.75rem;
    color: #888;
}

.ordenamiento {
    padding: 0.5rem 1rem;
}

.error {
    color: red;
    font-size: 0.85rem;
    text-align: center;
    margin: 0.5rem 0;
}

.fecha-group {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #ddd;
}

.fecha-group label {
    display: block;
    font-size: 0.8rem;
    color: #888;
    margin-bottom: 0.25rem;
}
</style>