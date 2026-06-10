<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="success">
                <ion-buttons slot="start">
                    <ion-back-button :default-href="backHref" />
                </ion-buttons>
                <ion-title>Pesajes por aceptar</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <div v-if="!online" class="banner-offline">
                <ion-icon :icon="cloudOfflineOutline" />
                <span>Sin conexión. Las capturas se estimarán al recuperar internet.</span>
            </div>

            <div v-if="estimando" class="banner-info">
                <ion-spinner name="crescent" /> <span>Estimando pesos pendientes...</span>
            </div>

            <div v-if="loading" class="ion-text-center ion-padding"><ion-spinner /></div>

            <div v-else-if="pendientes.length === 0" class="vacio-box">
                <ion-icon :icon="checkmarkCircle" />
                <p>No hay pesajes por aceptar.</p>
            </div>

            <div v-else>
                <div v-for="p in pendientes" :key="p.id" class="card">
                    <img :src="p.preview" alt="captura" class="foto" />

                    <div class="meta">
                        <span>{{ p.sexo === 'M' ? 'Macho' : 'Hembra' }}</span>
                        <span>{{ formatFecha(p.fecha_captura) }}</span>
                    </div>

                    <!-- En cola, sin error: aun por estimar -->
                    <div v-if="p.peso_estimado == null && !p.error_estim" class="sin-estimar">
                        <ion-icon :icon="cloudOfflineOutline" />
                        <span>{{ online ? 'Estimando...' : 'Se estimará al conectar' }}</span>
                    </div>

                    <!-- Estimado o con error: en ambos casos se puede guardar con peso manual -->
                    <template v-else>
                        <!-- Estimacion fallida: motivo + opcion de reintentar / peso manual -->
                        <div v-if="p.error_estim" class="error-estim">
                            <ion-icon :icon="alertCircleOutline" />
                            <div>
                                <strong>No se pudo estimar automáticamente.</strong>
                                <p>{{ p.error_estim }}</p>
                                <p class="error-hint">Ingresa el peso a mano o reintenta.</p>
                            </div>
                        </div>
                        <!-- Estimacion correcta -->
                        <div v-else class="estimado-row">
                            <span class="estimado-label">Peso estimado</span>
                            <span class="estimado-val">{{ p.peso_estimado }} kg</span>
                        </div>

                        <ion-item>
                            <ion-label position="stacked">Peso a guardar (kg)</ion-label>
                            <ion-input v-model="p.pesoEdit" type="number" inputmode="decimal" min="1" />
                        </ion-item>

                        <p class="campo-label">Animal</p>
                        <!-- Animal elegido: foto + datos, igual que el flujo online -->
                        <div v-if="p.animalSelInfo" class="animal-elegido">
                            <ion-thumbnail v-if="p.animalSelInfo.foto_animal">
                                <img :src="fotoUrl(p.animalSelInfo.foto_animal)" alt="foto" />
                            </ion-thumbnail>
                            <ion-icon v-else :icon="pawOutline" class="animal-icono" />
                            <div class="animal-datos">
                                <h4>{{ p.animalSelInfo.nombre_animal || 'Sin nombre' }}</h4>
                                <p>Arete: {{ p.animalSelInfo.n_arete }} · Peso actual: {{ p.animalSelInfo.peso ?? '-' }} kg</p>
                            </div>
                            <ion-button fill="clear" size="small" @click="abrirSelector(p)">Cambiar</ion-button>
                        </div>
                        <ion-button v-else expand="block" fill="outline" class="btn-elegir" @click="abrirSelector(p)">
                            <ion-icon :icon="pawOutline" slot="start" /> Elegir animal
                        </ion-button>

                        <div class="acciones">
                            <ion-button v-if="p.error_estim && online" fill="outline" size="small"
                                :disabled="procesando === p.id" @click="reintentar(p)">
                                Reintentar
                            </ion-button>
                            <ion-button expand="block" class="btn-aceptar"
                                :disabled="!p.animalSel || !(Number(p.pesoEdit) > 0) || procesando === p.id"
                                @click="aceptar(p)">
                                {{ procesando === p.id ? 'Guardando...' : 'Aceptar y guardar' }}
                            </ion-button>
                            <ion-button fill="clear" color="medium" :disabled="procesando === p.id" @click="descartar(p)">
                                <ion-icon :icon="trashOutline" slot="icon-only" />
                            </ion-button>
                        </div>
                    </template>
                </div>
            </div>
        </ion-content>

        <selector-animal-modal
            :is-open="selectorAbierto"
            :service="service"
            @dismiss="selectorAbierto = false"
            @select="onAnimalElegido"
        />
    </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner,
    IonItem, IonLabel, IonInput, IonThumbnail,
    alertController, onIonViewWillEnter,
} from '@ionic/vue'
import { cloudOfflineOutline, trashOutline, checkmarkCircle, alertCircleOutline, pawOutline } from 'ionicons/icons'
import { colaPesajes } from '../services/colaPesajes'
import { comprimirImagen, fotoUrl } from '../services/media'
import { estimarPendientes } from '../services/sincronizar'
import { useOnline } from '../composables/useOnline'
import SelectorAnimalModal from './SelectorAnimalModal.vue'

