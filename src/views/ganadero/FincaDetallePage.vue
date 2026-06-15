<template>
  <ion-page>
    <ion-content :scroll-y="true">
      <div class="page-container">

<div class="page-header">
  <button class="back-btn" @click="router.push(paths.ganadero.fincas)">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
  </button>
  <div class="header-title-wrap">
    <div class="header-title">{{ finca?.nombre_finca || 'Detalle de Finca' }}</div>
    <div class="header-sub">Administración de personal autorizado</div>
  </div>
</div>
        <div v-if="loading" class="loading-wrap">
          <ion-spinner color="success" />
        </div>

        <div v-else class="content-body">
          
          <div class="finca-hero-card">
            <div class="finca-badge-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div class="finca-hero-texts">
              <h3 class="finca-main-name">{{ finca?.nombre_finca }}</h3>
              <p class="finca-main-location">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {{ finca?.ubicacion_finca }}
              </p>
            </div>
          </div>

          <div class="seccion-bloque">
            <div class="seccion-header-status">
              <div class="status-title-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span class="text-normal-header">Veterinarios Profesionales</span>
              </div>
              <button class="add-inline-btn" @click="abrirModalVeterinario">
                <span>+ Vincular</span>
              </button>
            </div>

            <div class="custom-list">
              <div v-for="v in veterinariosAsignados" :key="v.identificacion_usuario" class="custom-card user-card">
                <div class="card-main-info">
                  <div class="avatar-user-wrap">
                    <span>V</span>
                  </div>
                  <div class="card-texts">
                    <div class="user-name">{{ v.nombre_usuario }} {{ v.apellido1_usuario }}</div>
                    <div class="user-email">{{ v.correo }}</div>
                  </div>
                </div>
                <button class="btn-remove-user" @click="desasignarVeterinario(v)" title="Quitar veterinario">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>

              <div v-if="veterinariosAsignados.length === 0" class="empty-state-card">
                <p>No hay veterinarios vinculados a esta finca.</p>
              </div>
            </div>
          </div>

          <div class="seccion-bloque">
            <div class="seccion-header-status">
              <div class="status-title-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span class="text-normal-header">Ayudantes de Campo</span>
              </div>
              <button class="add-inline-btn" @click="abrirModalAyudante">
                <span>+ Vincular</span>
              </button>
            </div>

            <div class="custom-list">
              <div v-for="a in ayudantesAsignados" :key="a.identificacion_usuario" class="custom-card user-card">
                <div class="card-main-info">
                  <div class="avatar-user-wrap helper-color">
                    <span>A</span>
                  </div>
                  <div class="card-texts">
                    <div class="user-name">{{ a.nombre_usuario }} {{ a.apellido1_usuario }}</div>
                    <div class="user-email">{{ a.correo }}</div>
                  </div>
                </div>
                <button class="btn-remove-user" @click="desasignarAyudante(a)" title="Quitar ayudante">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>

              <div v-if="ayudantesAsignados.length === 0" class="empty-state-card">
                <p>No hay ayudantes vinculados a esta finca.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <ion-modal :is-open="modalVeterinario" @did-dismiss="modalVeterinario = false">
        <ion-header>
          <ion-toolbar class="modal-header-toolbar">
            <ion-title class="modal-header-title">Vincular Veterinario</ion-title>
            <ion-buttons slot="end">
              <button class="modal-close-btn" @click="modalVeterinario = false">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="modal-content-dark">
          <div class="modal-body-wrapper">
            <div class="field-label-modal">Seleccione un profesional para añadirlo a la finca:</div>
            
            <div class="modal-user-scroll-list">
              <div v-for="v in veterinariosDisponibles" :key="v.identificacion_usuario" class="modal-user-selector-item" @click="asignarVeterinario(v)">
                <div class="modal-user-avatar">V</div>
                <div class="modal-user-details">
                  <div class="m-user-name">{{ v.nombre_usuario }} {{ v.apellido1_usuario }}</div>
                  <div class="m-user-email">{{ v.correo }}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <div v-if="veterinariosDisponibles.length === 0" class="empty-state-text">No hay más veterinarios disponibles para registrar.</div>
            </div>
          </div>
        </ion-content>
      </ion-modal>

      <ion-modal :is-open="modalAyudante" @did-dismiss="modalAyudante = false">
        <ion-header>
          <ion-toolbar class="modal-header-toolbar">
            <ion-title class="modal-header-title">Vincular Ayudante</ion-title>
            <ion-buttons slot="end">
              <button class="modal-close-btn" @click="modalAyudante = false">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="modal-content-dark">
          <div class="modal-body-wrapper">
            <div class="field-label-modal">Seleccione un ayudante para añadirlo a la finca:</div>
            
            <div class="modal-user-scroll-list">
              <div v-for="a in ayudantesDisponibles" :key="a.identificacion_usuario" class="modal-user-selector-item" @click="asignarAyudante(a)">
                <div class="modal-user-avatar helper-bg">A</div>
                <div class="modal-user-details">
                  <div class="m-user-name">{{ a.nombre_usuario }} {{ a.apellido1_usuario }}</div>
                  <div class="m-user-email">{{ a.correo }}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <div v-if="ayudantesDisponibles.length === 0" class="empty-state-text">No hay más ayudantes disponibles para registrar.</div>
            </div>
          </div>
        </ion-content>
      </ion-modal>

    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonPage, IonContent, IonSpinner, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons } from '@ionic/vue'
