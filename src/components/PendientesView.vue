<template>
  <ion-page>
    <ion-content :scroll-y="true">
      <div class="page-container">

        <div class="page-header">
          <button class="back-btn" @click="router.push(backHref)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="header-title-wrap">
            <div class="header-title">Pesajes por Aceptar</div>
            <div class="header-sub">Cola de procesamiento y estimación de capturas</div>
          </div>
        </div>

        <div class="content-body">
          <div v-if="!online" class="banner-offline">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 7-3M12 20h.01"/></svg>
            <span>Modo desconectado. Las capturas se estimarán al recuperar internet.</span>
          </div>

          <div v-if="estimando" class="banner-info">
            <ion-spinner name="crescent" color="success" /> 
            <span>Sincronizando y estimando pesos pendientes...</span>
          </div>

          <div v-if="loading" class="loading-wrap-center">
            <ion-spinner color="success" />
          </div>

          <div v-else-if="pendientes.length === 0" class="vacio-box">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#24c290" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11"/></svg>
            <p>Todo al día. No hay pesajes pendientes por aceptar.</p>
          </div>

          <div v-else class="flat-cards-list">
            <div v-for="p in pendientes" :key="p.id" class="flat-select-card item-pesaje-card">
              <div class="foto-container-frame">
                <img :src="p.preview" alt="captura bovino" class="foto-render" />
              </div>

              <div class="meta-bovino-strip">
                <span class="badge-sexo" :class="p.sexo === 'M' ? 'sexo-macho' : 'sexo-hembra'">
                  {{ p.sexo === 'M' ? 'Macho' : 'Hembra' }}
                </span>
                <span class="fecha-label-txt">{{ formatFecha(p.fecha_captura) }}</span>
              </div>

              <div v-if="p.peso_estimado == null && !p.error_estim" class="sin-estimar-status-box">
                <ion-spinner name="dots" color="success" class="mini-dots" />
                <span>{{ online ? 'Procesando imagen en servidor...' : 'En espera de conexión a internet' }}</span>
              </div>

              <template v-else>
                <div v-if="p.error_estim" class="error-estim-box-alert">
                  <div class="error-header-title-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef5350" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <strong>No se pudo estimar automáticamente.</strong>
                  </div>
                  <div class="error-body-message">
                    <p>{{ traducirError(p.error_estim) }}</p>
                    <p class="error-hint">Digita el peso manualmente a continuación o reintenta el proceso.</p>
                  </div>
                </div>

                <div v-else class="estimado-badge-result-row">
                  <span class="estimado-label">Peso Estimado por IA</span>
                  <span class="estimado-val">{{ p.peso_estimado }} kg</span>
                </div>

                <div class="form-block-group-field">
                  <label class="field-label-custom">Confirmar Peso a Guardar (kg):</label>
                  <div class="custom-input-box-wrapper">
                    <input v-model="p.pesoEdit" type="number" inputmode="decimal" min="1" placeholder="0.0" />
                    <span class="input-side-unit">KG</span>
                  </div>
                </div>

                <p class="campo-label-bovino">Asignar a un Animal del Catálogo:</p>
                
                <div v-if="p.animalSelInfo" class="animal-elegido-card" @click="abrirSelector(p)">
                  <div class="animal-mini-avatar-frame">
                    <img v-if="p.animalSelInfo.foto_animal" :src="fotoUrl(p.animalSelInfo.foto_animal)" alt="foto" />
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <div class="animal-datos-wrapper-text">
                    <h4>{{ p.animalSelInfo.nombre_animal || 'Sin nombre catalogado' }}</h4>
                    <p>Arete: <strong>{{ p.animalSelInfo.n_arete }}</strong> · Peso actual: {{ p.animalSelInfo.peso ?? '-' }} kg</p>
                  </div>
                  <button type="button" class="btn-change-animal-flat">Cambiar</button>
                </div>

                <button v-else type="button" class="btn-choose-animal-trigger" @click="abrirSelector(p)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  Vincular Arete / Animal
                </button>

                <div class="acciones-panel-group">
                  <button 
                    v-if="p.error_estim && online" 
                    type="button" 
                    class="btn-action-outline-retry"
                    :disabled="procesando === p.id" 
                    @click="reintentar(p)"
                  >
                    Reintentar
                  </button>
                  
                  <button 
                    type="button" 
                    class="btn-action-solid-submit"
                    :disabled="!p.animalSel || !(Number(p.pesoEdit) > 0) || procesando === p.id"
                    @click="aceptar(p)"
                  >
                    {{ procesando === p.id ? 'Guardando...' : 'Aceptar y Guardar' }}
                  </button>
                  
                  <button 
                    type="button" 
                    class="btn-action-clear-delete" 
                    :disabled="procesando === p.id" 
                    @click="descartar(p)"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </template>
            </div>
          </div>
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
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonSpinner, alertController, onIonViewWillEnter } from '@ionic/vue'
import { colaPesajes } from '../services/colaPesajes'
import { comprimirImagen, fotoUrl } from '../services/media'
import { estimarPendientes } from '../services/sincronizar'
import { useOnline } from '../composables/useOnline'
import SelectorAnimalModal from './SelectorAnimalModal.vue'

