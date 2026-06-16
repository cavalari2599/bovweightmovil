<template>
    <ion-page class="tratamientos-page">
        <ion-header class="ion-no-border">
            <ion-toolbar class="bw-toolbar">
                <ion-buttons slot="start">
                    <ion-back-button :default-href="paths.veterinario.animales(idFinca)" text="" />
                </ion-buttons>
                <div slot="start" class="bw-brand">
                    <img src="../../assets/cow-icon.png" alt="BovWeight CR" class="bw-brand-img" />
                </div>
                <ion-title>Tratamientos</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="handleLogout">
                        <ion-icon :icon="logOutOutline" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="bw-content">
            <ion-searchbar v-model="busqueda" class="bw-search" placeholder="Buscar tratamiento..." />

            <button class="bw-add" @click="abrirModal">
                <ion-icon :icon="addOutline" />
                Nuevo tratamiento
            </button>

            <div v-if="loading" class="bw-estado">
                <ion-spinner name="crescent" />
                <p>Cargando tratamientos...</p>
            </div>

            <div v-else class="trat-lista">
                <div v-for="t in tratamientosFiltrados" :key="t.id_tratamiento" class="trat-card">
                    <div class="trat-top">
                        <div class="trat-ico"><ion-icon :icon="medkitOutline" /></div>
                        <div class="trat-info">
                            <span class="trat-titulo">{{ t.tipo_tratamiento }}</span>
                            <span class="trat-med">Medicamento: {{ t.medicamento || '-' }}</span>
                            <span v-if="t.descripcion" class="trat-desc">{{ t.descripcion }}</span>
                        </div>
                    </div>
                    <div class="trat-fechas">
                        <span>Inicio: {{ formatFecha(t.fecha_inicio) }}</span>
                        <span>Fin: {{ t.fecha_fin ? formatFecha(t.fecha_fin) : 'En curso' }}</span>
                    </div>
                </div>

                <p v-if="tratamientos.length === 0" class="bw-vacio">No hay tratamientos registrados.</p>
                <p v-else-if="tratamientosFiltrados.length === 0" class="bw-vacio">No se encontraron tratamientos.</p>
            </div>

        </ion-content>

        <!-- Modal nuevo tratamiento -->
        <ion-modal :is-open="modalAbierto" @did-dismiss="cerrarModal">
            <ion-header class="ion-no-border">
                <ion-toolbar class="bw-toolbar-modal">
                    <ion-title>Nuevo Tratamiento</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="cerrarModal">Cancelar</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>

            <ion-content class="ion-padding modal-content">
                <!-- Vaca que sigue el cursor / los toques -->
                <div class="cow-peek">
                    <img src="../../assets/cow-icon.png" alt="" class="cow-img" />
                </div>

                <div class="campo">
                    <label class="campo-label">Tipo de tratamiento</label>
                    <ion-input fill="outline" v-model="form.tipo_tratamiento" placeholder="Ej. Vacunación">
                        <ion-icon :icon="medkitOutline" slot="start" aria-hidden="true" />
                    </ion-input>
                    <p v-if="errores.tipo_tratamiento" class="campo-error">{{ errores.tipo_tratamiento }}</p>
                </div>

                <div class="campo">
                    <label class="campo-label">Medicamento</label>
                    <ion-input fill="outline" v-model="form.medicamento" placeholder="Ej. Ivermectina">
                        <ion-icon :icon="medicalOutline" slot="start" aria-hidden="true" />
                    </ion-input>
                    <p v-if="errores.medicamento" class="campo-error">{{ errores.medicamento }}</p>
                </div>

                <div class="campo">
                    <label class="campo-label">Descripción</label>
                    <ion-textarea fill="outline" v-model="form.descripcion" placeholder="Detalle del tratamiento"
                        :auto-grow="true" />
                    <p v-if="errores.descripcion" class="campo-error">{{ errores.descripcion }}</p>
                </div>

                <div class="campo">
                    <label class="campo-label">Fecha de inicio</label>
                    <div class="fecha-box">
                        <ion-datetime presentation="date" v-model="form.fecha_inicio" :prefer-wheel="false"
                            max="2030-12-31" />
                    </div>
                    <p v-if="errores.fecha_inicio" class="campo-error">{{ errores.fecha_inicio }}</p>
                </div>

                <div class="campo">
                    <label class="campo-label">Fecha de fin</label>
                    <div class="fecha-box">
                        <ion-datetime presentation="date" v-model="form.fecha_fin" :prefer-wheel="false"
                            max="2030-12-31" />
                    </div>
                    <p v-if="errores.fecha_fin" class="campo-error">{{ errores.fecha_fin }}</p>
                </div>

                <p v-if="error" class="error">{{ error }}</p>

                <ion-button expand="block" class="bw-guardar ion-margin-top" :disabled="guardando"
                    @click="guardarTratamiento">
                    {{ guardando ? 'Guardando...' : 'Guardar' }}
                </ion-button>
            </ion-content>
        </ion-modal>
    </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonIcon, IonSpinner, IonButtons, IonBackButton, IonButton,
    IonModal, IonInput, IonTextarea, IonDatetime, IonSearchbar
} from '@ionic/vue'
import { addOutline, logOutOutline, medkitOutline, medicalOutline } from 'ionicons/icons'
import { veterinarioService } from '../../services/veterinario'
import { useAuthStore } from '../../stores/auth'
import { paths } from '../../router/paths'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const nArete = route.params.nArete
const idFinca = route.query.idFinca

