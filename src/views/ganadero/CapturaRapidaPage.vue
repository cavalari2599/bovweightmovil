<template>
  <ion-page>
    <ion-content :scroll-y="true">
      <div class="page-container">

        <div class="page-header">
          <button class="back-btn" @click="retroceder">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="header-title-wrap">
            <div class="header-title">Captura Rápida</div>
            <div class="header-sub">Paso {{ numeroPaso }} de 4</div>
          </div>
        </div>

        <div class="content-body">

          <div v-if="paso === 'captura'" class="paso-wrapper">
            <h2 class="section-main-title">Toma una foto lateral</h2>
            <p class="section-main-sub">Coloque la vaca completa de perfil, parada y con buena iluminación.</p>

            <div v-if="!online" class="banner-offline-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e67e22" stroke-width="2.5"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M12 18.55h.01"/></svg>
              <span><strong>Modo sin conexión:</strong> La foto se guardará localmente y el peso se estimará automáticamente cuando recupere internet.</span>
            </div>

            <div class="guide-card-box">
              <div class="guide-card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <span>Requisitos para una estimación exacta:</span>
              </div>
              <ul class="guide-list">
                <li><strong>Distancia:</strong> De 3 a 5 metros (el animal debe llenar el 80% de la pantalla).</li>
                <li><strong>Ángulo:</strong> Completamente de costado (perfil recto a 90°).</li>
                <li><strong>Cuerpo completo:</strong> Desde la cabeza hasta la cola, incluyendo las pezuñas.</li>
              </ul>
            </div>

            <div class="foto-box-container" @click="tomarFoto">
              <img v-if="fotoPreview" :src="fotoPreview" class="foto-render-preview" />
              <div v-else class="foto-box-placeholder">
                <div class="cam-circle-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
                <span class="placeholder-main-txt">Abrir Cámara de la App</span>
                <span class="placeholder-sub-txt">Presione para capturar foto de perfil</span>
              </div>
            </div>

            <div class="input-block-group">
              <div class="field-label-custom">Sexo del animal: <span class="required-star">*</span></div>
              <div class="custom-segment-row" :class="{ 'segment-row-error': mostrarSexoError }">
                <button type="button" class="segment-btn-opt" :class="{ 'opt-active': sexo === 'F' }" @click="sexo = 'F'">
                  Hembra (Vaca / Novilla)
                </button>
                <button type="button" class="segment-btn-opt" :class="{ 'opt-active': sexo === 'M' }" @click="sexo = 'M'">
                  Macho (Toro / Novillo)
                </button>
              </div>
              <div v-if="mostrarSexoError" class="error-input-lbl">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>Debe seleccionar el sexo del animal para el cálculo.</span>
              </div>
            </div>

            <button type="button" class="btn-primary-action mar-top-lg" :disabled="loading" @click="estimar">
              <ion-spinner v-if="loading" name="crescent" color="light" />
              <span v-else>{{ online ? 'Calcular Peso Estimado' : 'Continuar y Guardar Local' }}</span>
            </button>
          </div>

          <div v-else-if="paso === 'resultado'" class="paso-wrapper ion-text-center">
            <h2 class="section-main-title">Peso estimado por Foto</h2>
            <p class="section-main-sub">Resultado del algoritmo de apoyo visual</p>

            <div class="resultado-display-card">
              <div class="peso-big-number">{{ pesoFinal }} <span class="peso-big-unit">kg</span></div>
            </div>

            <div class="warning-estimation-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e6b422" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>Este valor es un soporte digital aproximado y <strong>no distingue la raza</strong> del animal (un Brahman y un Holstein con la misma silueta dan un peso similar). Si usó una báscula física y conoce el peso exacto, modifíquelo abajo:</span>
            </div>

            <div class="input-block-group text-align-left">
              <div class="field-label-custom">Ajustar peso real (opcional):</div>
              <div class="custom-input-numeric-wrap">
                <input v-model="pesoFinal" type="number" inputmode="decimal" min="1" placeholder="Ej: 450" />
                <span class="input-side-unit">KG</span>
              </div>
            </div>

            <button type="button" class="btn-primary-action mar-top-md" :disabled="!pesoValido" @click="paso = 'finca'; cargarFincas()">
              Confirmar Peso y Continuar
            </button>
            
            <button type="button" class="btn-secondary-outline" @click="reiniciarCaptura">
              Descartar y Tomar otra Foto
            </button>
          </div>

          <div v-else-if="paso === 'finca'" class="paso-wrapper">
            <h2 class="section-main-title">¿En cuál finca se encuentra?</h2>
            <p class="section-main-sub">Filtrando el catálogo de ganado correspondiente.</p>

            <div v-if="loading" class="loading-wrap-center"><ion-spinner color="success" /></div>
            
            <div v-else class="flat-cards-list">
              <div v-for="f in fincas" :key="f.id_finca" class="flat-select-card" @click="elegirFinca(f)">
                <div class="flat-card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <div class="flat-card-details">
                  <div class="flat-card-title-name">{{ f.nombre_finca }}</div>
                  <div class="flat-card-sub-desc">{{ f.ubicacion_finca }}</div>
                </div>
                <svg class="flat-card-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          </div>

          <div v-else-if="paso === 'animal'" class="paso-wrapper">
            <h2 class="section-main-title">¿A qué animal pertenece el peso?</h2>
            <p class="section-main-sub">Finca Activa: <span class="highlight-farm">{{ fincaSel?.nombre_finca }}</span></p>

            <div class="custom-search-field-bar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input v-model="busqueda" type="text" placeholder="Escriba número de arete o nombre..." />
            </div>

            <div v-if="loading" class="loading-wrap-center"><ion-spinner color="success" /></div>
            
            <div v-else class="flat-cards-list">
              <div v-for="a in animalesFiltrados" :key="a.n_arete" class="flat-select-card" @click="guardar(a)">
                <div class="flat-card-icon shadow-animal-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
                <div class="flat-card-details">
                  <div class="flat-card-title-name">{{ a.nombre_animal || 'Sin nombre asignado' }}</div>
                  <div class="flat-card-sub-desc">Código Arete: <strong>{{ a.n_arete }}</strong> · Último peso: {{ a.peso ?? '-' }} kg</div>
                </div>
                <svg class="flat-card-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          </div>

          <div v-else-if="paso === 'guardado'" class="paso-wrapper text-center-align pad-top-lg">
            <div class="success-icon-badge">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h2 class="success-main-title">¡Pesaje Guardado con Éxito!</h2>
            <button type="button" class="btn-primary-action mar-top-lg" @click="volverMenu">Finalizar y Volver al Menú</button>
          </div>

          <div v-else-if="paso === 'offline_guardado'" class="paso-wrapper text-center-align pad-top-lg">
            <div class="success-icon-badge warning-badge-color">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#e67e22" stroke-width="2.5"><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
            </div>
            <h2 class="success-main-title">Guardado Local</h2>
            <button type="button" class="btn-primary-action mar-top-lg" @click="volverMenu">Entendido, Volver al Menú</button>
          </div>

          <div v-if="error" class="global-error-banner-toast">{{ error }}</div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonSpinner, onIonViewWillEnter } from '@ionic/vue'

