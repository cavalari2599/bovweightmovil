<template>
  <ion-page>
    <ion-content :scroll-y="true">
      <div class="page-container">

        <div class="page-header">
          <button class="back-btn" @click="router.push(paths.ganadero.menu)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="header-title-wrap">
            <div class="header-title">Calendario de Pesajes</div>
            <div class="header-sub">Agenda y control de tareas de pesaje</div>
          </div>
          <button class="add-btn" @click="abrirAgendar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Agendar</span>
          </button>
        </div>

        <div v-if="loading" class="loading-wrap">
          <ion-spinner color="success" />
        </div>

        <div v-else class="content-body">

          <div v-if="atrasados.length > 0" class="seccion-bloque bloque-alerta">
            <div class="seccion-header-status">
              <div class="status-title-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span class="text-alert-header">Pesajes pendientes de días anteriores</span>
              </div>
              <span class="badge-count-alert">{{ atrasados.length }}</span>
            </div>
            <div class="custom-list">
              <div v-for="a in atrasados" :key="a.n_arete" class="custom-card card-alert">
                <div class="card-main-info">
                  <div class="avatar-wrap border-alert">
                    <img v-if="a.foto_animal" :src="fotoUrl(a.foto_animal)" alt="foto" />
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <div class="card-texts">
                    <div class="animal-name">{{ a.nombre_animal || 'Sin nombre' }}</div>
                    <div class="animal-tag-id">Número de Arete: {{ a.n_arete }}</div>
                    <div class="date-alert-text">Debió pesarse el {{ formatFecha(a.proximo_pesaje) }}</div>
                  </div>
                </div>
                <div class="card-actions-row">
                  <button class="action-btn btn-pesar-alert" @click="pesar">Registrar Pesaje Ahora</button>
                  <button class="action-btn btn-quitar-clear" @click="quitar(a)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="calendario-container-box">
            <div class="calendario-top-bar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>Seleccione un día para ver la agenda</span>
            </div>
            <div class="main-cal-wrap">
              <ion-datetime
                presentation="date"
                :highlighted-dates="diasMarcados"
                v-model="diaSel"
                :prefer-wheel="false"
                class="screen-inner-datetime"
                color="success"
              />
            </div>
          </div>

          <div class="seccion-bloque">
            <div class="seccion-header-status gray-header">
              <div class="status-title-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                <span class="text-normal-header">Agenda: {{ formatFecha(diaSelCorto) }}</span>
              </div>
              <span class="badge-count-normal">{{ delDia.length }}</span>
            </div>
            <div v-if="delDia.length === 0" class="empty-state-card">
              <p>No hay pesajes agendados para esta fecha.</p>
            </div>
            <div v-else class="custom-list">
              <div v-for="a in delDia" :key="a.n_arete" class="custom-card">
                <div class="card-main-info">
                  <div class="avatar-wrap">
                    <img v-if="a.foto_animal" :src="fotoUrl(a.foto_animal)" alt="foto" />
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <div class="card-texts">
                    <div class="animal-name">{{ a.nombre_animal || 'Sin nombre' }}</div>
                    <div class="animal-tag-id">Arete: {{ a.n_arete }}</div>
                    <div v-if="a.repetir_cada_dias" class="repeat-badge">Se repite cada {{ a.repetir_cada_dias }} días</div>
                  </div>
                </div>
                <div class="card-actions-row">
                  <button class="action-btn btn-pesar-normal" @click="pesar">Realizar Pesaje</button>
                  <button class="action-btn btn-quitar-clear" @click="quitar(a)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- MODAL -->
      <ion-modal :is-open="modalAgendar" @did-dismiss="modalAgendar = false">
        <ion-header>
          <ion-toolbar class="modal-header-toolbar">
            <ion-title class="modal-header-title">Agendar Nuevo Pesaje</ion-title>
            <ion-buttons slot="end">
              <button class="modal-close-btn" @click="modalAgendar = false">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="modal-content-dark">
          <div class="modal-body-wrapper">

            <!-- PASO 1: Seleccionar animal -->
            <template v-if="!animalSel">
              <div class="field-label-modal">Busque y seleccione el animal:</div>
              <div class="modal-search-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input v-model="busqueda" type="text" placeholder="Escriba el arete o nombre..." />
              </div>
              <div class="modal-animal-list">
                <div v-for="a in animalesFiltrados" :key="a.n_arete" class="modal-animal-item" @click="animalSel = a">
                  <div class="avatar-wrap-small">
                    <img v-if="a.foto_animal" :src="fotoUrl(a.foto_animal)" alt="foto" />
                    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <div class="modal-item-info">
                    <div class="modal-animal-name">{{ a.nombre_animal || 'Sin nombre' }}</div>
                    <div class="modal-animal-sub">Arete: {{ a.n_arete }} <span v-if="a.proximo_pesaje" class="highlight-txt-modal">· Ya agendado</span></div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
                <div v-if="animalesFiltrados.length === 0" class="empty-state-text">No se encontraron animales.</div>
              </div>
            </template>

            <!-- PASO 2: Fecha y repetición -->
            <template v-else>

              <!-- Animal elegido -->
              <div class="elegido-box">
                <div class="elegido-info-side">
                  <div class="elegido-lbl">Animal Elegido</div>
                  <div class="elegido-name">{{ animalSel.nombre_animal || 'Sin nombre' }}</div>
                  <div class="elegido-subtext">Arete: {{ animalSel.n_arete }}</div>
                </div>
                <button class="btn-change" @click="animalSel = null">Cambiar</button>
              </div>

              <!-- Fecha -->
              <div class="field-label-modal">Fecha del pesaje:</div>
              <div class="modal-cal-wrap">
                <ion-datetime
                  presentation="date"
                  v-model="formFecha"
                  :min="hoy()"
                  :prefer-wheel="false"
                  class="modal-inner-datetime"
                  color="success"
                />
              </div>

              <!-- Repetición con botones -->
              <div class="field-label-modal">¿Cada cuánto repetir?</div>
              <div class="repetir-grid">
                <button
                  v-for="op in opcionesRepetir"
                  :key="String(op.value)"
                  class="repetir-btn"
                  :class="{ active: formRepetir === op.value }"
                  @click="formRepetir = op.value"
                >{{ op.label }}</button>
              </div>

              <button class="btn-primary" :disabled="!formFecha || guardando" @click="guardarAgenda">
                {{ guardando ? 'Guardando...' : 'Confirmar y Agendar' }}
              </button>

            </template>

          </div>
        </ion-content>
      </ion-modal>

    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonContent, IonSpinner, onIonViewWillEnter,
  IonModal, IonDatetime,
  IonHeader, IonToolbar, IonTitle, IonButtons
} from '@ionic/vue'
import { ganaderoService } from '../../services/ganadero'
import { fotoUrl } from '../../services/media'
import { paths } from '../../router/paths'
import { sincronizarRecordatorios } from '../../services/notificaciones'

