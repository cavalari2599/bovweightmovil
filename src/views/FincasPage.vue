<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="success">
                <ion-title>Mis Fincas</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="handleLogout">
                        <ion-icon :icon="logOutOutline" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div v-if="loading" class="ion-text-center ion-padding">
                <ion-spinner />
            </div>

            <ion-list v-else>
                <ion-item
                    v-for="finca in fincas"
                    :key="finca.id_finca"
                    button
                    @click="verAnimales(finca.id_finca)"
                >
                    <ion-label>
                        <h2>{{ finca.nombre_finca }}</h2>
                        <p>{{ finca.ubicacion_finca }}</p>
                    </ion-label>
                    <ion-icon :icon="chevronForwardOutline" slot="end" />
                </ion-item>

                <ion-item v-if="fincas.length === 0">
                    <ion-label class="ion-text-center">
                        No tienes fincas asignadas.
                    </ion-label>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonIcon, IonSpinner,
    IonButtons, IonButton
} from '@ionic/vue'
import { chevronForwardOutline, logOutOutline } from 'ionicons/icons'
import { veterinarioService } from '../services/veterinario'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const fincas = ref([])
const loading = ref(true)

async function cargarFincas() {
    try {
        const response = await veterinarioService.getFincas()
        fincas.value = response.data
    } finally {
        loading.value = false
    }
}

function verAnimales(idFinca) {
    router.push(`/fincas/${idFinca}/animales`)
}

async function handleLogout() {
    await auth.logout()
    router.push('/login')
}

onMounted(cargarFincas)
</script>