// Importaciones del plugin nativo de cámara de Capacitor
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

import { ganaderoService } from '../../services/ganadero'
import { colaPesajes } from '../../services/colaPesajes'
import { comprimirImagen } from '../../services/media'
import { useOnline } from '../../composables/useOnline'
import { paths } from '../../router/paths'

const router = useRouter()
const online = useOnline()

const paso = ref('captura') 
const loading = ref(false)
const error = ref('')

const fotoFile = ref(null)
const fotoPreview = ref('')
const sexo = ref('')
const mostrarSexoError = ref(false)
const pesoEstimado = ref(null)
const pesoFinal = ref('')

watch(sexo, (v) => { if (v) mostrarSexoError.value = false })

onIonViewWillEnter(() => reiniciarTodo())

const fincas = ref([])
const fincaSel = ref(null)
const animales = ref([])
const animalSel = ref(null)
const busqueda = ref('')

const pesoValido = computed(() => Number(pesoFinal.value) > 0)
const numeroPaso = computed(() => paso.value === 'captura' ? 1 : paso.value === 'resultado' ? 2 : paso.value === 'finca' ? 3 : 4)

const animalesFiltrados = computed(() => {
  // Solo animales activos: vendidos/muertos no pueden recibir pesaje
  const activos = animales.value.filter(a => a.estado === 'Activo')
  const q = busqueda.value.trim().toLowerCase()
  if (!q) return activos
  return activos.filter(a =>
    String(a.n_arete).toLowerCase().includes(q) || (a.nombre_animal || '').toLowerCase().includes(q))
})

