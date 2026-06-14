<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="success">
                <ion-buttons slot="start">
                    <ion-button @click="retroceder">
                        <ion-icon :icon="arrowBackOutline" />
                    </ion-button>
                </ion-buttons>
                <ion-title>Captura Rápida</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">

            <!-- PASO 1: foto + sexo -->
            <div v-if="paso === 'captura'" class="paso">
                <h2 class="titulo">Toma una foto lateral</h2>
                <p class="sub">Vaca completa de perfil, parada, con buena luz.</p>

                <div v-if="!online" class="banner-offline">
                    <ion-icon :icon="cloudOfflineOutline" />
                    <span>Sin conexión. Tomarás la foto y elegirás el animal; se estimará y guardará al recuperar internet.</span>
                </div>

                <!-- Guia de distancia / encuadre -->
                <div class="info-card">
                    <div class="info-head">
                        <ion-icon :icon="informationCircleOutline" />
                        <span>¿Cómo tomar la foto?</span>
                    </div>
                    <ul>
                        <li><strong>Distancia:</strong> 3 a 5 m. La vaca debe llenar 70–90% del ancho.</li>
                        <li><strong>Ángulo:</strong> de costado (perfil 90°), no en diagonal.</li>
                        <li><strong>Cuerpo completo:</strong> del morro a la cola y de pezuñas a lomo.</li>
                        <li><strong>Altura:</strong> cámara a la mitad del cuerpo del animal.</li>
                        <li><strong>Animal:</strong> parado y recto, sobre suelo plano.</li>
                        <li><strong>Luz:</strong> difusa, sin contraluz ni sombras fuertes.</li>
                    </ul>
                    <p class="info-tip">Usa siempre una distancia y ángulo parecidos para resultados consistentes.</p>
                </div>

                <label class="foto-box">
                    <img v-if="fotoPreview" :src="fotoPreview" class="preview" />
                    <div v-else class="foto-placeholder">
                        <ion-icon :icon="cameraOutline" class="cam-icon" />
                        <span>Tocar para tomar / subir foto</span>
                    </div>
                    <input type="file" accept="image/*" capture="environment" hidden @change="onFoto" />
                </label>

                <p class="campo-label">Sexo del animal <span class="req">*</span></p>
                <ion-segment v-model="sexo" :class="{ 'segment-error': mostrarSexoError }">
                    <ion-segment-button value="F"><ion-label>Hembra</ion-label></ion-segment-button>
                    <ion-segment-button value="M"><ion-label>Macho</ion-label></ion-segment-button>
                </ion-segment>
                <p v-if="mostrarSexoError" class="aviso-sexo">
                    <ion-icon :icon="alertCircleOutline" /> Por favor selecciona el sexo del animal.
                </p>

                <ion-button expand="block" class="btn-primario ion-margin-top"
                    :disabled="loading" @click="estimar">
                    <ion-spinner v-if="loading" name="crescent" />
                    <span v-else>{{ online ? 'Estimar peso' : 'Continuar sin conexión' }}</span>
                </ion-button>
            </div>

            <!-- PASO 2: resultado + corregir -->
            <div v-else-if="paso === 'resultado'" class="paso">
                <h2 class="titulo">Peso estimado</h2>
                <div class="resultado-card">
                    <span class="peso-num">{{ pesoFinal }}</span>
                    <span class="peso-unidad">kg</span>
                </div>

                <div class="aviso-estimacion">
                    <ion-icon :icon="warningOutline" />
                    <span>
                        Este valor es una <strong>estimación</strong> a partir de la foto y
                        puede variar aproximadamente <strong>±15%</strong> respecto al peso real.
                        No reemplaza una báscula. Si conoces el peso real, corrígelo abajo.
                    </span>
                </div>

                <ion-item class="corregir">
                    <ion-label position="stacked">Peso (kg)</ion-label>
                    <ion-input v-model="pesoFinal" type="number" inputmode="decimal" min="1" />
                </ion-item>

                <ion-button expand="block" class="btn-primario ion-margin-top"
                    :disabled="!pesoValido" @click="paso = 'finca'; cargarFincas()">
                    Aceptar y guardar
                </ion-button>
                <ion-button expand="block" fill="outline" class="btn-sec" @click="reiniciarCaptura">
                    Tomar otra foto
                </ion-button>
                <ion-button expand="block" fill="clear" class="btn-link" @click="volverMenu">
                    Solo ver, regresar al menú
                </ion-button>
            </div>

            <!-- PASO 3: elegir finca -->
            <div v-else-if="paso === 'finca'" class="paso">
                <h2 class="titulo">¿En qué finca estás?</h2>
                <p class="sub">Mostraremos solo los animales de esa finca.</p>

                <div v-if="loading" class="ion-text-center ion-padding"><ion-spinner /></div>
                <ion-list v-else>
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
            </div>

            <!-- PASO 4: elegir animal -->
            <div v-else-if="paso === 'animal'" class="paso">
                <h2 class="titulo">¿A cuál animal corresponde?</h2>
                <p class="sub">Finca: {{ fincaSel?.nombre_finca }}</p>

                <ion-searchbar v-model="busqueda" placeholder="Buscar por arete o nombre" />

                <div v-if="loading" class="ion-text-center ion-padding"><ion-spinner /></div>
                <ion-list v-else>
                    <ion-item button v-for="a in animalesFiltrados" :key="a.n_arete" @click="guardar(a)">
                        <ion-icon :icon="pawOutline" slot="start" color="success" />
                        <ion-label>
                            <h3>{{ a.nombre_animal || 'Sin nombre' }}</h3>
                            <p>Arete: {{ a.n_arete }} · Peso actual: {{ a.peso ?? '-' }} kg</p>
                        </ion-label>
                    </ion-item>
                    <ion-item v-if="animalesFiltrados.length === 0">
                        <ion-label class="ion-text-center">No hay animales en esta finca.</ion-label>
                    </ion-item>
                </ion-list>
            </div>

            <!-- PASO 5: guardado -->
            <div v-else-if="paso === 'guardado'" class="paso ion-text-center">
                <ion-icon :icon="checkmarkCircle" class="ok-icon" />
                <h2 class="titulo">¡Pesaje guardado!</h2>
                <p class="sub">
                    {{ animalSel?.nombre_animal || animalSel?.n_arete }} ahora pesa
                    <strong>{{ pesoFinal }} kg</strong>.
                </p>
                <ion-button expand="block" class="btn-primario ion-margin-top" @click="volverMenu">
                    Regresar al menú
                </ion-button>
                <ion-button expand="block" fill="outline" class="btn-sec" @click="reiniciarTodo">
                    Pesar otro animal
                </ion-button>
            </div>

            <!-- OFFLINE: guardado en cola -->
            <div v-else-if="paso === 'offline_guardado'" class="paso ion-text-center">
                <ion-icon :icon="cloudOfflineOutline" class="ok-icon offline-icon" />
                <h2 class="titulo">Guardado sin conexión</h2>
                <p class="sub">
                    La foto quedó en cola. Al recuperar internet se estimará el peso;
                    luego en "Pendientes" asignas el animal y aceptas.
                </p>
                <ion-button expand="block" class="btn-primario ion-margin-top" @click="volverMenu">
                    Regresar al menú
                </ion-button>
                <ion-button expand="block" fill="outline" class="btn-sec" @click="reiniciarTodo">
                    Otra captura
                </ion-button>
            </div>

            <p v-if="error" class="error">{{ error }}</p>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon, IonSpinner,
    IonSegment, IonSegmentButton, IonLabel, IonItem, IonInput,
    IonList, IonSearchbar, onIonViewWillEnter,
} from '@ionic/vue'
import {
    arrowBackOutline, cameraOutline, homeOutline, pawOutline,
    checkmarkCircle, informationCircleOutline, alertCircleOutline, warningOutline,
    cloudOfflineOutline,
} from 'ionicons/icons'
import { ganaderoService } from '../../services/ganadero'
import { colaPesajes } from '../../services/colaPesajes'
import { comprimirImagen } from '../../services/media'
import { useOnline } from '../../composables/useOnline'
import { paths } from '../../router/paths'