const props = defineProps({
    // ganadero: { estimarPeso, crearPesaje, getFincas, getAnimales(idFinca) }
    // ayudante: { estimarPeso, crearPesaje, getAnimales() }
    service: { type: Object, required: true },
    backHref: { type: String, required: true },
})

const online = useOnline()
const loading = ref(true)
const estimando = ref(false)
const procesando = ref(null)
const pendientes = ref([])

// Selector de animal (mismo flujo que el pesaje online: finca -> animal con foto).
const selectorAbierto = ref(false)
const itemEnSeleccion = ref(null)

function formatFecha(iso) {
    return new Date(iso).toLocaleString('es-CR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

let cargando = false
async function cargar() {
    // Guard: onMounted y onIonViewWillEnter pueden invocar a la vez en la primera carga.
    if (cargando) return
    cargando = true
    loading.value = true
    try {
        // Muestra la lista de inmediato; la estimacion corre despues en segundo plano.
        await refrescarLista()
        loading.value = false

        // Estimacion en segundo plano (en CPU puede tardar varios segundos por foto).
        // La pagina ya esta visible; los items sin peso muestran "Estimando...".
        const faltan = pendientes.value.some(p => p.peso_estimado == null && !p.error_estim)
        if (online.value && faltan) {
            estimando.value = true
            try {
                await estimarPendientes(props.service)
                await refrescarLista()
            } finally {
                estimando.value = false
            }
        }
    } finally {
        loading.value = false
        cargando = false
    }
}

async function refrescarLista() {
    const items = await colaPesajes.listar()
    pendientes.value = items.map(p => ({
        ...p,
        preview: URL.createObjectURL(p.foto),
        pesoEdit: p.peso_estimado ?? '',
        animalSel: null,      // n_arete elegido
        animalSelInfo: null,  // objeto animal para mostrar foto/datos
    }))
}

// Abre el selector de animal para una captura concreta.
function abrirSelector(p) {
    itemEnSeleccion.value = p
    selectorAbierto.value = true
}

function onAnimalElegido(animal) {
    const p = itemEnSeleccion.value
    if (p) {
        p.animalSel = animal.n_arete
        p.animalSelInfo = animal
    }
    selectorAbierto.value = false
}

async function aceptar(p) {
    procesando.value = p.id
    try {
        // La foto es opcional en el backend. Si esta corrupta (la misma causa por la
        // que fallo la estimacion), reintentamos sin foto para no bloquear el guardado.
        const conFoto = !p.error_estim
        try {
            await props.service.crearPesaje(p.animalSel, await construirFormData(p, conFoto))
        } catch (e) {
            const fotoInvalida = e.response?.status === 422 && e.response?.data?.errors?.foto
            if (!conFoto || !fotoInvalida) throw e
            // La foto no paso validacion: guarda solo el peso (sin foto).
            await props.service.crearPesaje(p.animalSel, await construirFormData(p, false))
        }
        await colaPesajes.eliminar(p.id)
        await refrescarLista()
    } catch (e) {
        alert(e.response?.data?.message || 'No se pudo guardar el pesaje.')
    } finally {
        procesando.value = null
    }
}

async function construirFormData(p, incluirFoto) {
    const fd = new FormData()
    fd.append('peso_aproximado', Number(p.pesoEdit))
    fd.append('sexo', p.sexo)
    if (incluirFoto) {
        // Comprime por si es una captura vieja sin comprimir (supera el limite de PHP).
        const fotoBlob = await comprimirImagen(p.foto)
        fd.append('foto', fotoBlob, p.foto.name || 'captura.jpg')
    }
    return fd
}

// Limpia el error y vuelve a intentar la estimacion de ese item.
async function reintentar(p) {
    await colaPesajes.actualizar(p.id, { error_estim: null })
    await refrescarLista()
    estimando.value = true
    try {
        await estimarPendientes(props.service)
        await refrescarLista()
    } finally {
        estimando.value = false
    }
}

async function descartar(p) {
    const alert = await alertController.create({
        header: 'Descartar captura',
        message: '¿Eliminar esta captura sin guardarla?',
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Descartar', role: 'destructive',
                handler: async () => {
                    await colaPesajes.eliminar(p.id)
                    await refrescarLista()
                },
            },
        ],
    })
    await alert.present()
}