const props = defineProps({
    service: { type: Object, required: true },
    backHref: { type: String, required: true },
})

const router = useRouter()
const online = useOnline()
const loading = ref(true)
const estimando = ref(false)
const procesando = ref(null)
const pendientes = ref([])

const selectorAbierto = ref(false)
const itemEnSeleccion = ref(null)

function formatFecha(iso) {
    return new Date(iso).toLocaleString('es-CR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// INTERCEPTOR Y TRADUCTOR DE ERRORES DE LA IA AL ESPAÑOL
function traducirError(errRaw) {
    if (!errRaw) return '';
    const err = String(errRaw).toLowerCase();
    
    if (err.includes('failed to connect') || err.includes('curl error 7') || err.includes('could not connect')) {
        return 'No se pudo conectar con el servidor local de inteligencia artificial. Verifique que el servicio de estimación esté corriendo en el puerto 8001.';
    }
    if (err.includes('timeout') || err.includes('exceeded')) {
        return 'La operación tardó demasiado tiempo en responder. Pruebe reintentando la subida.';
    }
    if (err.includes('422') || err.includes('invalid image') || err.includes('format')) {
        return 'El formato o la calidad de la fotografía no es válida para procesar la silueta del bovino.';
    }
    return errRaw; // Si es un mensaje personalizado o ya en español, lo deja pasar limpio
}

let cargando = false
async function cargar() {
    if (cargando) return
    cargando = true
    loading.value = true
    try {
        await refrescarLista()
        loading.value = false

        const faltan = pendientes.value.some(p => p.peso_estimado == null && !p.error_estim)
        if (online.value && faltan) {
            estimando.value = true
            try {
                await estimarPendientes(props.service)
                await refrescarLista()
            } catch {
                // Silenciar errores generales de cola para no romper la navegación
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
        animalSel: null,      
        animalSelInfo: null,  
    }))
}

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
        const conFoto = !p.error_estim
        try {
            await props.service.crearPesaje(p.animalSel, await construirFormData(p, conFoto))
        } catch (e) {
            const fotoInvalida = e.response?.status === 422 && e.response?.data?.errors?.foto
            if (!conFoto || !fotoInvalida) throw e
            await props.service.crearPesaje(p.animalSel, await construirFormData(p, false))
        }
        await colaPesajes.eliminar(p.id)
        await refrescarLista()
    } catch (e) {
        const alertBox = await alertController.create({
            header: 'Error al Guardar',
            message: e.response?.data?.message || 'No se pudo registrar el pesaje en el servidor general.',
            buttons: ['Entendido']
        })
        await alertBox.present()
    } finally {
        procesando.value = null
    }
}

async function construirFormData(p, incluirFoto) {
    const fd = new FormData()
    fd.append('peso_aproximado', Number(p.pesoEdit))
    fd.append('sexo', p.sexo)
    if (incluirFoto) {
        const fotoBlob = await comprimirImagen(p.foto)
        fd.append('foto', fotoBlob, p.foto.name || 'captura.jpg')
    }
    return fd
}

