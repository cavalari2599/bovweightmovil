<template>
  <ion-page>
    <ion-content :scroll-y="true">
      <div class="page-container">

        <!-- Header -->
        <div class="page-header">
          <button class="back-btn" @click="router.back()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="header-title-wrap">
            <div class="header-title">{{ animal?.nombre_animal || 'Animal' }}</div>
            <div class="header-sub">{{ animal?.n_arete }}</div>
          </div>
          <button v-if="pesajes.length > 0" class="icon-btn-label" @click="exportar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Excel</span>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading-wrap">
          <ion-spinner color="success" />
        </div>

        <div v-else>

          <div class="animal-hero">
            <div class="animal-foto-wrap">
              <img v-if="animal?.foto_animal" :src="fotoUrl(animal.foto_animal)" alt="foto" class="animal-foto" />
              <div v-else class="animal-foto-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
            </div>
            <div class="animal-hero-info">
              <div class="animal-nombre">{{ animal?.nombre_animal || 'Sin nombre' }}</div>
              <div class="estado-badge" :class="estadoClass(animal?.estado)">{{ animal?.estado }}</div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Arete</div>
              <div class="info-value">{{ animal?.n_arete }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Raza</div>
              <div class="info-value">{{ animal?.raza || '-' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Edad</div>
              <div class="info-value">{{ animal?.edad != null ? animal.edad + ' años' : '-' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Peso actual</div>
              <div class="info-value info-value-highlight">{{ animal?.peso }} kg</div>
            </div>
          </div>

¿          <div class="pesaje-strip" @click="abrirProgramar">
            <div class="pesaje-strip-left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <div>
                <div class="pesaje-strip-title">{{ animal?.proximo_pesaje ? 'Próximo pesaje' : 'Sin pesaje programado' }}</div>
                <div v-if="animal?.proximo_pesaje" class="pesaje-strip-fecha">
                  {{ formatFecha(animal.proximo_pesaje) }}
                  <span v-if="animal.repetir_cada_dias"> · cada {{ animal.repetir_cada_dias }} días</span>
                </div>
              </div>
            </div>
            <div class="pesaje-strip-btn">{{ animal?.proximo_pesaje ? 'Reprogramar' : 'Programar' }}</div>
          </div>

          <div class="tabs">
            <button class="tab-btn" :class="{ active: tab === 'pesajes' }" @click="tab = 'pesajes'">
              Historial de Pesajes
            </button>
            <button class="tab-btn" :class="{ active: tab === 'tratamientos' }" @click="tab = 'tratamientos'">
              Tratamientos
            </button>
          </div>

          <div v-if="tab === 'pesajes'" class="tab-content">

            <div v-if="pesajes.length === 0" class="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              <p>No hay pesajes registrados.</p>
            </div>

            <div v-else>
              <!-- Gráfico -->
              <div class="grafico-wrap">
                <div class="grafico-title">Evolución del Peso</div>
                <div class="grafico-container">
                  <canvas ref="chartRef" />
                </div>
              </div>

              <div class="pesajes-list">
                <div v-for="p in [...pesajes].reverse()" :key="p.id_pesaje" class="pesaje-card">
                  <div class="pesaje-peso">{{ p.peso_aproximado }} kg</div>
                  <div class="pesaje-fecha">{{ formatFecha(p.fecha_pesaje) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="tab === 'tratamientos'" class="tab-content">

            <div v-if="tratamientos.length === 0" class="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              <p>No hay tratamientos registrados.</p>
            </div>

            <div v-else class="tratamientos-list">
              <div v-for="t in tratamientos" :key="t.id_tratamiento" class="tratamiento-card">
                <div class="trat-header">
                  <div class="trat-tipo">{{ t.tipo_tratamiento }}</div>
                  <div class="trat-estado" :class="t.fecha_fin ? 'trat-finalizado' : 'trat-en-curso'">
                    {{ t.fecha_fin ? 'Finalizado' : 'En curso' }}
                  </div>
                </div>
                <div class="trat-row" v-if="t.medicamento">
                  <span class="trat-label">Medicamento</span>
                  <span class="trat-val">{{ t.medicamento }}</span>
                </div>
                <div class="trat-row" v-if="t.descripcion">
                  <span class="trat-label">Descripción</span>
                  <span class="trat-val">{{ t.descripcion }}</span>
                </div>
                <div class="trat-row">
                  <span class="trat-label">Inicio</span>
                  <span class="trat-val">{{ formatFecha(t.fecha_inicio) }}</span>
                </div>
                <div class="trat-row">
                  <span class="trat-label">Fin</span>
                  <span class="trat-val">{{ t.fecha_fin ? formatFecha(t.fecha_fin) : 'En curso' }}</span>
                </div>
                <div class="trat-row" v-if="t.usuario">
                  <span class="trat-label">Veterinario</span>
                  <span class="trat-val">{{ t.usuario.nombre_usuario }} {{ t.usuario.apellido1_usuario }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <ion-modal :is-open="modalProgramar" @did-dismiss="modalProgramar = false">
        <ion-content>
          <div class="modal-container">
            <div class="modal-header">
              <div class="modal-title">Programar Pesaje</div>
              <button class="modal-close" @click="modalProgramar = false">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="field-label">Fecha del próximo pesaje</div>
              <ion-datetime
                presentation="date"
                v-model="formFecha"
                :min="hoy"
                :prefer-wheel="false"
                color="success"
              />
              <div class="field-label" style="margin-top: 1rem;">Repetir pesaje</div>
              <ion-select v-model="formRepetir" interface="action-sheet" placeholder="Sin repetición" class="custom-select">
                <ion-select-option :value="null">Sin repetición</ion-select-option>
                <ion-select-option :value="7">Cada semana</ion-select-option>
                <ion-select-option :value="15">Cada 15 días</ion-select-option>
                <ion-select-option :value="30">Cada mes</ion-select-option>
                <ion-select-option :value="60">Cada 2 meses</ion-select-option>
                <ion-select-option :value="90">Cada 3 meses</ion-select-option>
              </ion-select>
              <button class="btn-primary" :disabled="!formFecha || guardando" @click="guardarPrograma">
                {{ guardando ? 'Guardando...' : 'Guardar fecha' }}
              </button>
              <button v-if="animal?.proximo_pesaje" class="btn-danger" :disabled="guardando" @click="quitarPrograma">
                Quitar recordatorio
              </button>
            </div>
          </div>
        </ion-content>
      </ion-modal>

    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IonPage, IonContent, IonSpinner, IonModal,
  IonDatetime, IonSelect, IonSelectOption
} from '@ionic/vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js'
import { ganaderoService } from '../../services/ganadero'
import { fotoUrl } from '../../services/media'
import { exportarPesajes } from '../../services/export'
import { paths } from '../../router/paths'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler)

const route = useRoute()
const router = useRouter()
const nArete = route.params.nArete
const idFinca = route.query.idFinca

const animal = ref(null)
const pesajes = ref([])
const tratamientos = ref([])
const loading = ref(true)
const tab = ref('pesajes')
const chartRef = ref(null)
let chartInstance = null

const hoy = new Date().toISOString().slice(0, 10)
const modalProgramar = ref(false)
const formFecha = ref('')
const formRepetir = ref(null)
const guardando = ref(false)

function estadoClass(estado) {
  if (estado === 'Activo') return 'estado-activo'
  if (estado === 'Vendido') return 'estado-vendido'
  return 'estado-muerto'
}

function abrirProgramar() {
  formFecha.value = (animal.value?.proximo_pesaje || hoy).slice(0, 10)
  formRepetir.value = animal.value?.repetir_cada_dias ?? null
  modalProgramar.value = true
}

async function guardarPrograma() {
  guardando.value = true
  try {
    await ganaderoService.programarPesaje(nArete, {
      proximo_pesaje: formFecha.value.slice(0, 10),
      repetir_cada_dias: formRepetir.value,
    })
    const { data } = await ganaderoService.getAnimal(nArete)
    animal.value = data
    modalProgramar.value = false
  } finally {
    guardando.value = false
  }
}

async function quitarPrograma() {
  guardando.value = true
  try {
    await ganaderoService.programarPesaje(nArete, { proximo_pesaje: null })
    const { data } = await ganaderoService.getAnimal(nArete)
    animal.value = data
    modalProgramar.value = false
  } finally {
    guardando.value = false
  }
}

async function cargarDatos() {
  try {
    const [animalRes, pesajesRes, tratamientosRes] = await Promise.all([
      ganaderoService.getAnimal(nArete),
      ganaderoService.getPesajes(nArete),
      ganaderoService.getTratamientos(nArete),
    ])
    animal.value = animalRes.data
    pesajes.value = pesajesRes.data.sort((a, b) => new Date(a.fecha_pesaje) - new Date(b.fecha_pesaje))
    tratamientos.value = tratamientosRes.data
  } finally {
    loading.value = false
  }
}

watch(chartRef, (val) => {
  if (val && pesajes.value.length > 0) renderGrafico()
})

function renderGrafico() {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.destroy()
  chartInstance = new Chart(chartRef.value, {
    type: 'line',
    data: {
      labels: pesajes.value.map(p => formatFecha(p.fecha_pesaje)),
      datasets: [{
        label: 'Peso (kg)',
        data: pesajes.value.map(p => p.peso_aproximado),
        borderColor: '#1D9E75',
        backgroundColor: 'rgba(29,158,117,0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#1D9E75',
        pointRadius: 5,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: false,
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 } }
        },
        x: {
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 } }
        }
      }
    }
  })
}

function formatFecha(fecha) {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-CR')
}

function exportar() {
  if (!animal.value || pesajes.value.length === 0) return
  exportarPesajes(animal.value, pesajes.value)
}

onMounted(cargarDatos)
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
  gap: 0.75rem;
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
}
.back-btn:active { background: rgba(255,255,255,0.12); }

.header-title-wrap { flex: 1; }
.header-title { color: #ffffff; font-weight: 700; font-size: 1rem; font-family: Georgia, serif; }
.header-sub { color: rgba(255,255,255,0.35); font-size: 0.72rem; margin-top: 1px; }

.icon-btn-label {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 9px;
  color: rgba(255,255,255,0.7);
  padding: 0.45rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
}

.loading-wrap { display: flex; justify-content: center; padding: 3rem; }

.animal-hero {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 1.2rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.animal-foto-wrap {
  width: 72px;
  height: 72px;
  border-radius: 14px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(29,158,117,0.1);
  border: 1px solid rgba(29,158,117,0.2);
}

.animal-foto { width: 100%; height: 100%; object-fit: cover; }

.animal-foto-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1D9E75;
}

.animal-hero-info { flex: 1; }

.animal-nombre {
  color: #ffffff;
  font-weight: 700;
  font-size: 1.2rem;
  font-family: Georgia, serif;
  margin-bottom: 0.4rem;
}

.estado-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
}
.estado-activo  { background: rgba(29,158,117,0.2); color: #1D9E75; }
.estado-vendido { background: rgba(230,180,34,0.2); color: #e6b422; }
.estado-muerto  { background: rgba(150,150,150,0.2); color: #aaa; }

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  padding: 1rem 1.2rem;
}

.info-item {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 0.75rem;
}

.info-label {
  color: rgba(255,255,255,0.35);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.info-value {
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
}

.info-value-highlight { color: #1D9E75; font-size: 1.1rem; }

.pesaje-strip {
  margin: 0 1rem 1rem;
  background: rgba(29,158,117,0.08);
  border: 1px solid rgba(29,158,117,0.2);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background 0.2s;
}
.pesaje-strip:active { background: rgba(29,158,117,0.14); }

.pesaje-strip-left {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: #1D9E75;
  flex: 1;
}

.pesaje-strip-title {
  color: #ffffff;
  font-weight: 600;
  font-size: 0.88rem;
}

.pesaje-strip-fecha {
  color: rgba(255,255,255,0.45);
  font-size: 0.75rem;
  margin-top: 0.1rem;
}

.pesaje-strip-btn {
  font-size: 0.75rem;
  font-weight: 700;
  color: #1D9E75;
  background: rgba(29,158,117,0.15);
  border: 1px solid rgba(29,158,117,0.3);
  border-radius: 8px;
  padding: 0.3rem 0.65rem;
  flex-shrink: 0;
}

.tabs {
  display: flex;
  margin: 0 1rem 1rem;
  background: rgba(255,255,255,0.04);
  border-radius: 10px;
  padding: 0.25rem;
  gap: 0.25rem;
}

.tab-btn {
  flex: 1;
  padding: 0.55rem;
  border: none;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  color: rgba(255,255,255,0.4);
  transition: all 0.2s;
}
.tab-btn.active {
  background: #1D9E75;
  color: #ffffff;
}

.tab-content { padding: 0 1rem; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2.5rem 1rem;
  color: rgba(255,255,255,0.25);
  text-align: center;
}
.empty-state p { margin: 0; font-size: 0.88rem; }

.grafico-wrap {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.grafico-title {
  color: rgba(255,255,255,0.5);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 0.75rem;
}

.grafico-container {
  position: relative;
  height: 200px;
}

.pesajes-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pesaje-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pesaje-peso {
  color: #1D9E75;
  font-weight: 700;
  font-size: 1rem;
}

.pesaje-fecha {
  color: rgba(255,255,255,0.4);
  font-size: 0.8rem;
}

.tratamientos-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tratamiento-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 1rem;
}

.trat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.trat-tipo {
  color: #ffffff;
  font-weight: 700;
  font-size: 0.95rem;
}

.trat-estado {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
}
.trat-en-curso   { background: rgba(29,158,117,0.2); color: #1D9E75; }
.trat-finalizado { background: rgba(150,150,150,0.15); color: #aaa; }

.trat-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
  font-size: 0.82rem;
}

.trat-label {
  color: rgba(255,255,255,0.35);
  min-width: 90px;
  flex-shrink: 0;
}

.trat-val { color: rgba(255,255,255,0.75); }

.modal-container {
  min-height: 100%;
  background: #0f2318;
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
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.field-label {
  color: rgba(255,255,255,0.5);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.custom-select {
  --background: rgba(255,255,255,0.06);
  --color: #ffffff;
  --border-color: rgba(255,255,255,0.12);
  --border-radius: 10px;
  --padding-start: 1rem;
  width: 100%;
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
  margin-top: 0.5rem;
}
.btn-primary:disabled { background: rgba(29,158,117,0.3); cursor: not-allowed; }
.btn-primary:active:not(:disabled) { background: #167a5a; }

.btn-danger {
  width: 100%;
  padding: 0.85rem;
  background: transparent;
  color: #e74c3c;
  border: 1px solid rgba(231,76,60,0.3);
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-danger:active { background: rgba(231,76,60,0.08); }
</style>