const router = useRouter()
const online = useOnline()

const paso = ref('captura')        // captura -> resultado -> finca -> animal -> guardado
const loading = ref(false)
const error = ref('')

const fotoFile = ref(null)
const fotoPreview = ref('')
const sexo = ref('')
const mostrarSexoError = ref(false)
const pesoEstimado = ref(null)
const pesoFinal = ref('')

// Limpia el aviso al elegir sexo.
watch(sexo, (v) => { if (v) mostrarSexoError.value = false })

// Ionic cachea la vista: al volver a entrar, reinicia todo.
onIonViewWillEnter(() => reiniciarTodo())

const fincas = ref([])
const fincaSel = ref(null)
const animales = ref([])
const animalSel = ref(null)
const busqueda = ref('')

const pesoValido = computed(() => Number(pesoFinal.value) > 0)

const animalesFiltrados = computed(() => {
    const q = busqueda.value.trim().toLowerCase()
    if (!q) return animales.value
    return animales.value.filter(a =>
        String(a.n_arete).toLowerCase().includes(q) ||
        (a.nombre_animal || '').toLowerCase().includes(q))
})

async function onFoto(e) {
    const f = e.target.files?.[0]
    if (!f) return
    error.value = ''
    // Comprime antes de usarla: evita superar el limite de subida de PHP y reduce
    // lo que se guarda en la cola offline. Sirve igual para estimar y para encolar.
    fotoFile.value = await comprimirImagen(f)
    fotoPreview.value = URL.createObjectURL(fotoFile.value)
}

