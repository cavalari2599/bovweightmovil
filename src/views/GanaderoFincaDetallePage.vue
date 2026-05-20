<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="success">
                <ion-buttons slot="start">
                    <ion-back-button default-href="/ganadero/fincas" />
                </ion-buttons>
                <ion-title>{{ finca?.nombre_finca || 'Finca' }}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <div v-if="loading" class="ion-text-center ion-padding">
                <ion-spinner />
            </div>

            <div v-else>
                <!-- Info finca -->
                <div class="info-card">
                    <h3>{{ finca?.nombre_finca }}</h3>
                    <p>{{ finca?.ubicacion_finca }}</p>
                </div>

                <!-- Veterinarios -->
                <div class="seccion">
                    <div class="seccion-header">
                        <h4>Veterinarios Asignados</h4>
                        <ion-button size="small" fill="outline" color="success" @click="abrirModalVeterinario">
                            + Asignar
                        </ion-button>
                    </div>

                    <ion-list>
                        <ion-item v-for="v in veterinariosAsignados" :key="v.identificacion_usuario">
                            <ion-label>
                                <h3>{{ v.nombre_usuario }} {{ v.apellido1_usuario }}</h3>
                                <p>{{ v.correo }}</p>
                            </ion-label>
                            <ion-button fill="clear" color="danger" slot="end" @click="desasignarVeterinario(v)">
                                <ion-icon :icon="trashOutline" />
                            </ion-button>
                        </ion-item>
                        <ion-item v-if="veterinariosAsignados.length === 0">
                            <ion-label class="ion-text-center">No hay veterinarios asignados.</ion-label>
                        </ion-item>
                    </ion-list>
                </div>

                <!-- Ayudantes -->
                <div class="seccion">
                    <div class="seccion-header">
                        <h4>Ayudantes Asignados</h4>
                        <ion-button size="small" fill="outline" color="success" @click="abrirModalAyudante">
                            + Asignar
                        </ion-button>
                    </div>

                    <ion-list>
                        <ion-item v-for="a in ayudantesAsignados" :key="a.identificacion_usuario">
                            <ion-label>
                                <h3>{{ a.nombre_usuario }} {{ a.apellido1_usuario }}</h3>
                                <p>{{ a.correo }}</p>
                            </ion-label>
                            <ion-button fill="clear" color="danger" slot="end" @click="desasignarAyudante(a)">
                                <ion-icon :icon="trashOutline" />
                            </ion-button>
                        </ion-item>
                        <ion-item v-if="ayudantesAsignados.length === 0">
                            <ion-label class="ion-text-center">No hay ayudantes asignados.</ion-label>
                        </ion-item>
                    </ion-list>
                </div>
            </div>
        </ion-content>

        <!-- Modal asignar veterinario -->
        <ion-modal :is-open="modalVeterinario" @did-dismiss="modalVeterinario = false">
            <ion-header>
                <ion-toolbar color="success">
                    <ion-title>Asignar Veterinario</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="modalVeterinario = false">Cancelar</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content>
                <ion-list>
                    <ion-item
                        v-for="v in veterinariosDisponibles"
                        :key="v.identificacion_usuario"
                        button
                        @click="asignarVeterinario(v)"
                    >
                        <ion-label>
                            <h3>{{ v.nombre_usuario }} {{ v.apellido1_usuario }}</h3>
                            <p>{{ v.correo }}</p>
                        </ion-label>
                    </ion-item>
                    <ion-item v-if="veterinariosDisponibles.length === 0">
                        <ion-label class="ion-text-center">No hay veterinarios disponibles.</ion-label>
                    </ion-item>
                </ion-list>
            </ion-content>
        </ion-modal>

        <!-- Modal asignar ayudante -->
        <ion-modal :is-open="modalAyudante" @did-dismiss="modalAyudante = false">
            <ion-header>
                <ion-toolbar color="success">
                    <ion-title>Asignar Ayudante</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="modalAyudante = false">Cancelar</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content>
                <ion-list>
                    <ion-item
                        v-for="a in ayudantesDisponibles"
                        :key="a.identificacion_usuario"
                        button
                        @click="asignarAyudante(a)"
                    >
                        <ion-label>
                            <h3>{{ a.nombre_usuario }} {{ a.apellido1_usuario }}</h3>
                            <p>{{ a.correo }}</p>
                        </ion-label>
                    </ion-item>
                    <ion-item v-if="ayudantesDisponibles.length === 0">
                        <ion-label class="ion-text-center">No hay ayudantes disponibles.</ion-label>
                    </ion-item>
                </ion-list>
            </ion-content>
        </ion-modal>
    </ion-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonSpinner, IonIcon,
    IonButtons, IonBackButton, IonButton, IonModal
} from '@ionic/vue'
import { trashOutline } from 'ionicons/icons'
import { ganaderoService } from '../services/ganadero'

const route = useRoute()
const idFinca = route.params.idFinca

const finca = ref(null)
const veterinariosAsignados = ref([])
const ayudantesAsignados = ref([])
const todosVeterinarios = ref([])
const todosAyudantes = ref([])
const loading = ref(true)
const modalVeterinario = ref(false)
const modalAyudante = ref(false)

const veterinariosDisponibles = computed(() => {
    const asignadosIds = veterinariosAsignados.value.map(v => v.identificacion_usuario)
    return todosVeterinarios.value.filter(v => !asignadosIds.includes(v.identificacion_usuario))
})

const ayudantesDisponibles = computed(() => {
    const asignadosIds = ayudantesAsignados.value.map(a => a.identificacion_usuario)
    return todosAyudantes.value.filter(a => !asignadosIds.includes(a.identificacion_usuario))
})

async function cargarDatos() {
    try {
        const [fincaRes, vetRes, ayuRes, vetAsigRes, ayuAsigRes] = await Promise.all([
            ganaderoService.getFincas(),
            ganaderoService.getVeterinarios(),
            ganaderoService.getAyudantes(),
            ganaderoService.getVeterinariosAsignados(idFinca),
            ganaderoService.getAyudantesAsignados(idFinca),
        ])
        finca.value = fincaRes.data.find(f => f.id_finca == idFinca)
        todosVeterinarios.value = vetRes.data
        todosAyudantes.value = ayuRes.data
        veterinariosAsignados.value = vetAsigRes.data
        ayudantesAsignados.value = ayuAsigRes.data
    } finally {
        loading.value = false
    }
}

function abrirModalVeterinario() { modalVeterinario.value = true }
function abrirModalAyudante() { modalAyudante.value = true }

async function asignarVeterinario(v) {
    await ganaderoService.asignarVeterinario(idFinca, v.identificacion_usuario)
    modalVeterinario.value = false
    await cargarDatos()
}

async function desasignarVeterinario(v) {
    await ganaderoService.desasignarVeterinario(idFinca, v.identificacion_usuario)
    await cargarDatos()
}

async function asignarAyudante(a) {
    await ganaderoService.asignarAyudante(idFinca, a.identificacion_usuario)
    modalAyudante.value = false
    await cargarDatos()
}

async function desasignarAyudante(a) {
    await ganaderoService.desasignarAyudante(a.identificacion_usuario)
    await cargarDatos()
}

onMounted(cargarDatos)
</script>

<style scoped>
.info-card {
    background: white;
    padding: 1rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    margin-bottom: 1rem;
}

.info-card h3 {
    margin: 0;
    color: #2d6a4f;
}

.info-card p {
    margin: 0.25rem 0 0;
    color: #888;
}

.seccion {
    margin-bottom: 1.5rem;
}

.seccion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.seccion-header h4 {
    margin: 0;
    color: #444;
}
</style>