async function tomarFoto() {
  try {
    error.value = ''
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri, 
      source: CameraSource.Camera,    
    })

    const response = await fetch(image.webPath)
    const blob = await response.blob()
    
    const file = new File([blob], `bovino_${Date.now()}.jpg`, { type: 'image/jpeg' })
    
    fotoFile.value = await comprimirImagen(file)
    fotoPreview.value = URL.createObjectURL(fotoFile.value)
  } catch (e) {
    if (e.message !== 'User cancelled photos app') {
      error.value = 'No se pudo acceder al hardware de la cámara nativa.'
    }
  }
}

async function estimar() {
  if (!fotoFile.value) {
    error.value = 'Primero tome una foto de perfil del animal.'
    return
  }
  if (!sexo.value) {
    mostrarSexoError.value = true
    return
  }
  error.value = ''

  if (!online.value) return guardarOffline()

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
    error.value = e.response?.data?.message || 'Error al procesar la imagen.'
  } finally { loading.value = false }
}

async function cargarFincas() {
  error.value = ''; loading.value = true
  try {
    const { data } = await ganaderoService.getFincas()
    fincas.value = data
  } catch { error.value = 'Error al vincular el catálogo de fincas.' }
  finally { loading.value = false }
}

async function elegirFinca(f) {
  fincaSel.value = f; paso.value = 'animal'; busqueda.value = ''; loading.value = true
  try {
    const { data } = await ganaderoService.getAnimales(f.id_finca)
    animales.value = data
  } catch { error.value = 'Error al cargar el ganado asignado.' }
  finally { loading.value = false }
}

async function guardar(a) {
  error.value = ''; loading.value = true
  try {
    const fd = new FormData()
    fd.append('peso_aproximado', Number(pesoFinal.value))
    fd.append('sexo', sexo.value)
    if (fotoFile.value) fd.append('foto', fotoFile.value)
    await ganaderoService.crearPesaje(a.n_arete, fd)
    animalSel.value = a
    paso.value = 'guardado'
  } catch (e) { error.value = e.response?.data?.message || 'Imposible registrar el pesaje.' }
  finally { loading.value = false }
}

async function guardarOffline() {
  error.value = ''; loading.value = true
  try {
    await colaPesajes.encolar({ sexo: sexo.value, foto: fotoFile.value })
    paso.value = 'offline_guardado'
  } catch { error.value = 'Fallo al escribir en la cola local.' }
  finally { loading.value = false }
}

function reiniciarCaptura() {
  fotoFile.value = null; fotoPreview.value = ''; pesoEstimado.value = null; pesoFinal.value = ''; mostrarSexoError.value = false; error.value = ''; paso.value = 'captura'
}

function reiniciarTodo() {
  reiniciarCaptura(); sexo.value = ''; busqueda.value = ''; fincas.value = []; fincaSel.value = null; animalSel.value = null; animales.value = []
}

function volverMenu() { router.push(paths.ganadero.menu) }

function retroceder() {
  switch (paso.value) {
    case 'captura': return volverMenu()
    case 'resultado': return reiniciarCaptura()
    case 'finca': paso.value = 'resultado'; return
    case 'animal': paso.value = 'finca'; return
    default: return volverMenu()
  }
}
</script>