import { ganaderoService } from '../../services/ganadero'
import { paths } from '../../router/paths'

const route = useRoute()
const router = useRouter()
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
    loading.value = true
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
    } catch {
        finca.value = null
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
    await ganaderoService.desasignarAyudante(idFinca, a.identificacion_usuario)
    await cargarDatos()
}

onMounted(cargarDatos)
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
  background: #0f2318;
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
.header-sub { color: rgba(255, 255, 255, 0.65); font-size: 0.76rem; margin-top: 1px; font-weight: 500; }

.content-body { padding: 1.2rem; display: flex; flex-direction: column; gap: 1.5rem; }

.finca-hero-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 16px;
  padding: 1.2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  backdrop-filter: blur(8px);
}

.finca-badge-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: rgba(29, 158, 117, 0.12);
  border: 1px solid rgba(29, 158, 117, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.finca-hero-texts { flex: 1; min-width: 0; }
.finca-main-name { color: #ffffff; margin: 0; font-weight: 800; font-size: 1.25rem; font-family: Georgia, serif; }
.finca-main-location { color: rgba(255, 255, 255, 0.8); margin: 0.3rem 0 0; font-size: 0.85rem; display: flex; align-items: center; gap: 0.35rem; font-weight: 600; }

.seccion-bloque {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
}

.seccion-header-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.status-title-wrap { display: flex; align-items: center; gap: 0.5rem; }
.text-normal-header { color: #ffffff; font-weight: 700; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.5px; }

.add-inline-btn {
  background: #1D9E75;
  border: none;
  border-radius: 8px;
  color: white;
  padding: 0.35rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}
.add-inline-btn:active { background: #167a5a; }

.custom-list { display: flex; flex-direction: column; padding: 0.8rem; gap: 0.6rem; }

.custom-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-main-info { display: flex; align-items: center; gap: 0.85rem; flex: 1; min-width: 0; }

.avatar-user-wrap {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(29, 158, 117, 0.15);
  border: 1px solid rgba(29, 158, 117, 0.3);
  color: #24c290;
  font-weight: 800;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.helper-color { background: rgba(230, 126, 34, 0.12); border-color: rgba(230, 126, 34, 0.25); color: #e67e22; }

.card-texts { flex: 1; min-width: 0; }
.user-name { color: #ffffff; font-weight: 700; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-email { color: rgba(255, 255, 255, 0.85); font-size: 0.82rem; margin-top: 0.1rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.btn-remove-user {
  width: 44px;
  height: 44px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
.btn-remove-user:active { background: rgba(231, 76, 60, 0.12); border-color: rgba(231, 76, 60, 0.4); color: #e74c3c; }

.empty-state-card { padding: 1.8rem 1rem; text-align: center; color: rgba(255, 255, 255, 0.7); font-size: 0.85rem; font-weight: 600; }
.loading-wrap { display: flex; justify-content: center; padding: 3rem; }

/* MODALES DE ALTO CONTRASTE */
.modal-content-dark { --background: #0f2318; }
.modal-header-toolbar { --background: #0f2318; border-bottom: 2px solid #1D9E75; padding-top: 0.5rem; padding-bottom: 0.5rem; }
.modal-header-title { color: #ffffff !important; font-family: Georgia, serif; font-weight: 700; font-size: 1.1rem; }

.modal-close-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem;
  margin-right: 0.6rem;
  cursor: pointer;
}

.modal-body-wrapper { padding: 1rem 1.2rem 2rem; display: flex; flex-direction: column; gap: 1rem; }
.field-label-modal { color: #ffffff; font-size: 0.92rem; font-weight: 700; margin-bottom: 0.2rem; }

.modal-user-scroll-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 340px; overflow-y: auto; }
.modal-user-selector-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.8rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  cursor: pointer;
}
.modal-user-selector-item:active { background: rgba(255, 255, 255, 0.09); }

.modal-user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(29, 158, 117, 0.15);
  color: #24c290;
  font-weight: 800;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.helper-bg { background: rgba(230, 126, 34, 0.15); color: #e67e22; }
.modal-user-details { flex: 1; min-width: 0; }
.m-user-name { color: white; font-weight: 700; font-size: 0.95rem; }
.m-user-email { color: rgba(255, 255, 255, 0.8); font-size: 0.8rem; font-weight: 600; }
.empty-state-text { color: rgba(255, 255, 255, 0.4); font-size: 0.85rem; text-align: center; padding: 1.5rem; font-weight: 600; }
</style>