// onMounted garantiza la carga inicial (onIonViewWillEnter no dispara fiable en
// este componente hijo). onIonViewWillEnter cubre las re-entradas a la vista cacheada.
// El guard 'cargando' evita que ambos corran a la vez en la primera carga.
onMounted(cargar)
onIonViewWillEnter(cargar)
</script>

<style scoped>
.banner-offline, .banner-info {
    display: flex; gap: 0.5rem; align-items: center;
    border-radius: 12px; padding: 0.7rem 0.9rem; margin-bottom: 1rem; font-size: 0.82rem;
}
.banner-offline { background: #fff6e6; border: 1px solid #f0d9a8; color: #8a6d1f; }
.banner-offline ion-icon { font-size: 1.3rem; color: #d4a017; }
.banner-info { background: #eef5f1; border: 1px solid #cfe3d8; color: #2d6a4f; }

.vacio-box { text-align: center; color: #8aa; padding: 3rem 1rem; }
.vacio-box ion-icon { font-size: 3.5rem; color: #2d6a4f; }
.vacio-box p { color: #888; }

.card {
    background: #fff; border-radius: 14px; padding: 0.85rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 1rem;
}
.foto { width: 100%; max-height: 220px; object-fit: contain; border-radius: 10px; background: #f4f4f4; }
.meta { display: flex; justify-content: space-between; color: #888; font-size: 0.8rem; margin: 0.5rem 0; }

.sin-estimar {
    display: flex; align-items: center; gap: 0.4rem;
    color: #b8860b; font-size: 0.85rem; padding: 0.5rem 0;
}

.error-estim {
    display: flex; gap: 0.5rem; align-items: flex-start;
    background: #fdecea; border: 1px solid #f5c6c2; border-radius: 10px;
    padding: 0.6rem 0.8rem; margin-bottom: 0.5rem; color: #a23b32;
}
.error-estim ion-icon { font-size: 1.3rem; flex-shrink: 0; color: #c0392b; margin-top: 1px; }
.error-estim strong { font-size: 0.88rem; }
.error-estim p { margin: 0.2rem 0 0; font-size: 0.8rem; }
.error-estim .error-hint { color: #8a6d1f; }

.estimado-row {
    display: flex; justify-content: space-between; align-items: center;
    background: #2d6a4f; color: #fff; border-radius: 10px; padding: 0.6rem 0.9rem; margin-bottom: 0.5rem;
}
.estimado-val { font-size: 1.3rem; font-weight: 700; }

.acciones { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.75rem; }
.acciones .btn-aceptar { flex: 1; --background: #2d6a4f; --border-radius: 10px; font-weight: 600; }

.campo-label { color: #555; font-size: 0.85rem; margin: 0.75rem 0 0.35rem; font-weight: 600; }
.btn-elegir { --color: #2d6a4f; --border-color: #2d6a4f; }

.animal-elegido {
    display: flex; align-items: center; gap: 0.6rem;
    background: #eef5f1; border: 1px solid #cfe3d8; border-radius: 10px; padding: 0.5rem 0.6rem;
}
.animal-elegido ion-thumbnail { --size: 48px; }
.animal-elegido ion-thumbnail img { object-fit: cover; border-radius: 8px; }
.animal-icono { font-size: 2rem; color: #2d6a4f; }
.animal-datos { flex: 1; min-width: 0; }
.animal-datos h4 { margin: 0; color: #2d6a4f; font-size: 0.95rem; }
.animal-datos p { margin: 0.1rem 0 0; color: #6b7b73; font-size: 0.8rem; }
</style>
