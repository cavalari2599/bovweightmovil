<template>
    <ion-page>
        <ganadero-header :title="modoAnimales ? 'Selecciona Finca' : 'Mis Fincas'">
            <template #actions>
                <ion-button v-if="!modoAnimales" @click="abrirModalCrear">
                    <ion-icon :icon="addOutline" />
                </ion-button>
                <ion-button v-if="!modoAnimales" @click="handleLogout">
                    <ion-icon :icon="logOutOutline" />
                </ion-button>
            </template>
        </ganadero-header>

        <ion-content>
            <div v-if="loading" class="ion-text-center ion-padding">
                <ion-spinner />
            </div>

            <ion-list v-else>
                <ion-item
                    v-for="finca in fincas"
                    :key="finca.id_finca"
                    button
                    @click="abrirFinca(finca)"
                >
                    <ion-label>
                        <h2>{{ finca.nombre_finca }}</h2>
                        <p>{{ finca.ubicacion_finca }}</p>
                    </ion-label>
                    <ion-button v-if="!modoAnimales" fill="clear" slot="end" @click.stop="abrirModalEditar(finca)">
                        <ion-icon :icon="pencilOutline" />
                    </ion-button>
                </ion-item>

                <ion-item v-if="fincas.length === 0">
                    <ion-label class="ion-text-center">
                        No tienes fincas registradas.
                    </ion-label>
                </ion-item>
            </ion-list>
        </ion-content>

        <!-- Modal crear/editar finca -->
        <ion-modal :is-open="modalAbierto" @did-dismiss="cerrarModal">
            <ion-header>
                <ion-toolbar color="success">
                    <ion-title>{{ esEdicion ? 'Editar Finca' : 'Nueva Finca' }}</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="cerrarModal">Cancelar</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>

            <ion-content class="ion-padding">
                <ion-item>
                    <ion-label position="floating">Nombre de la finca</ion-label>
                    <ion-input v-model="form.nombre_finca" />
                </ion-item>

                <ion-item>
                    <ion-label position="floating">Ubicación</ion-label>
                    <ion-input v-model="form.ubicacion_finca" />
                </ion-item>

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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonIcon, IonSpinner,
    IonButtons, IonButton, IonModal, IonInput
} from '@ionic/vue'
import { addOutline, logOutOutline, pencilOutline } from 'ionicons/icons'
import { ganaderoService } from '../../services/ganadero'
import { useAuthStore } from '../../stores/auth'
import { paths } from '../../router/paths'
import GanaderoHeader from '../../components/ganadero/GanaderoHeader.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const modo = computed(() => route.query.modo)
const modoAnimales = computed(() => modo.value === 'animales' || modo.value === 'reporte')
const fincas = ref([])
const loading = ref(true)
const modalAbierto = ref(false)
const guardando = ref(false)
const error = ref('')
const esEdicion = ref(false)
const fincaEditando = ref(null)

const form = ref({
    nombre_finca: '',
    ubicacion_finca: '',
})

async function cargarFincas() {
    try {
        const response = await ganaderoService.getFincas()
        fincas.value = response.data
    } finally {
        loading.value = false
    }
}

function abrirFinca(finca) {
    if (modo.value === 'reporte') {
        router.push(paths.ganadero.reporte(finca.id_finca))
    } else if (modo.value === 'animales') {
        router.push(paths.ganadero.animales(finca.id_finca))
    } else {
        router.push(paths.ganadero.fincaDetalle(finca.id_finca))
    }
}

function abrirModalCrear() {
    esEdicion.value = false
    fincaEditando.value = null
    form.value = { nombre_finca: '', ubicacion_finca: '' }
    modalAbierto.value = true
}

function abrirModalEditar(finca) {
    esEdicion.value = true
    fincaEditando.value = finca
    form.value = {
        nombre_finca: finca.nombre_finca,
        ubicacion_finca: finca.ubicacion_finca,
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
        if (esEdicion.value) {
            await ganaderoService.editarFinca(fincaEditando.value.id_finca, form.value)
        } else {
            await ganaderoService.crearFinca(form.value)
        }
        cerrarModal()
        await cargarFincas()
    } catch (e) {
        error.value = e.response?.data?.message || 'Error al guardar.'
    } finally {
        guardando.value = false
    }
}

async function handleLogout() {
    await auth.logout()
    router.push(paths.login)
}

onMounted(cargarFincas)
</script>

<style scoped>
.error {
    color: red;
    font-size: 0.85rem;
    text-align: center;
    margin: 0.5rem 0;
}
</style>