<style scoped>
ion-content { --background: #0f2318; }
.page-container { min-height: 100%; background: #0f2318; padding-bottom: 3rem; }
.page-header { display: flex; align-items: center; gap: 0.75rem; padding: 1.1rem 1.2rem; border-bottom: 2px solid #1D9E75; background: rgba(15, 35, 24, 0.95); }
.back-btn { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); border-radius: 9px; color: #ffffff; padding: 0.5rem; display: flex; align-items: center; cursor: pointer; }
.header-title-wrap { flex: 1; }
.header-title { color: #ffffff; font-weight: 800; font-size: 1.1rem; font-family: Georgia, serif; }
.header-sub { color: #1D9E75; font-size: 0.76rem; margin-top: 1px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

.content-body { padding: 1.2rem; display: flex; flex-direction: column; }
.paso-wrapper { display: flex; flex-direction: column; gap: 1.1rem; }
.section-main-title { color: #ffffff; font-size: 1.2rem; font-weight: 700; font-family: Georgia, serif; margin: 0; }
.section-main-sub { color: rgba(255,255,255,0.7); font-size: 0.85rem; margin: -0.5rem 0 0; font-weight: 500; }

.banner-offline-box { display: flex; gap: 0.6rem; align-items: flex-start; background: rgba(230, 126, 34, 0.12); border: 1px solid rgba(230, 126, 34, 0.3); border-radius: 12px; padding: 0.8rem 1rem; color: #f39c12; font-size: 0.82rem; line-height: 1.4; }
.banner-offline-box strong { color: #ffffff; }

.guide-card-box { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 14px; overflow: hidden; }
.guide-card-header { display: flex; align-items: center; gap: 0.45rem; padding: 0.65rem 0.9rem; background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.08); color: #ffffff; font-size: 0.82rem; font-weight: 700; }
.guide-list { margin: 0; padding: 0.8rem 1rem 0.8rem 1.8rem; display: flex; flex-direction: column; gap: 0.35rem; }
.guide-list li { color: rgba(255,255,255,0.85); font-size: 0.82rem; }
.guide-list li strong { color: #24c290; }

.foto-box-container { display: block; width: 100%; background: rgba(255, 255, 255, 0.04); border: 2px dashed rgba(29, 158, 117, 0.4); border-radius: 16px; overflow: hidden; cursor: pointer; position: relative; }
.foto-render-preview { display: block; width: 100%; max-height: 280px; object-fit: contain; background: #000000; }
.foto-box-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3.5rem 1rem; text-align: center; }
.cam-circle-icon { width: 56px; height: 56px; background: rgba(29, 158, 117, 0.12); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 0.75rem; }
.placeholder-main-txt { color: #ffffff; font-size: 0.95rem; font-weight: 700; }
.placeholder-sub-txt { color: rgba(255,255,255,0.5); font-size: 0.76rem; margin-top: 0.2rem; font-weight: 500; }

.input-block-group { display: flex; flex-direction: column; gap: 0.45rem; }
.field-label-custom { color: #ffffff; font-size: 0.92rem; font-weight: 700; }
.required-star { color: #e74c3c; }
.custom-segment-row { display: flex; background: rgba(255,255,255,0.06); border-radius: 12px; padding: 0.3rem; gap: 0.3rem; border: 1px solid rgba(255,255,255,0.1); }
.segment-row-error { border-color: #e74c3c; background: rgba(231, 76, 60, 0.04); }
.segment-btn-opt { flex: 1; background: transparent; border: none; padding: 0.85rem 0.5rem; color: rgba(255,255,255,0.6); font-weight: 600; font-size: 0.88rem; border-radius: 9px; cursor: pointer; }
.segment-btn-opt.opt-active { background: #1D9E75; color: #ffffff; font-weight: 700; }
.error-input-lbl { display: flex; align-items: center; gap: 0.35rem; color: #ef5350; font-size: 0.78rem; font-weight: 600; margin-top: 0.1rem; }

.resultado-display-card { background: linear-gradient(135deg, #1D9E75 0%, #0d6e50 100%); border-radius: 20px; padding: 2.2rem 1rem; text-align: center; box-shadow: 0 6px 20px rgba(29,158,117,0.25); border: 1px solid rgba(255,255,255,0.1); }
.peso-big-number { color: #ffffff; font-size: 3.5rem; font-weight: 800; font-family: system-ui, sans-serif; letter-spacing: -1px; }
.peso-big-unit { font-size: 1.4rem; font-weight: 700; margin-left: 0.2rem; color: #24c290; }
.warning-estimation-box { display: flex; gap: 0.6rem; align-items: flex-start; text-align: left; background: rgba(230, 180, 34, 0.08); border: 1px solid rgba(230, 180, 34, 0.25); border-radius: 14px; padding: 0.85rem 1rem; color: #e6b422; font-size: 0.82rem; line-height: 1.4; }
.custom-input-numeric-wrap { display: flex; align-items: center; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; overflow: hidden; }
.custom-input-numeric-wrap input { flex: 1; background: none; border: none; padding: 0.95rem 1.1rem; color: #ffffff; font-size: 1.1rem; font-weight: 700; outline: none; }
.input-side-unit { padding-right: 1.1rem; color: #1D9E75; font-weight: 800; font-size: 0.95rem; }

.custom-search-field-bar { display: flex; align-items: center; gap: 0.6rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 0.85rem 1.1rem; color: rgba(255,255,255,0.4); }
.custom-search-field-bar input { flex: 1; background: none; border: none; color: #ffffff; font-size: 1rem; outline: none; font-weight: 600; }
.custom-search-field-bar input::placeholder { color: rgba(255,255,255,0.4); }

.flat-cards-list { display: flex; flex-direction: column; gap: 0.6rem; }
.flat-select-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 14px; padding: 0.95rem 1rem; display: flex; align-items: center; gap: 0.85rem; cursor: pointer; }
.flat-select-card:active { background: rgba(255,255,255,0.09); transform: scale(0.985); }
.flat-card-icon { width: 42px; height: 42px; border-radius: 11px; background: rgba(29,158,117,0.12); border: 1px solid rgba(29,158,117,0.2); color: #1D9E75; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.shadow-animal-icon { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); color: #1D9E75; }
.flat-card-details { flex: 1; min-width: 0; text-align: left; }
.flat-card-title-name { color: #ffffff; font-weight: 700; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.flat-card-sub-desc { color: rgba(255,255,255,0.75); font-size: 0.78rem; margin-top: 0.15rem; font-weight: 500; }
.flat-card-sub-desc strong { color: #ffffff; }
.flat-card-chevron { color: rgba(255,255,255,0.25); flex-shrink: 0; }
.highlight-farm { color: #24c290; font-weight: 700; }

.text-center-align { text-align: center; }
.pad-top-lg { padding-top: 1.5rem; }
.success-icon-badge { width: 80px; height: 80px; background: rgba(29,158,117,0.12); border: 2px solid rgba(29,158,117,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
.warning-badge-color { background: rgba(230, 126, 34, 0.1); border-color: rgba(230, 126, 34, 0.2); }
.success-main-title { color: #ffffff; font-size: 1.3rem; font-weight: 700; font-family: Georgia, serif; margin: 0 0 0.5rem; }
.success-sub-text-p { color: rgba(255,255,255,0.8); font-size: 0.88rem; line-height: 1.4; max-width: 340px; margin: 0 auto; font-weight: 500; }

.global-error-banner-toast { background: #e74c3c; color: white; border-radius: 10px; padding: 0.8rem 1rem; font-size: 0.85rem; font-weight: 700; text-align: center; margin-top: 1.2rem; }
.loading-wrap-center { display: flex; justify-content: center; padding: 2.5rem; }

.btn-primary-action { width: 100%; height: 50px; background: #1D9E75; color: white; border: none; border-radius: 12px; font-size: 0.95rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(29, 158, 117, 0.2); }
.btn-primary-action:active { background: #167a5a; }
.btn-secondary-outline { width: 100%; height: 50px; background: transparent; color: #ffffff; border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; font-size: 0.95rem; font-weight: 700; cursor: pointer; margin-top: 0.6rem; }
.btn-secondary-outline:active { background: rgba(255,255,255,0.06); }

.mar-top-lg { margin-top: 1.2rem; }
.mar-top-md { margin-top: 0.8rem; }
</style>