const tratamientos = ref([])
const loading = ref(true)
const busqueda = ref('')
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

const errores = ref({
    tipo_tratamiento: '',
    medicamento: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
})

// Vaca que sigue el cursor
const pupilaIzq = ref(null)
const pupilaDer = ref(null)

function moverPupila(el, x, y) {
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const ang = Math.atan2(y - cy, x - cx)
    const max = 3
    el.style.transform = `translate(${Math.cos(ang) * max}px, ${Math.sin(ang) * max}px)`
}

function onMove(e) {
    const p = e.touches ? e.touches[0] : e
    if (!p) return
    moverPupila(pupilaIzq.value, p.clientX, p.clientY)
    moverPupila(pupilaDer.value, p.clientX, p.clientY)
}

const tratamientosFiltrados = computed(() => {
    const texto = busqueda.value.trim().toLowerCase()
    if (!texto) return tratamientos.value
    return tratamientos.value.filter((t) =>
        (t.tipo_tratamiento ?? '').toLowerCase().includes(texto) ||
        (t.medicamento ?? '').toLowerCase().includes(texto)
    )
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
    errores.value = { tipo_tratamiento: '', medicamento: '', descripcion: '', fecha_inicio: '', fecha_fin: '' }
    form.value = {
        tipo_tratamiento: '',
        medicamento: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
    }
}

// Validación: todos requeridos + la fecha de fin no puede ser anterior a la de inicio
function validar() {
    const e = { tipo_tratamiento: '', medicamento: '', descripcion: '', fecha_inicio: '', fecha_fin: '' }
    const f = form.value

    if (!f.tipo_tratamiento?.trim()) e.tipo_tratamiento = 'El campo tipo de tratamiento es requerido.'
    if (!f.medicamento?.trim()) e.medicamento = 'El campo medicamento es requerido.'
    if (!f.descripcion?.trim()) e.descripcion = 'El campo descripción es requerido.'
    if (!f.fecha_inicio) e.fecha_inicio = 'La fecha de inicio es requerida.'
    if (!f.fecha_fin) e.fecha_fin = 'La fecha de fin es requerida.'

    if (f.fecha_inicio && f.fecha_fin) {
        if (new Date(f.fecha_inicio) > new Date(f.fecha_fin)) {
            e.fecha_fin = 'La fecha de fin no puede ser anterior a la de inicio.'
        }
    }

    errores.value = e
    return !Object.values(e).some(Boolean)
}

async function guardarTratamiento() {
    error.value = ''
    if (!validar()) return

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

function formatFecha(fecha) {
    if (!fecha) return '-'
    const d = new Date(fecha)
    return isNaN(d) ? fecha : d.toLocaleDateString('es-CR')
}

async function handleLogout() {
    await auth.logout()
    router.push(paths.login)
}

onMounted(() => {
    cargarTratamientos()
    window.addEventListener('mousemove', onMove)
    window.addEventListener('click', onMove)
    window.addEventListener('touchmove', onMove, { passive: true })
})

onUnmounted(() => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('click', onMove)
    window.removeEventListener('touchmove', onMove)
})
</script>

<style scoped>
.tratamientos-page {
    --bw-dark: #0f2318;
    --bw-primary: #1D9E75;
    --bw-pale: rgba(29, 158, 117, 0.12);
    --bw-bg: #0f2318;
    --bw-card: rgba(255, 255, 255, 0.05);
    --bw-border: rgba(255, 255, 255, 0.09);
    --bw-text: #ffffff;
    --bw-muted: rgba(255, 255, 255, 0.5);
}

/* ── Header ── */
.bw-toolbar {
    --background: var(--bw-dark);
    --color: #ffffff;
    --border-width: 0;
    border-bottom: 2px solid var(--bw-primary);
}
.bw-toolbar ion-title {
    font-family: Georgia, serif;
}

.bw-brand {
    display: flex;
    align-items: center;
    padding-inline-start: 2px;
}

.bw-brand-img {
    width: 26px;
    height: 26px;
    object-fit: contain;
    filter: brightness(0) invert(1);
}

.cow-img {
    width: 70px;
    height: auto;
    filter: invert(25%) sepia(50%) saturate(600%) hue-rotate(112deg) brightness(75%) contrast(95%);
}

/* ── Contenido ── */
.bw-content {
    --background: var(--bw-bg);
}

.bw-search {
    --background: rgba(255, 255, 255, 0.06);
    --border-radius: 12px;
    --box-shadow: none;
    --color: var(--bw-text);
    --placeholder-color: var(--bw-muted);
    --icon-color: var(--bw-primary);
    padding: 12px 14px 6px;
}

.bw-search :deep(.searchbar-input) {
    height: 42px;
}

/* ── Botón nuevo tratamiento ── */
.bw-add {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    width: calc(100% - 28px);
    margin: 2px 14px 10px;
    background: var(--bw-primary);
    color: #ffffff;
    border: none;
    border-radius: 12px;
    padding: 12px;
    font-family: inherit;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
}

.bw-add ion-icon {
    font-size: 19px;
}

/* ── Tarjetas ── */
.trat-card {
    background: var(--bw-card);
    border: 1px solid var(--bw-border);
    border-radius: 16px;
    padding: 12px;
    margin-bottom: 12px;
}

.trat-top {
    display: flex;
    gap: 12px;
    align-items: flex-start;
}

.trat-ico {
    width: 42px;
    height: 42px;
    border-radius: 11px;
    background: var(--bw-pale);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.trat-ico ion-icon {
    font-size: 22px;
    color: var(--bw-primary);
}

.trat-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.trat-titulo {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--bw-text);
}

.trat-med,
.trat-desc {
    font-size: 0.82rem;
    color: var(--bw-muted);
}

.trat-fechas {
    display: flex;
    align-items: center;
    margin-top: 10px;
    padding-top: 9px;
    border-top: 1px solid var(--bw-border);
    font-size: 0.78rem;
    color: var(--bw-muted);
}
.trat-fechas span {
    flex: 1;              
    text-align: center;  
}
.trat-fechas span + span {
    border-left: 1px solid var(--bw-border);
}

/* ── Fondo inferior ── */
.trat-lista {
    padding: 0 14px 150px;
}

/* ── Estados ── */
.bw-estado {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    padding: 2rem 1rem;
    color: var(--bw-muted);
}

.bw-vacio {
    text-align: center;
    color: var(--bw-muted);
    font-size: 0.85rem;
    padding: 1rem;
}

/* ── Modal ── */
.bw-toolbar-modal {
    --background: #0f2318;
    --color: #ffffff;
    --border-width: 0;
    border-bottom: 2px solid var(--bw-primary);
}

.modal-content {
    --background: #0f2318;
}

.modal-content ion-input,
.modal-content ion-textarea {
    --background: rgba(255, 255, 255, 0.06);
    --color: #ffffff;
    --border-radius: 16px;
    --placeholder-color: rgba(255, 255, 255, 0.4);
    --placeholder-opacity: 1;
    --padding-top: 5px;
    margin-top: 2px;
    max-width: 390px;
    margin-inline-end: auto;
}

.cow-peek {
    display: flex;
    justify-content: center;
    margin: -6px 0 10px;
}

.cow-svg {
    width: 104px;
    height: auto;
}

.pupila {
    transition: transform 0.08s linear;
}

.campo {
    margin-bottom: 14px;
}

.campo-label {
    display: block;
    font-size: 0.95rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    margin-bottom: 7px;
}

.modal-content ion-input ion-icon {
    color: rgba(255, 255, 255, 0.45);
    font-size: 18px;
}

.fecha-box {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
    max-width: 360px;
    margin: 0 auto;
}

/* ── Calendario  ── */
.modal-content ion-datetime {
    --background: #122a1c;
    --ion-color-primary: #1D9E75;
    --ion-color-primary-rgb: 29, 158, 117;
    --ion-color-primary-contrast: #ffffff;
    --title-color: #ffffff;
    color: #ffffff;
    width: 100%;
}

.modal-content ion-datetime::part(calendar-day) {
    border: 1px solid rgba(255, 255, 255, 0.08);
    /* divisiones por día */
    border-radius: 8px;
    margin: 1px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
}

.modal-content ion-datetime::part(calendar-day today) {
    color: #24c290;
    border-color: rgba(29, 158, 117, 0.5);
}

.modal-content ion-datetime::part(calendar-day active) {
    background: #1D9E75;
    color: #ffffff;
    border-color: #1D9E75;
}

.modal-content ion-datetime::part(month-year-button) {
    color: #ffffff;
    font-weight: 700;
}

.campo-error {
    display: flex;
    width: fit-content;
    /* ← el cuadro se ajusta al largo del texto */
    max-width: 100%;
    align-items: center;
    gap: 8px;
    margin: 7px 2px 0;
    padding: 10px 13px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(231, 76, 60, 0.5) 0%, rgba(192, 57, 43, 0.5) 100%);
    backdrop-filter: blur(2px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: #ffe3e0;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 3px 10px rgba(192, 57, 43, 0.18);
}

.bw-guardar {
    --background: #1D9E75;
    --border-radius: 12px;
}

.campo-error::before {
    content: "!";
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 19px;
    height: 19px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(252, 102, 86, 0.82) 0%, rgba(192, 57, 43, 0.82) 100%);
    color: #edcaca;
    font-weight: 700;
    font-size: 0.78rem;
    flex-shrink: 0;
}
</style>