async function estimar() {
    if (!fotoFile.value) {
        error.value = 'Primero toma o sube una foto.'
        return
    }
    if (!sexo.value) {
        mostrarSexoError.value = true
        return
    }
    error.value = ''

    // Sin conexion: se encola la foto. Se estimara y asignara animal al reconectar.
    if (!online.value) {
        return guardarOffline()
    }

    loading.value = true
    try {
        const fd = new FormData()
        fd.append('foto', fotoFile.value)
        fd.append('sexo', sexo.value)
        const { data } = await ganaderoService.estimarPeso(fd)
        pesoEstimado.value = data.peso_estimado_kg
        pesoFinal.value = data.peso_estimado_kg
        paso.value = 'resultado'
    } catch (e) {
        error.value = e.response?.data?.message || 'No se pudo estimar el peso. Revisa la foto.'
    } finally {
        loading.value = false
    }
}

async function cargarFincas() {
    error.value = ''
    loading.value = true
    try {
        const { data } = await ganaderoService.getFincas()
        fincas.value = data
    } catch {
        error.value = 'No se pudieron cargar las fincas.'
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
        const { data } = await ganaderoService.getAnimales(f.id_finca)
        animales.value = data
    } catch {
        error.value = 'No se pudieron cargar los animales.'
    } finally {
        loading.value = false
    }
}

async function guardar(a) {
    error.value = ''
    loading.value = true
    try {
        const fd = new FormData()
        fd.append('peso_aproximado', Number(pesoFinal.value))
        fd.append('sexo', sexo.value)
        if (fotoFile.value) fd.append('foto', fotoFile.value)
        await ganaderoService.crearPesaje(a.n_arete, fd)
        animalSel.value = a
        paso.value = 'guardado'
    } catch (e) {
        error.value = e.response?.data?.message || 'No se pudo guardar el pesaje.'
    } finally {
        loading.value = false
    }
}

// Offline: guarda la captura (foto + sexo) en la cola local. El animal se asigna al aceptar.
async function guardarOffline() {
    error.value = ''
    loading.value = true
    try {
        await colaPesajes.encolar({ sexo: sexo.value, foto: fotoFile.value })
        paso.value = 'offline_guardado'
    } catch {
        error.value = 'No se pudo guardar la captura localmente.'
    } finally {
        loading.value = false
    }
}

function reiniciarCaptura() {
    fotoFile.value = null
    fotoPreview.value = ''
    pesoEstimado.value = null
    pesoFinal.value = ''
    mostrarSexoError.value = false
    error.value = ''
    paso.value = 'captura'
}

function reiniciarTodo() {
    reiniciarCaptura()
    sexo.value = ''
    busqueda.value = ''
    fincas.value = []
    fincaSel.value = null
    animalSel.value = null
    animales.value = []
}

