<template>
  <ion-page>
    <ion-content :scroll-y="true">
      <div class="page-container">

        <div class="page-header">
          <button class="back-btn" @click="router.back()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="header-title-wrap">
            <div class="header-title">Mis Animales</div>
            <div class="header-sub">{{ animalesFiltrados.length }} animal{{ animalesFiltrados.length !== 1 ? 'es' : '' }}</div>
          </div>
          <div class="header-actions">
            <button class="icon-btn icon-btn-label" @click="exportarExcel" :disabled="animales.length === 0">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  <span>Excel</span>
</button>
            <button class="add-btn" @click="abrirModalCrear">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Agregar</span>
            </button>
          </div>
        </div>

        <div v-if="resumen" class="resumen-strip">
          <div class="resumen-item">
            <div class="resumen-num">{{ resumen.total_animales }}</div>
            <div class="resumen-label">Animales</div>
          </div>
          <div class="resumen-divider"></div>
          <div class="resumen-item">
            <div class="resumen-num">{{ resumen.peso_promedio }}</div>
            <div class="resumen-label">Peso prom. (kg)</div>
          </div>
          <div class="resumen-divider"></div>
          <div class="resumen-item">
            <div class="resumen-num">{{ resumen.peso_maximo }}</div>
            <div class="resumen-label">Peso máx. (kg)</div>
          </div>
        </div>

        <div class="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="busqueda" type="text" placeholder="Buscar por nombre o arete..." />
          <button v-if="busqueda" class="clear-search" @click="busqueda = ''">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="filtros-wrap">
          <div class="filtro-group">
            <button
              v-for="f in filtros"
              :key="f.value"
              class="filtro-btn"
              :class="{ active: filtro === f.value }"
              @click="filtro = f.value"
            >{{ f.label }}</button>
          </div>
          <div class="orden-select-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="10" y2="18"/></svg>
            <select v-model="ordenar" @change="cargarAnimales" class="orden-select">
              <option value="peso">Por peso</option>
              <option value="nombre">Por nombre</option>
              <option value="fecha">Por fecha</option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="loading-wrap">
          <ion-spinner color="success" />
        </div>

        <div v-else class="animals-list">

          <div v-if="animalesFiltrados.length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <p>No hay animales en esta vista.</p>
            <button class="btn-primary" @click="abrirModalCrear">Registrar primer animal</button>
          </div>

         <div
            v-for="(animal, i) in animalesFiltrados"
            :key="animal.n_arete"
            class="animal-card"
            :style="{ animationDelay: `${i * 50}ms` }"
            @click="verDetalle(animal)"
          >
            <div class="animal-avatar">
              <img v-if="animal.foto_animal" :src="fotoUrl(animal.foto_animal)" alt="foto" />
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>

            <div class="animal-info">
              <div class="animal-top">
                <div class="animal-nombre">{{ animal.nombre_animal || 'Sin nombre' }}</div>
                <div class="estado-badge" :class="estadoClass(animal.estado)">{{ animal.estado }}</div>
              </div>
              <div class="animal-meta">
                <span>{{ animal.n_arete }}</span>
                <span class="dot">·</span>
                <span>{{ animal.raza || 'Sin raza' }}</span>
              </div>
              <div class="animal-peso">{{ animal.peso }} kg</div>

              <div v-if="animal.estado === 'Activo'" class="acciones-rapidas" @click.stop>
                <button class="accion-btn accion-vendido" @click.stop="marcarEstado(animal, 'Vendido')">Marcar vendido</button>
                <button class="accion-btn accion-muerto" @click.stop="marcarEstado(animal, 'Muerto')">Marcar fallecido</button>
              </div>
            </div>

            <div class="animal-actions" @click.stop>
              <button class="edit-btn" @click.stop="abrirModalEditar(animal)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>

        </div>
      </div>

      <animal-form-modal
        :is-open="modalAbierto"
        :animal="animalEditando"
        :id-finca="idFinca"
        :razas="razas"
        @dismiss="modalAbierto = false"
        @saved="onSaved"
      />

    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { IonPage, IonContent, IonSpinner, alertController } from '@ionic/vue'