async function reintentar(p) {
    await colaPesajes.actualizar(p.id, { error_estim: null })
    await refrescarLista()
    estimando.value = true
    try {
        await estimarPendientes(props.service)
        await refrescarLista()
    } catch {
    } finally {
        estimando.value = false
    }
}

async function descartar(p) {
    const alert = await alertController.create({
        header: 'Descartar captura',
        message: '¿Está seguro de eliminar esta captura del dispositivo sin guardarla en el sistema?',
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

onMounted(cargar)
onIonViewWillEnter(cargar)
</script>

<style scoped>
ion-content { --background: #0f2318; }

.page-container {
  min-height: 100%;
  background: #0f2318;
  padding-bottom: 3rem;
}

/* CABECERA FIJA PROPIA */
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
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 9px;
  color: #ffffff;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

.header-title-wrap { flex: 1; text-align: left; }
.header-title { color: #ffffff; font-weight: 800; font-size: 1.1rem; font-family: Georgia, serif; }
.header-sub { color: rgba(255,255,255,0.6); font-size: 0.76rem; margin-top: 1px; font-weight: 500; }

.content-body { padding: 1.2rem; display: flex; flex-direction: column; gap: 1.2rem; }

/* BANNERS ADAPTADOS */
.banner-offline, .banner-info {
  display: flex; gap: 0.6rem; align-items: center;
  border-radius: 12px; padding: 0.85rem 1.1rem; font-size: 0.84rem; font-weight: 600; text-align: left;
}
.banner-offline { background: rgba(230,180,34,0.08); border: 1px solid rgba(230,180,34,0.25); color: #e6b422; }
.banner-info { background: rgba(29,158,117,0.06); border: 1px solid rgba(29,158,117,0.15); color: #24c290; }

/* TARJETAS PREMIUM DE PESAJE */
.flat-cards-list { display: flex; flex-direction: column; gap: 1.2rem; }

.item-pesaje-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
}

.foto-container-frame {
  width: 100%; max-height: 220px; border-radius: 12px;
  background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255,255,255,0.06);
  overflow: hidden; display: flex; align-items: center; justify-content: center;
}
.foto-render { width: 100%; max-height: 220px; object-fit: contain; }

.meta-bovino-strip { display: flex; justify-content: space-between; align-items: center; margin: 0.8rem 0; }
.badge-sexo { font-size: 0.72rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 20px; text-transform: uppercase; }
.sexo-macho { background: rgba(33,150,243,0.15); color: #2196f3; }
.sexo-hembra { background: rgba(233,30,99,0.15); color: #e91e63; }
.fecha-label-txt { color: rgba(255,255,255,0.45); font-size: 0.8rem; font-weight: 500; }

.sin-estimar-status-box {
  display: flex; align-items: center; gap: 0.5rem;
  color: #e6b422; font-size: 0.84rem; font-weight: 600;
  background: rgba(230,180,34,0.05); padding: 0.75rem 1rem; border-radius: 10px;
}

/* SECCIÓN TRADUCIDA DE ERROR DE LA IA */
.error-estim-box-alert {
  background: rgba(239,83,80,0.06); border: 1px solid rgba(239,83,80,0.2);
  border-radius: 12px; padding: 0.9rem; margin-bottom: 0.8rem; text-align: left;
}
.error-header-title-wrap { display: flex; align-items: center; gap: 0.5rem; color: #ef5350; font-size: 0.9rem; }
.error-body-message { margin-top: 0.4rem; padding-left: 1.6rem; }
.error-body-message p { margin: 0; font-size: 0.82rem; color: rgba(255,255,255,0.8); line-height: 1.4; }
.error-body-message .error-hint { color: #e6b422; margin-top: 0.3rem; font-weight: 600; }

/* INDICADOR DE ESTIMACIÓN DE IA EXITOSA */
.estimado-badge-result-row {
  display: flex; justify-content: space-between; align-items: center;
  background: #1D9E75; color: #ffffff; border-radius: 12px; padding: 0.75rem 1.1rem;
  margin-bottom: 0.8rem; box-shadow: 0 4px 12px rgba(29, 158, 117, 0.15);
}
.estimado-label { font-size: 0.88rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; }
.estimado-val { font-size: 1.4rem; font-weight: 800; }

/* CONFIGURACIÓN DE INPUTS */
.form-block-group-field { display: flex; flex-direction: column; gap: 0.4rem; text-align: left; margin-bottom: 0.8rem; }
.field-label-custom { color: rgba(255,255,255,0.85); font-size: 0.88rem; font-weight: 700; }

.custom-input-box-wrapper {
  display: flex; align-items: center; background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 12px; overflow: hidden;
}
.custom-input-box-wrapper input {
  flex: 1; background: none; border: none; padding: 0.85rem 1.1rem;
  color: #ffffff; font-size: 1.05rem; font-weight: 600; outline: none;
}

.campo-label-bovino { color: rgba(255,255,255,0.85); font-size: 0.88rem; font-weight: 700; text-align: left; margin: 0.6rem 0 0.4rem; }

/* TRIGGER SELECCIÓN ANIMAL */
.btn-choose-animal-trigger {
  width: 100%; height: 46px; background: transparent; color: #24c290;
  border: 1px solid rgba(36, 194, 144, 0.4); border-radius: 12px;
  font-size: 0.9rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer;
}
.btn-choose-animal-trigger:active { background: rgba(36, 194, 144, 0.08); }

.animal-elegido-card {
  display: flex; align-items: center; gap: 0.8rem;
  background: rgba(29, 158, 117, 0.05); border: 1px solid rgba(29, 158, 117, 0.25);
  border-radius: 12px; padding: 0.65rem 0.9rem; cursor: pointer;
}
.animal-mini-avatar-frame {
  width: 40px; height: 40px; border-radius: 8px; background: rgba(255,255,255,0.04);
  overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.animal-mini-avatar-frame img { width: 100%; height: 100%; object-fit: cover; }
.animal-datos-wrapper-text { flex: 1; min-width: 0; text-align: left; }
.animal-datos-wrapper-text h4 { margin: 0; color: #ffffff; font-size: 0.95rem; font-weight: 700; }
.animal-datos-wrapper-text p { margin: 0.15rem 0 0; color: rgba(255,255,255,0.6); font-size: 0.78rem; }
.animal-datos-wrapper-text strong { color: #24c290; }

.btn-change-animal-flat {
  background: rgba(255,255,255,0.08); border: none; border-radius: 6px;
  color: white; padding: 0.35rem 0.6rem; font-size: 0.75rem; font-weight: 700; cursor: pointer;
}

/* PANEL DE BOTONERAS ERGONÓMICAS */
.acciones-panel-group { display: flex; gap: 0.5rem; align-items: center; margin-top: 1.1rem; }

.btn-action-outline-retry {
  height: 48px; padding: 0 1rem; background: transparent; color: white;
  border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; font-size: 0.9rem; font-weight: 700; cursor: pointer;
}
.btn-action-outline-retry:active { background: rgba(255,255,255,0.05); }

.btn-action-solid-submit {
  flex: 1; height: 48px; background: #1D9E75; color: white; border: none;
  border-radius: 12px; font-size: 0.95rem; font-weight: 700; cursor: pointer;
  box-shadow: 0 4px 12px rgba(29, 158, 117, 0.2);
}
.btn-action-solid-submit:active:not(:disabled) { background: #167a5a; }
.btn-action-solid-submit:disabled {
  background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.25); box-shadow: none; cursor: not-allowed;
}

.btn-action-clear-delete {
  height: 48px; width: 48px; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.btn-action-clear-delete:active { background: rgba(239,83,80,0.1); color: #ef5350; border-color: rgba(239,83,80,0.2); }

.vacio-box { text-align: center; color: rgba(255,255,255,0.3); padding: 5rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.vacio-box p { color: rgba(255,255,255,0.4); font-size: 0.95rem; font-weight: 600; margin: 0; }
.loading-wrap-center { display: flex; justify-content: center; padding: 4rem; }
</style>