const router = useRouter()
const loading = ref(true)
const recordatorios = ref([])

const hoy = () => new Date().toLocaleDateString('es-CR', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-')
const diaSel = ref(hoy())

const modalAgendar = ref(false)
const todosAnimales = ref([])
const busqueda = ref('')
const animalSel = ref(null)
const formFecha = ref('')
const formRepetir = ref(null)
const guardando = ref(false)

const opcionesRepetir = [
  { value: null, label: 'Una sola vez' },
  { value: 7,   label: 'Cada semana' },
  { value: 15,  label: 'Cada 15 días' },
  { value: 30,  label: 'Cada mes' },
  { value: 60,  label: 'Cada 2 meses' },
  { value: 90,  label: 'Cada 3 meses' },
]

function fecha(a) { return (a.proximo_pesaje || '').slice(0, 10) }
const diaSelCorto = computed(() => (diaSel.value || '').slice(0, 10))
const atrasados = computed(() => recordatorios.value.filter(a => fecha(a) < hoy()))
const delDia = computed(() => recordatorios.value.filter(a => fecha(a) === diaSelCorto.value))
const diasMarcados = computed(() => recordatorios.value.map(a => ({
  date: fecha(a),
  textColor: '#ffffff',
  backgroundColor: fecha(a) < hoy() ? '#ff4d4d' : '#1D9E75',
})))

function formatFecha(f) {
  if (!f) return '-'
  return new Date(f + 'T12:00:00').toLocaleDateString('es-CR', { weekday: 'short', day: 'numeric', month: 'short' })
}

const animalesFiltrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  if (!q) return todosAnimales.value
  return todosAnimales.value.filter(a =>
    String(a.n_arete).toLowerCase().includes(q) ||
    (a.nombre_animal || '').toLowerCase().includes(q))
})

async function abrirAgendar() {
  animalSel.value = null
  busqueda.value = ''
  formFecha.value = hoy()
  formRepetir.value = null
  modalAgendar.value = true
  const { data } = await ganaderoService.getTodosAnimales()
  todosAnimales.value = data
}