import { ganaderoService } from '../../services/ganadero'
import { fotoUrl } from '../../services/media'
import { exportarAnimales } from '../../services/export'
import { paths } from '../../router/paths'
import AnimalFormModal from '../../components/ganadero/AnimalFormModal.vue'

const router = useRouter()
const route = useRoute()
const idFinca = route.params.idFinca

const animales = ref([])
const resumen = ref(null)
const loading = ref(true)
const ordenar = ref('peso')
const filtro = ref('activos')
const busqueda = ref('')
const modalAbierto = ref(false)
const animalEditando = ref(null)

const filtros = [
  { value: 'activos', label: 'Activos' },
  { value: 'inactivos', label: 'Inactivos' },
  { value: 'todos', label: 'Todos' },
]

const razas = [
  'Brahman', 'Gyr', 'Nelore', 'Guzerá', 'Cebú',
  'Holstein', 'Jersey', 'Pardo Suizo', 'Angus', 'Hereford',
  'Charolais', 'Simmental', 'Romosinuano', 'Senepol', 'Cruce / Encaste', 'Otra',
]

const animalesFiltrados = computed(() => {
  let lista = animales.value
  if (filtro.value === 'activos') lista = lista.filter(a => a.estado === 'Activo')
  else if (filtro.value === 'inactivos') lista = lista.filter(a => a.estado === 'Vendido' || a.estado === 'Muerto')
  const q = busqueda.value.trim().toLowerCase()
  if (q) lista = lista.filter(a =>
    (a.nombre_animal || '').toLowerCase().includes(q) ||
    (a.n_arete || '').toLowerCase().includes(q)
  )
  return lista
})

function estadoClass(estado) {
  if (estado === 'Activo') return 'estado-activo'
  if (estado === 'Vendido') return 'estado-vendido'
  return 'estado-muerto'
}

async function cargarAnimales() {
  loading.value = true
  try {
    const [animalesRes, resumenRes] = await Promise.all([
      ganaderoService.getAnimales(idFinca, ordenar.value),
      ganaderoService.getResumenFinca(idFinca),
    ])
    animales.value = animalesRes.data
    resumen.value = resumenRes.data
  } finally {
    loading.value = false
  }
}

function verDetalle(animal) {
  router.push(`${paths.ganadero.animalDetalle(animal.n_arete)}?idFinca=${idFinca}`)
}

function exportarExcel() {
  if (animales.value.length === 0) return
  exportarAnimales(animales.value, `finca_${idFinca}`)
}

function abrirModalCrear() {
  animalEditando.value = null
  modalAbierto.value = true
}

function abrirModalEditar(animal) {
  animalEditando.value = animal
  modalAbierto.value = true
}

function onSaved() {
  modalAbierto.value = false
  cargarAnimales()
}

async function marcarEstado(animal, estado) {
  const alert = await alertController.create({
    header: `Marcar como ${estado}`,
    message: `¿Marcar a "${animal.nombre_animal || animal.n_arete}" como ${estado}?`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Confirmar',
        handler: async () => {
          await ganaderoService.editarAnimal(animal.n_arete, { estado })
          await cargarAnimales()
        },
      },
    ],
  })
  await alert.present()
}

onMounted(cargarAnimales)
</script>

