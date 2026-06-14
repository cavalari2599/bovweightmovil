<template>
    <ion-page>
        <ganadero-header title="Animales" :back-href="`${paths.ganadero.fincas}?modo=animales`">
            <template #actions>
                <ion-button @click="exportarExcel" :disabled="animales.length === 0">
                    <ion-icon :icon="downloadOutline" />
                </ion-button>
                <ion-button @click="abrirModalCrear">
                    <ion-icon :icon="addOutline" />
                </ion-button>
            </template>
        </ganadero-header>

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

            <!-- Filtro estado -->
            <div class="ordenamiento">
                <ion-segment v-model="filtro">
                    <ion-segment-button value="activos">Activos</ion-segment-button>
                    <ion-segment-button value="inactivos">Inactivos</ion-segment-button>
                    <ion-segment-button value="todos">Todos</ion-segment-button>
                </ion-segment>
            </div>

            <!-- Búsqueda -->
            <ion-searchbar
                v-model="busqueda"
                placeholder="Buscar por nombre o arete"
                :debounce="200"
            />

            <div v-if="loading" class="ion-text-center ion-padding">
                <ion-spinner />
            </div>

            <ion-list v-else>
                <ion-item
                    v-for="animal in animalesFiltrados"
                    :key="animal.n_arete"
                    button
                    @click="verDetalle(animal)"
                >
                    <ion-thumbnail slot="start" v-if="animal.foto_animal">
                        <img :src="fotoUrl(animal.foto_animal)" alt="foto" />
                    </ion-thumbnail>
                    <ion-label>
                        <h2>{{ animal.nombre_animal || 'Sin nombre' }}</h2>
                        <p>Arete: {{ animal.n_arete }} | Raza: {{ animal.raza || '-' }}</p>
                        <p>Peso: {{ animal.peso }} kg
                            <ion-badge :color="badgeColor(animal.estado)">{{ animal.estado }}</ion-badge>
                        </p>
                        <div class="acciones-rapidas" v-if="animal.estado === 'Activo'">
                            <ion-button size="small" fill="outline" color="warning"
                                @click.stop="marcarEstado(animal, 'Vendido')">Vendido</ion-button>
                            <ion-button size="small" fill="outline" color="danger"
                                @click.stop="marcarEstado(animal, 'Muerto')">Muerto</ion-button>
                        </div>
                    </ion-label>
                    <ion-button fill="clear" slot="end" @click.stop="abrirModalEditar(animal)">
                        <ion-icon :icon="pencilOutline" />
                    </ion-button>
                </ion-item>

                <ion-item v-if="animalesFiltrados.length === 0">
                    <ion-label class="ion-text-center">
                        No hay animales en esta vista.
                    </ion-label>
                </ion-item>
            </ion-list>
        </ion-content>

        <animal-form-modal
            :is-open="modalAbierto"
            :animal="animalEditando"
            :id-finca="idFinca"
            :razas="razas"
            @dismiss="modalAbierto = false"
            @saved="onSaved"
        />
    </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
    IonPage, IonContent, IonList, IonItem, IonLabel, IonIcon, IonSpinner,
    IonButton, IonSegment, IonSegmentButton, IonThumbnail, IonBadge,
    IonSearchbar, alertController
} from '@ionic/vue'
import { addOutline, pencilOutline, downloadOutline } from 'ionicons/icons'
import { ganaderoService } from '../../services/ganadero'
import { fotoUrl } from '../../services/media'
import { exportarAnimales } from '../../services/export'
import { paths } from '../../router/paths'
import GanaderoHeader from '../../components/ganadero/GanaderoHeader.vue'
import AnimalFormModal from '../../components/ganadero/AnimalFormModal.vue'

const router = useRouter()
const route = useRoute()
const idFinca = route.params.idFinca

const animales = ref([])
const resumen = ref(null)
const loading = ref(true)
const ordenar = ref('peso')
const filtro = ref('activos')
const busqueda = ref('')
const modalAbierto = ref(false)
const animalEditando = ref(null)

const razas = [
    'Brahman', 'Gyr', 'Nelore', 'Guzerá', 'Cebú',
    'Holstein', 'Jersey', 'Pardo Suizo', 'Angus', 'Hereford',
    'Charolais', 'Simmental', 'Romosinuano', 'Senepol', 'Cruce / Encaste', 'Otra',
]

const animalesFiltrados = computed(() => {
    let lista = animales.value
    if (filtro.value === 'activos') lista = lista.filter(a => a.estado === 'Activo')
    else if (filtro.value === 'inactivos') lista = lista.filter(a => a.estado === 'Vendido' || a.estado === 'Muerto')

    const q = busqueda.value.trim().toLowerCase()
    if (q) {
        lista = lista.filter(a =>
            (a.nombre_animal || '').toLowerCase().includes(q) ||
            (a.n_arete || '').toLowerCase().includes(q)
        )
    }
    return lista
})

function badgeColor(estado) {
    if (estado === 'Activo') return 'success'
    if (estado === 'Vendido') return 'warning'
    return 'medium'
}

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
    router.push(`${paths.ganadero.animalDetalle(animal.n_arete)}?idFinca=${idFinca}`)
}

function exportarExcel() {
    if (animales.value.length === 0) return
    exportarAnimales(animales.value, `finca_${idFinca}`)
}

function abrirModalCrear() {
    animalEditando.value = null
    modalAbierto.value = true
}

function abrirModalEditar(animal) {
    animalEditando.value = animal
    modalAbierto.value = true
}

function onSaved() {
    modalAbierto.value = false
    cargarAnimales()
}

async function marcarEstado(animal, estado) {
    const alert = await alertController.create({
        header: `Marcar como ${estado}`,
        message: `¿Marcar a "${animal.nombre_animal || animal.n_arete}" como ${estado}? El animal no se borra, solo cambia su estado.`,
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Confirmar',
                handler: async () => {
                    await ganaderoService.editarAnimal(animal.n_arete, { estado })
                    await cargarAnimales()
                },
            },
        ],
    })
    await alert.present()
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

.acciones-rapidas {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.4rem;
}

ion-badge {
    margin-left: 0.4rem;
    vertical-align: middle;
}
</style>
