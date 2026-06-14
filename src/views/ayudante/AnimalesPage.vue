<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="success">
                <ion-buttons slot="start">
                    <ion-back-button :default-href="paths.ayudante.menu" />
                </ion-buttons>
                <ion-title>{{ finca?.nombre_finca || 'Animales' }}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <ion-searchbar v-model="busqueda" placeholder="Buscar por arete o nombre" />

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
                        <p>Peso: {{ animal.peso ?? '-' }} kg
                            <ion-badge :color="badgeColor(animal.estado)">{{ animal.estado }}</ion-badge>
                        </p>
                    </ion-label>
                    <ion-icon :icon="chevronForwardOutline" slot="end" />
                </ion-item>

                <ion-item v-if="animalesFiltrados.length === 0">
                    <ion-label class="ion-text-center">No hay animales en tu finca.</ion-label>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonIcon,
    IonSpinner, IonThumbnail, IonBadge, IonSearchbar
} from '@ionic/vue'
import { chevronForwardOutline } from 'ionicons/icons'
import { ayudanteService } from '../../services/ayudante'
import { fotoUrl } from '../../services/media'
import { paths } from '../../router/paths'

const router = useRouter()
const finca = ref(null)
const animales = ref([])
const loading = ref(true)
const busqueda = ref('')

const animalesFiltrados = computed(() => {
    const q = busqueda.value.trim().toLowerCase()
    if (!q) return animales.value
    return animales.value.filter(a =>
        (a.nombre_animal || '').toLowerCase().includes(q) ||
        String(a.n_arete).toLowerCase().includes(q))
})

function badgeColor(estado) {
    if (estado === 'Activo') return 'success'
    if (estado === 'Vendido') return 'warning'
    return 'medium'
}

function verDetalle(animal) {
    router.push(paths.ayudante.animalDetalle(animal.n_arete))
}

async function cargar() {
    loading.value = true
    try {
        const [fincaRes, animalesRes] = await Promise.all([
            ayudanteService.getFinca(),
            ayudanteService.getAnimales(),
        ])
        finca.value = fincaRes.data
        animales.value = animalesRes.data
    } finally {
        loading.value = false
    }
}

onMounted(cargar)
</script>