<style scoped>
ion-content { --background: #0f2318; }

.page-container {
  min-height: 100%;
  background: #0f2318;
  padding-bottom: 2rem;
}

/* HEADER */
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

.header-actions { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }

.icon-btn {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 9px;
  color: rgba(255,255,255,0.6);
  padding: 0.45rem;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }

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
}
.add-btn:active { background: #167a5a; }

/* RESUMEN */
.resumen-strip {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 1rem 1.2rem;
  background: rgba(29,158,117,0.08);
  border-bottom: 1px solid rgba(29,158,117,0.12);
}

.resumen-item { text-align: center; }
.resumen-num { color: #1D9E75; font-weight: 700; font-size: 1.4rem; line-height: 1; }
.resumen-label { color: rgba(255,255,255,0.4); font-size: 0.7rem; margin-top: 0.2rem; }
.resumen-divider { width: 1px; height: 32px; background: rgba(255,255,255,0.08); }

.search-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 1rem 1rem 0;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 0.65rem 0.9rem;
  color: rgba(255,255,255,0.4);
}

.search-wrap input {
  flex: 1;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 0.9rem;
  outline: none;
}
.search-wrap input::placeholder { color: rgba(255,255,255,0.25); }

.clear-search {
  background: none;
  border: none;
  color: rgba(255,255,255,0.4);
  padding: 0;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.filtros-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  gap: 0.75rem;
}

.filtro-group { display: flex; gap: 0.4rem; }

.filtro-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  color: rgba(255,255,255,0.5);
  padding: 0.3rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.filtro-btn.active {
  background: rgba(29,158,117,0.2);
  border-color: rgba(29,158,117,0.4);
  color: #1D9E75;
  font-weight: 700;
}

.orden-select-wrap {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: rgba(255,255,255,0.35);
}

.orden-select {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: rgba(255,255,255,0.6);
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  outline: none;
}

.loading-wrap { display: flex; justify-content: center; padding: 3rem; }

.animals-list {
  padding: 0 1rem;
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

.animal-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 14px;
  padding: 0.9rem;
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  cursor: pointer;
  backdrop-filter: blur(8px);
  animation: slideIn 0.35s ease both;
  transition: background 0.15s;
}
.animal-card:active { background: rgba(255,255,255,0.09); transform: scale(0.985); }

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}

.animal-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(29,158,117,0.12);
  border: 1px solid rgba(29,158,117,0.2);
  color: #1D9E75;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.animal-avatar img { width: 100%; height: 100%; object-fit: cover; }

.animal-info { flex: 1; min-width: 0; }

.animal-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.2rem;
}

.animal-nombre {
  color: #ffffff;
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.estado-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
  flex-shrink: 0;
}
.estado-activo  { background: rgba(29,158,117,0.2); color: #1D9E75; }
.estado-vendido { background: rgba(230,180,34,0.2); color: #e6b422; }
.estado-muerto  { background: rgba(150,150,150,0.2); color: #aaa; }

.animal-meta {
  color: rgba(255,255,255,0.38);
  font-size: 0.77rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.25rem;
}
.dot { opacity: 0.4; }

.animal-peso {
  color: #1D9E75;
  font-weight: 700;
  font-size: 0.95rem;
}

.acciones-rapidas {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.8rem;
  padding-top: 0.6rem;
  border-top: 1px solid rgba(255,255,255,0.06); 
}

.accion-btn {
  flex: 1; 
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.4rem 0.6rem; 
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid;
  transition: background 0.2s;
}

.accion-vendido {
  background: rgba(230,180,34,0.1);
  border-color: rgba(230,180,34,0.3);
  color: #e6b422;
}
.accion-vendido:active { background: rgba(230,180,34,0.2); }

.accion-muerto {
  background: rgba(231,76,60,0.1);
  border-color: rgba(231,76,60,0.3);
  color: #e74c3c;
}
.accion-muerto:active { background: rgba(231,76,60,0.2); }

.animal-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  padding-top: 0.1rem;
}

.edit-btn {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: rgba(255,255,255,0.5);
  padding: 0.35rem;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.edit-btn:active { background: rgba(255,255,255,0.12); }

.chevron { color: rgba(255,255,255,0.2); }

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #1D9E75;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.icon-btn-label {
  padding: 0.45rem 0.75rem;
  gap: 0.3rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
}

.btn-primary:active { background: #167a5a; }
</style>