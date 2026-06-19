<template>
  <Teleport to="ion-app">
    <div v-if="isOpen" class="overlay-backdrop" @click.self="emit('dismiss')">
      <div class="overlay-panel">

        <div class="overlay-header">
          <button v-if="paso === 'animal' && tieneFincas" class="overlay-close" @click="retroceder">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="overlay-title">{{ paso === 'finca' ? 'Seleccionar Finca' : 'Seleccionar Animal' }}</div>
          <button class="overlay-close" @click="emit('dismiss')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- PASO 1: SELECCIÓN DE FINCA -->
        <template v-if="paso === 'finca'">
          <div class="overlay-list">
            <div v-if="loading" class="overlay-loading">
              <ion-spinner color="success" />
            </div>

            <div v-else-if="fincas.length === 0" class="overlay-empty">
              No se encontraron fincas registradas.
            </div>

            <div
              v-else
              v-for="f in fincas"
              :key="f.id_finca"
              class="overlay-item"
              @click="elegirFinca(f)"
            >
              <div class="overlay-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <div class="overlay-item-info">
                <div class="overlay-item-name">{{ f.nombre_finca }}</div>
                <div class="overlay-item-meta" v-if="f.ubicacion_finca">{{ f.ubicacion_finca }}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </template>

        <!-- PASO 2: SELECCIÓN DE ANIMAL -->
        <template v-else>
          <div class="overlay-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="busqueda" type="text" placeholder="Buscar por arete o nombre..." />
          </div>

          <div class="overlay-list">
            <div v-if="loading" class="overlay-loading">
              <ion-spinner color="success" />
            </div>

            <div v-else-if="animalesFiltrados.length === 0" class="overlay-empty">
              No se encontraron animales activos.
            </div>

            <div
              v-else
              v-for="a in animalesFiltrados"
              :key="a.n_arete"
              class="overlay-item"
              @click="elegirAnimal(a)"
            >
              <div class="overlay-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>
              <div class="overlay-item-info">
                <div class="overlay-item-name">{{ a.nombre_animal || 'Sin nombre' }}</div>
                <div class="overlay-item-meta">Arete: <strong>{{ a.n_arete }}</strong><span v-if="a.peso"> · {{ a.peso }} kg</span></div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </template>

      </div>
    </div>
  </Teleport>
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
    service: { type: Object, required: true },
})
const emit = defineEmits(['dismiss', 'select'])

const tieneFincas = computed(() => typeof props.service.getFincas === 'function')

const paso = ref('animal')
const loading = ref(false)
const fincas = ref([])
const fincaSel = ref(null)
const animales = ref([])
const busqueda = ref('')

const animalesFiltrados = computed(() => {
    // Solo animales activos: vendidos/muertos no pueden recibir pesaje
    const activos = animales.value.filter(a => a.estado === 'Activo')
    const q = busqueda.value.trim().toLowerCase()
    if (!q) return activos
    return activos.filter(a =>
        String(a.n_arete).toLowerCase().includes(q) ||
        (a.nombre_animal || '').toLowerCase().includes(q))
})

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

function retroceder() {
    if (paso.value === 'animal' && tieneFincas.value) {
        paso.value = 'finca'
        return
    }
    emit('dismiss')
}
</script>

<style>
.overlay-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.overlay-panel {
  background: #0f2318;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  border-top: 2px solid #1D9E75;
}

.overlay-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.2rem;
  border-bottom: 1px solid rgba(29,158,117,0.2);
  flex-shrink: 0;
}

.overlay-title {
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  font-family: Georgia, serif;
}

.overlay-close {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  color: rgba(255,255,255,0.7);
  padding: 0.4rem;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.overlay-search {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 1rem 1.2rem 0.5rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  flex-shrink: 0;
}

.overlay-search input {
  flex: 1;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 0.95rem;
  outline: none;
}

.overlay-search input::placeholder {
  color: rgba(255,255,255,0.3);
}

.overlay-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 1.2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.overlay-loading {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.overlay-empty {
  color: rgba(255,255,255,0.4);
  font-size: 0.85rem;
  text-align: center;
  padding: 2rem;
}

.overlay-item {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 12px;
  padding: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  cursor: pointer;
}

.overlay-item:active {
  background: rgba(255,255,255,0.1);
}

.overlay-item-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(29,158,117,0.12);
  border: 1px solid rgba(29,158,117,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.overlay-item-info {
  flex: 1;
  min-width: 0;
}

.overlay-item-name {
  color: #ffffff;
  font-weight: 700;
  font-size: 0.95rem;
}

.overlay-item-meta {
  color: rgba(255,255,255,0.5);
  font-size: 0.78rem;
  margin-top: 0.1rem;
}

.overlay-item-meta strong {
  color: rgba(255,255,255,0.85);
}
</style>