async function guardarAgenda() {
  guardando.value = true
  try {
    await ganaderoService.programarPesaje(animalSel.value.n_arete, {
      proximo_pesaje: formFecha.value.slice(0, 10),
      repetir_cada_dias: formRepetir.value,
    })
    modalAgendar.value = false
    await cargar()
  } finally {
    guardando.value = false
  }
}

function pesar() { router.push(paths.ganadero.captura) }

async function quitar(animal) {
  await ganaderoService.programarPesaje(animal.n_arete, { proximo_pesaje: null })
  await cargar()
}

async function cargar() {
  loading.value = true
  try {
    const { data } = await ganaderoService.getRecordatorios()
    recordatorios.value = data
    // Agenda notificaciones nativas para los recordatorios futuros.
    sincronizarRecordatorios(data)
  } catch {
    recordatorios.value = []
  } finally {
    loading.value = false
  }
}

onIonViewWillEnter(cargar)
</script>

<style scoped>
ion-content { --background: #0f2318; }

.page-container {
  min-height: 100%;
  background: #0f2318;
  padding-bottom: 3rem;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.1rem 1.2rem;
  border-bottom: 2px solid #1D9E75;
  background: rgba(15,35,24,0.95);
}

.back-btn {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 9px;
  color: #ffffff;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.header-title-wrap { flex: 1; }
.header-title { color: #ffffff; font-weight: 800; font-size: 1.1rem; font-family: Georgia, serif; }
.header-sub { color: rgba(255,255,255,0.75); font-size: 0.78rem; margin-top: 2px; font-weight: 500; }

.add-btn {
  background: #1D9E75;
  border: none;
  border-radius: 9px;
  color: #ffffff;
  padding: 0.55rem 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.content-body { padding: 1.2rem; display: flex; flex-direction: column; gap: 1.5rem; }

.seccion-bloque {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  overflow: hidden;
}
.bloque-alerta { border-color: rgba(255,77,77,0.3); background: rgba(255,77,77,0.02); }

.seccion-header-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: rgba(255,77,77,0.15);
  border-bottom: 1px solid rgba(255,77,77,0.25);
}
.gray-header { background: rgba(255,255,255,0.08); border-bottom: 1px solid rgba(255,255,255,0.12); }

.status-title-wrap { display: flex; align-items: center; gap: 0.5rem; }
.text-alert-header { color: #ff6666; font-weight: 700; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.5px; }
.text-normal-header { color: #ffffff; font-weight: 700; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.5px; }

.badge-count-alert { background: #ff4d4d; color: white; font-size: 0.75rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 20px; }
.badge-count-normal { background: #1D9E75; color: white; font-size: 0.75rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 20px; }

.custom-list { display: flex; flex-direction: column; padding: 0.8rem; gap: 0.7rem; }
.custom-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1rem; }
.card-alert { border-left: 4px solid #ff4d4d; }

.card-main-info { display: flex; align-items: center; gap: 0.85rem; }
.avatar-wrap { width: 48px; height: 48px; border-radius: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #1D9E75; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.border-alert { color: #ff4d4d; border-color: rgba(255,77,77,0.3); }
.avatar-wrap img { width: 100%; height: 100%; object-fit: cover; }

.card-texts { flex: 1; min-width: 0; }
.animal-name { color: #ffffff; font-weight: 700; font-size: 1rem; }
.animal-tag-id { color: rgba(255,255,255,0.85); font-size: 0.82rem; margin-top: 0.1rem; font-weight: 600; }
.date-alert-text { color: #ff6666; font-size: 0.8rem; font-weight: 700; margin-top: 0.2rem; }
.repeat-badge { display: inline-block; background: rgba(29,158,117,0.15); color: #24c290; font-size: 0.72rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 6px; margin-top: 0.3rem; }

.card-actions-row { display: flex; gap: 0.6rem; margin-top: 0.9rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.7rem; }
.action-btn { border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 44px; }
.btn-pesar-alert { flex: 1; background: #ff4d4d; color: white; border: none; font-weight: 700; font-size: 0.85rem; }
.btn-pesar-normal { flex: 1; background: #1D9E75; color: white; border: none; font-weight: 700; font-size: 0.85rem; }
.btn-quitar-clear { width: 48px; background: transparent; border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); }

.calendario-container-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; }
.calendario-top-bar { display: flex; align-items: center; gap: 0.45rem; padding: 0.75rem 1rem; background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.1); color: #ffffff; font-size: 0.8rem; font-weight: 700; }
.empty-state-card { padding: 2.2rem 1rem; text-align: center; color: rgba(255,255,255,0.7); font-size: 0.88rem; font-weight: 600; }

.main-cal-wrap { background: transparent; width: 100%; display: block; }
.screen-inner-datetime {
  width: 100%;
  max-width: 100% !important;
  margin: 0;
  --background: #0f2318;
  --text-color: #ffffff;
  --text-color-step-400: #a2b2a9;
  --text-color-step-600: #ffffff;
  --title-color: #1D9E75;
}
.screen-inner-datetime::part(calendar) { width: 100%; max-width: 100%; }

.loading-wrap { display: flex; justify-content: center; padding: 3rem; }

.modal-content-dark { --background: #0f2318; }

.modal-header-toolbar {
  --background: #0f2318;
  --border-color: rgba(29,158,117,0.3);
  border-bottom: 2px solid #1D9E75;
}

.modal-header-title {
  color: #ffffff !important;
  font-family: Georgia, serif;
  font-weight: 700;
  font-size: 1.1rem;
}

.modal-close-btn {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem;
  margin-right: 0.6rem;
  cursor: pointer;
}

.modal-body-wrapper {
  padding: 1rem 1.2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.field-label-modal {
  color: rgba(255,255,255,0.6);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.modal-search-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 0.75rem 1rem;
}
.modal-search-wrap input {
  flex: 1;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 0.95rem;
  outline: none;
}
.modal-search-wrap input::placeholder { color: rgba(255,255,255,0.3); }

.modal-animal-list { display: flex; flex-direction: column; gap: 0.5rem; }

.modal-animal-item {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  cursor: pointer;
  transition: background 0.15s;
}
.modal-animal-item:active { background: rgba(255,255,255,0.1); }

.avatar-wrap-small {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(29,158,117,0.12);
  border: 1px solid rgba(29,158,117,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1D9E75;
  flex-shrink: 0;
  overflow: hidden;
}
.avatar-wrap-small img { width: 100%; height: 100%; object-fit: cover; }

.modal-item-info { flex: 1; min-width: 0; }
.modal-animal-name { color: #ffffff; font-weight: 700; font-size: 0.95rem; }
.modal-animal-sub { color: rgba(255,255,255,0.5); font-size: 0.78rem; margin-top: 0.1rem; }
.highlight-txt-modal { color: #1D9E75; font-weight: 700; }
.empty-state-text { color: rgba(255,255,255,0.4); font-size: 0.85rem; text-align: center; padding: 2rem; }

.elegido-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(29,158,117,0.1);
  border: 1px solid rgba(29,158,117,0.3);
  border-radius: 14px;
  padding: 1rem;
}
.elegido-lbl { color: #1D9E75; font-size: 0.7rem; text-transform: uppercase; font-weight: 800; letter-spacing: 0.8px; margin-bottom: 0.2rem; }
.elegido-name { color: white; font-weight: 700; font-size: 1rem; }
.elegido-subtext { color: rgba(255,255,255,0.6); font-size: 0.8rem; margin-top: 0.1rem; }
.btn-change { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: white; padding: 0.4rem 0.7rem; font-size: 0.8rem; font-weight: 700; cursor: pointer; flex-shrink: 0; }

.modal-cal-wrap {
  background: #0f2318;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  overflow: hidden;
}
.modal-inner-datetime {
  width: 100%;
  max-width: 100% !important;
  margin: 0;
  --background: #0f2318;
  --text-color: #ffffff;
  --text-color-step-400: #a2b2a9;
  --text-color-step-600: #ffffff;
  --title-color: #1D9E75;
}
.modal-inner-datetime::part(calendar) { width: 100%; max-width: 100%; }

.repetir-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.repetir-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: rgba(255,255,255,0.55);
  padding: 0.7rem 0.5rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}
.repetir-btn.active {
  background: rgba(29,158,117,0.15);
  border-color: #1D9E75;
  color: #1D9E75;
}
.repetir-btn:active { background: rgba(255,255,255,0.1); }

.btn-primary {
  width: 100%;
  padding: 1rem;
  background: #1D9E75;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(29,158,117,0.2);
}
.btn-primary:active { background: #167a5a; }
.btn-primary:disabled { background: rgba(29,158,117,0.3); cursor: not-allowed; }
</style>