<template>
    <ion-modal :is-open="isOpen" @didDismiss="$emit('dismiss')">
        <ion-header>
            <ion-toolbar color="success">
                <ion-buttons slot="start">
                    <ion-button @click="retroceder">
                        <ion-icon :icon="paso === 'animal' && tieneFincas ? arrowBackOutline : closeOutline" />
                    </ion-button>
                </ion-buttons>
                <ion-title>{{ paso === 'finca' ? '¿En qué finca estás?' : 'Elige el animal' }}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <div v-if="loading" class="ion-text-center ion-padding"><ion-spinner /></div>

            <!-- PASO 1: finca (solo ganadero) -->
            <ion-list v-else-if="paso === 'finca'">
                <ion-item button v-for="f in fincas" :key="f.id_finca" @click="elegirFinca(f)">
                    <ion-icon :icon="homeOutline" slot="start" color="success" />
                    <ion-label>
                        <h3>{{ f.nombre_finca }}</h3>
                        <p>{{ f.ubicacion_finca }}</p>
                    </ion-label>
                </ion-item>
                <ion-item v-if="fincas.length === 0">
                    <ion-label class="ion-text-center">No tienes fincas registradas.</ion-label>
                </ion-item>
            </ion-list>

            <!-- PASO 2: animal -->
            <template v-else>
                <p v-if="fincaSel" class="sub">Finca: {{ fincaSel.nombre_finca }}</p>
                <ion-searchbar v-model="busqueda" placeholder="Buscar por arete o nombre" :debounce="150" />

                <ion-list>
                    <ion-item button v-for="a in animalesFiltrados" :key="a.n_arete" @click="elegirAnimal(a)">
                        <ion-thumbnail slot="start" v-if="a.foto_animal">
                            <img :src="fotoUrl(a.foto_animal)" alt="foto" />
                        </ion-thumbnail>
                        <ion-icon v-else :icon="pawOutline" slot="start" color="success" />
                        <ion-label>
                            <h3>{{ a.nombre_animal || 'Sin nombre' }}</h3>
                            <p>Arete: {{ a.n_arete }} · Peso actual: {{ a.peso ?? '-' }} kg</p>
                            <p v-if="a.raza">Raza: {{ a.raza }}</p>
                        </ion-label>
                    </ion-item>
                    <ion-item v-if="animalesFiltrados.length === 0">
                        <ion-label class="ion-text-center">No hay animales en esta vista.</ion-label>
                    </ion-item>
                </ion-list>
            </template>
        </ion-content>
    </ion-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
    IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon, IonSpinner,
    IonList, IonItem, IonLabel, IonThumbnail, IonSearchbar,
} from '@ionic/vue'
import { arrowBackOutline, closeOutline, homeOutline, pawOutline } from 'ionicons/icons'
import { fotoUrl } from '../services/media'

const props = defineProps({
    isOpen: { type: Boolean, default: false },
    // ganadero: getFincas(), getAnimales(idFinca) | ayudante: getAnimales()
    service: { type: Object, required: true },
})
const emit = defineEmits(['dismiss', 'select'])

// Ganadero tiene varias fincas -> paso de finca. Ayudante tiene una sola -> animal directo.
const tieneFincas = computed(() => typeof props.service.getFincas === 'function')

const paso = ref('animal')
const loading = ref(false)
const fincas = ref([])
const fincaSel = ref(null)
const animales = ref([])
const busqueda = ref('')

const animalesFiltrados = computed(() => {
    const q = busqueda.value.trim().toLowerCase()
    if (!q) return animales.value
    return animales.value.filter(a =>
        String(a.n_arete).toLowerCase().includes(q) ||
        (a.nombre_animal || '').toLowerCase().includes(q))
})

// Al abrir, arranca el flujo segun el rol.
watch(() => props.isOpen, (abierto) => { if (abierto) iniciar() })

async function iniciar() {
    busqueda.value = ''
    fincaSel.value = null
    animales.value = []
    if (tieneFincas.value) {
        paso.value = 'finca'
        await cargarFincas()
    } else {
        paso.value = 'animal'
        await cargarAnimalesAyudante()
    }
}

async function cargarFincas() {
    loading.value = true
    try {
        const { data } = await props.service.getFincas()
        fincas.value = data
    } catch {
        fincas.value = []
    } finally {
        loading.value = false
    }
}

async function elegirFinca(f) {
    fincaSel.value = f
    paso.value = 'animal'
    busqueda.value = ''
    loading.value = true
    try {
        const { data } = await props.service.getAnimales(f.id_finca)
        animales.value = data
    } catch {
        animales.value = []
    } finally {
        loading.value = false
    }
}

async function cargarAnimalesAyudante() {
    loading.value = true
    try {
        const { data } = await props.service.getAnimales()
        animales.value = data
    } catch {
        animales.value = []
    } finally {
        loading.value = false
    }
}

function elegirAnimal(a) {
    emit('select', a)
}

// Atras: del paso animal vuelve a finca (ganadero); si no, cierra el modal.
function retroceder() {
    if (paso.value === 'animal' && tieneFincas.value) {
        paso.value = 'finca'
        return
    }
    emit('dismiss')
}
</script>

<style scoped>
.sub { color: #888; font-size: 0.85rem; margin: 0 0 0.5rem; }
ion-thumbnail img { object-fit: cover; border-radius: 8px; }
</style>