function volverMenu() {
    router.push(paths.ganadero.menu)
}

// Boton atras del header: retrocede un paso segun el flujo.
function retroceder() {
    switch (paso.value) {
        case 'captura':          return volverMenu()
        case 'resultado':        return reiniciarCaptura()
        case 'finca':            paso.value = 'resultado'; return
        case 'animal':           paso.value = 'finca'; return
        case 'guardado':         return volverMenu()
        case 'offline_guardado': return volverMenu()
    }
}
</script>

<style scoped>
.paso { max-width: 480px; margin: 0 auto; }

.titulo { color: #2d6a4f; margin: 0.5rem 0 0.25rem; }
.sub { color: #888; font-size: 0.85rem; margin: 0 0 1rem; }

.foto-box {
    display: block;
    border: 2px dashed #b7d3c4;
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    background: #f4f8f6;
}
.preview { display: block; width: 100%; max-height: 320px; object-fit: contain; }
.foto-placeholder {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 0.5rem; padding: 3rem 1rem; color: #2d6a4f;
}
.cam-icon { font-size: 3rem; }

.resultado-card {
    background: #2d6a4f; color: #fff; border-radius: 16px;
    padding: 1.75rem; text-align: center; margin-bottom: 0.75rem;
}
.peso-num { font-size: 3rem; font-weight: 700; }
.peso-unidad { font-size: 1.25rem; margin-left: 0.35rem; }

.corregir { --background: #fff; border-radius: 10px; margin-top: 0.5rem; }

.info-card {
    background: #eef5f1;
    border: 1px solid #cfe3d8;
    border-radius: 12px;
    padding: 0.85rem 1rem;
    margin-bottom: 1rem;
}
.info-head {
    display: flex; align-items: center; gap: 0.4rem;
    color: #2d6a4f; font-weight: 600; margin-bottom: 0.5rem;
}
.info-head ion-icon { font-size: 1.2rem; }
.info-card ul { margin: 0; padding-left: 1.1rem; }
.info-card li { color: #4a5a52; font-size: 0.82rem; margin: 0.2rem 0; }
.info-card li strong { color: #2d6a4f; }
.info-tip { color: #6b7b73; font-size: 0.78rem; font-style: italic; margin: 0.5rem 0 0; }

.campo-label { color: #555; font-size: 0.85rem; margin: 1rem 0 0.35rem; font-weight: 600; }
.req { color: #c0392b; }
.segment-error { border: 1.5px solid #c0392b; border-radius: 10px; }
.aviso-sexo {
    display: flex; align-items: center; gap: 0.35rem;
    color: #c0392b; font-size: 0.8rem; margin: 0.4rem 0 0;
}

.aviso-estimacion {
    display: flex; gap: 0.5rem; align-items: flex-start;
    background: #fff6e6; border: 1px solid #f0d9a8; border-radius: 12px;
    padding: 0.75rem 0.9rem; margin-bottom: 0.75rem;
    color: #8a6d1f; font-size: 0.82rem; line-height: 1.35;
}
.aviso-estimacion ion-icon { font-size: 1.3rem; flex-shrink: 0; color: #d4a017; margin-top: 1px; }
.aviso-estimacion strong { color: #6b540f; }

.btn-primario { --background: #2d6a4f; --border-radius: 10px; font-weight: 600; }
.btn-sec { --color: #2d6a4f; --border-color: #2d6a4f; margin-top: 0.5rem; }
.btn-link { --color: #888; margin-top: 0.25rem; }

.ok-icon { font-size: 4.5rem; color: #2d6a4f; margin-top: 1.5rem; }
.offline-icon { color: #b8860b; }

.banner-offline {
    display: flex; gap: 0.5rem; align-items: flex-start;
    background: #fff6e6; border: 1px solid #f0d9a8; border-radius: 12px;
    padding: 0.7rem 0.9rem; margin-bottom: 1rem;
    color: #8a6d1f; font-size: 0.82rem; line-height: 1.35;
}
.banner-offline ion-icon { font-size: 1.3rem; flex-shrink: 0; color: #d4a017; }

.error { color: #c0392b; text-align: center; font-size: 0.85rem; margin-top: 1rem; }
</style>
