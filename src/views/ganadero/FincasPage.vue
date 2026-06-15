<template>
  <ion-page>
    <ion-content :scroll-y="true">
      <div class="page-container">

        <div class="page-header">
          <button class="back-btn" @click="router.push('/ganadero/menu')">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
</button>
          <div class="header-title-wrap">
            <div class="header-title">{{ modoAnimales ? 'Seleccionar Finca' : 'Mis Fincas' }}</div>
            <div class="header-sub">{{ fincas.length }} finca{{ fincas.length !== 1 ? 's' : '' }} registrada{{ fincas.length !== 1 ? 's' : '' }}</div>
          </div>
          <button v-if="!modoAnimales" class="add-btn" @click="abrirModalCrear">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Nueva Finca</span>
          </button>
        </div>

        <div v-if="loading" class="loading-wrap">
          <ion-spinner color="success" />
        </div>

        <div v-else class="cards-list">

          <div v-if="fincas.length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <p>No tenés fincas registradas.</p>
            <button class="btn-primary" @click="abrirModalCrear">Agregar primera finca</button>
          </div>

          <div
            v-for="(finca, i) in fincas"
            :key="finca.id_finca"
            class="finca-card"
            :style="{ animationDelay: `${i * 60}ms` }"
            @click="abrirFinca(finca)"
          >
            <div class="finca-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div class="finca-info">
              <div class="finca-nombre">{{ finca.nombre_finca }}</div>
              <div class="finca-ubicacion">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {{ finca.ubicacion_finca }}
              </div>
            </div>
            <div class="finca-actions">
              <button v-if="!modoAnimales" class="edit-btn" @click.stop="abrirModalEditar(finca)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>

        </div>
      </div>

      <ion-modal :is-open="modalAbierto" @did-dismiss="cerrarModal">
        <ion-content>
          <div class="modal-container">
            <div class="modal-header">
              <div class="modal-title">{{ esEdicion ? 'Editar Finca' : 'Nueva Finca' }}</div>
              <button class="modal-close" @click="cerrarModal">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="modal-body">
              <div class="field">
                <label>Nombre de la finca</label>
                <input v-model="form.nombre_finca" type="text" placeholder="Ej: Finca La Esperanza" />
              </div>
              <div class="field">
                <label>Ubicación</label>
                <input v-model="form.ubicacion_finca" type="text" placeholder="Ej: Liberia, Guanacaste" />
              </div>

              <p v-if="error" class="error-msg">{{ error }}</p>

              <button class="btn-primary" :disabled="guardando" @click="guardar">
                {{ guardando ? 'Guardando...' : 'Guardar' }}
              </button>
              <button class="btn-secondary" @click="cerrarModal">Cancelar</button>
            </div>
          </div>
        </ion-content>
      </ion-modal>

    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { IonPage, IonContent, IonSpinner, IonModal } from '@ionic/vue'
import { ganaderoService } from '../../services/ganadero'
import { useAuthStore } from '../../stores/auth'
import { paths } from '../../router/paths'

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

const form = ref({ nombre_finca: '', ubicacion_finca: '' })

async function cargarFincas() {
  try {
    const response = await ganaderoService.getFincas()
    fincas.value = response.data
  } finally {
    loading.value = false
  }
}

function abrirFinca(finca) {
  if (modo.value === 'reporte') router.push(paths.ganadero.reporte(finca.id_finca))
  else if (modo.value === 'animales') router.push(paths.ganadero.animales(finca.id_finca))
  else router.push(paths.ganadero.fincaDetalle(finca.id_finca))
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
  form.value = { nombre_finca: finca.nombre_finca, ubicacion_finca: finca.ubicacion_finca }
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
    if (esEdicion.value) await ganaderoService.editarFinca(fincaEditando.value.id_finca, form.value)
    else await ganaderoService.crearFinca(form.value)
    cerrarModal()
    await cargarFincas()
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al guardar.'
  } finally {
    guardando.value = false
  }
}

onMounted(cargarFincas)
</script>

<style scoped>
ion-content { --background: #0f2318; }

.page-container {
  min-height: 100%;
  background: #0f2318;
  padding-bottom: 2rem;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 1.2rem;
  border-bottom: 1px solid rgba(29,158,117,0.15);
}

.back-btn {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 9px;
  color: rgba(255,255,255,0.7);
  padding: 0.45rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}
.back-btn:active { background: rgba(255,255,255,0.12); }

.header-title-wrap { flex: 1; }

.header-title {
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  font-family: Georgia, serif;
}

.header-sub {
  color: rgba(255,255,255,0.35);
  font-size: 0.72rem;
  margin-top: 1px;
}

.add-btn {
  background: #1D9E75;
  border: none;
  border-radius: 9px;
  color: white;
  padding: 0.45rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}
.add-btn:active { background: #167a5a; }

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.cards-list {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
  color: rgba(255,255,255,0.3);
  text-align: center;
}
.empty-state p { font-size: 0.9rem; margin: 0; }

.finca-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 14px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  cursor: pointer;
  backdrop-filter: blur(8px);
  animation: slideIn 0.35s ease both;
  transition: background 0.15s;
}
.finca-card:active { background: rgba(255,255,255,0.09); transform: scale(0.985); }

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}

.finca-icon {
  width: 44px;
  height: 44px;
  border-radius: 11px;
  background: rgba(29,158,117,0.12);
  border: 1px solid rgba(29,158,117,0.2);
  color: #1D9E75;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.finca-info { flex: 1; min-width: 0; }

.finca-nombre {
  color: #ffffff;
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.finca-ubicacion {
  color: rgba(255,255,255,0.4);
  font-size: 0.78rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.finca-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.edit-btn {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: rgba(255,255,255,0.5);
  padding: 0.4rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s;
}
.edit-btn:active { background: rgba(255,255,255,0.12); }

.chevron { color: rgba(255,255,255,0.2); }

/* MODAL */
.modal-container {
  min-height: 100%;
  background: #0f2318;
  padding-bottom: 2rem;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.2rem;
  border-bottom: 1px solid rgba(29,158,117,0.15);
}

.modal-title {
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  font-family: Georgia, serif;
}

.modal-close {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 9px;
  color: rgba(255,255,255,0.6);
  padding: 0.4rem;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field { display: flex; flex-direction: column; gap: 0.35rem; }

label {
  color: rgba(255,255,255,0.6);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}

input[type="text"] {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: 0.95rem 1.1rem;
  color: #ffffff;
  font-size: 1rem; 
  -webkit-appearance: none;
  transition: border-color 0.2s;
}
input[type="text"]::placeholder { 
  color: rgba(255,255,255,0.4); 
}
input[type="text"]:focus { outline: none; border-color: rgba(29,158,117,0.5); }

.error-msg {
  color: #e74c3c;
  font-size: 0.82rem;
  text-align: center;
  margin: 0;
}

.btn-primary {
  width: 100%;
  padding: 0.85rem;
  background: #1D9E75;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:active:not(:disabled) { background: #167a5a; }
.btn-primary:disabled { background: rgba(29,158,117,0.3); cursor: not-allowed; }

.btn-secondary {
  width: 100%;
  padding: 0.85rem;
  background: transparent;
  color: rgba(255,255,255,0.5);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-secondary:active { background: rgba(255,255,255,0.06); }
</style>