<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="success">
                <ion-buttons slot="start">
                    <ion-back-button :default-href="paths.veterinario.animales(idFinca)" />
                </ion-buttons>
                <ion-title>Tratamientos</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="abrirModal">
                        <ion-icon :icon="addOutline" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div v-if="loading" class="ion-text-center ion-padding">
                <ion-spinner />
            </div>

            <ion-list v-else>
                <ion-item v-for="t in tratamientos" :key="t.id_tratamiento">
                    <ion-label>
                        <h2>{{ t.tipo_tratamiento }}</h2>
                        <p>Medicamento: {{ t.medicamento || '-' }}</p>
                        <p>{{ t.descripcion || '' }}</p>
                        <p>Inicio: {{ t.fecha_inicio }} | Fin: {{ t.fecha_fin || 'En curso' }}</p>
                    </ion-label>
                </ion-item>

                <ion-item v-if="tratamientos.length === 0">
                    <ion-label class="ion-text-center">
                        No hay tratamientos registrados.
                    </ion-label>
                </ion-item>
            </ion-list>
        </ion-content>

        <ion-modal :is-open="modalAbierto" @did-dismiss="cerrarModal">
            <ion-header>
                <ion-toolbar color="success">
                    <ion-title>Nuevo Tratamiento</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="cerrarModal">Cancelar</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>

            <ion-content class="ion-padding">
                <ion-item>
                    <ion-label position="floating">Tipo de tratamiento</ion-label>
                    <ion-input v-model="form.tipo_tratamiento" />
                </ion-item>

                <ion-item>
                    <ion-label position="floating">Medicamento</ion-label>
                    <ion-input v-model="form.medicamento" />
                </ion-item>

                <ion-item>
                    <ion-label position="floating">Descripción</ion-label>
                    <ion-textarea v-model="form.descripcion" />
                </ion-item>

                <ion-datetime
    presentation="date"
    v-model="form.fecha_inicio"
    :prefer-wheel="false"
    max="2030-12-31"
/>

               <ion-datetime
    presentation="date"
    v-model="form.fecha_fin"
    :prefer-wheel="false"
    max="2030-12-31"
/>

                <p v-if="error" class="error">{{ error }}</p>

                <ion-button
                    expand="block"
                    class="ion-margin-top"
                    :disabled="guardando"
                    @click="guardarTratamiento"
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
import { useRoute } from 'vue-router'
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonIcon, IonSpinner,
    IonButtons, IonBackButton, IonButton, IonModal,
    IonInput, IonTextarea, IonDatetime
} from '@ionic/vue'
import { addOutline } from 'ionicons/icons'
import { veterinarioService } from '../../services/veterinario'
import { paths } from '../../router/paths'

const route = useRoute()
const nArete = route.params.nArete
const idFinca = route.query.idFinca

const tratamientos = ref([])
const loading = ref(true)
const modalAbierto = ref(false)
const guardando = ref(false)
const error = ref('')

const form = ref({
    tipo_tratamiento: '',
    medicamento: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
})

async function cargarTratamientos() {
    try {
        const response = await veterinarioService.getTratamientos(nArete)
        tratamientos.value = response.data
    } finally {
        loading.value = false
    }
}

function abrirModal() {
    modalAbierto.value = true
}

function cerrarModal() {
    modalAbierto.value = false
    error.value = ''
    form.value = {
        tipo_tratamiento: '',
        medicamento: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
    }
}

async function guardarTratamiento() {
    error.value = ''
    guardando.value = true
    try {
        const data = {
            ...form.value,
            n_arete: nArete,
            fecha_inicio: form.value.fecha_inicio?.split('T')[0],
            fecha_fin: form.value.fecha_fin ? form.value.fecha_fin.split('T')[0] : null,
        }
        await veterinarioService.createTratamiento(data)
        cerrarModal()
        await cargarTratamientos()
    } catch (e) {
        error.value = e.response?.data?.message || 'Error al guardar.'
    } finally {
        guardando.value = false
    }
}

onMounted(cargarTratamientos)
</script>

<style scoped>
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