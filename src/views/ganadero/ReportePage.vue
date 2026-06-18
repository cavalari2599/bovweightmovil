<template>
  <ion-page>
    <ion-content :scroll-y="true">
      <div class="page-container">

        <div class="page-header">
          <button class="back-btn" @click="irAtras">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="header-title-wrap">
            <div class="header-title">Reporte para Comprador</div>
            <div class="header-sub">Selección de lote disponible para exportación</div>
          </div>
        </div>

        <div v-if="loading" class="loading-wrap-center">
          <ion-spinner color="success" />
        </div>

        <div v-else class="content-body">
          
          <div class="custom-search-field-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="busqueda" type="text" placeholder="Buscar ganado por nombre..." />
          </div>

          <div class="reporte-acciones">
            <button type="button" class="btn-select-all-toggle" @click="seleccionarTodos">
              {{ todosSeleccionados ? 'Deseleccionar Todo' : 'Seleccionar Todo el Grupo' }}
            </button>
            <span class="contador">{{ seleccionados.length }} marcados</span>
          </div>

          <div class="flat-cards-list">
            <div 
              v-for="a in filtrados" 
              :key="a.n_arete" 
              class="flat-select-card item-checkbox-card"
              :class="{ 'card-is-checked': seleccionados.includes(a.n_arete) }"
              @click="toggleSeleccion(a.n_arete)"
            >
              <div class="custom-checkbox-wrapper">
                <div class="checkbox-box-box" :class="{ 'box-checked': seleccionados.includes(a.n_arete) }">
                  <svg v-if="seleccionados.includes(a.n_arete)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>

              <div class="flat-card-icon shadow-animal-icon unique-thumbnail-frame">
                <img v-if="a.foto_animal" :src="fotoUrl(a.foto_animal)" alt="foto animal" class="thumbnail-render" />
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>

              <div class="flat-card-details">
                <div class="flat-card-title-name">{{ a.nombre_animal || 'Sin nombre asignado' }}</div>
                <div class="flat-card-sub-desc">Arete: <strong>{{ a.n_arete }}</strong> · Peso: <span class="highlight-weight">{{ a.peso }} kg</span></div>
              </div>
            </div>

            <div v-if="filtrados.length === 0" class="empty-state-container-box">
              No se encontraron animales activos disponibles para reportes.
            </div>
          </div>

        </div>
      </div>
    </ion-content>

    <ion-footer class="custom-flat-footer">
      <div class="footer-button-wrapper">
        <button
          type="button"
          class="btn-share-action"
          :disabled="seleccionados.length === 0 || generandoPDF || compartiendo"
          @click="compartirReporte"
        >
          <ion-spinner v-if="compartiendo" name="crescent" color="light" />
          <template v-else>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            <span>Compartir ({{ seleccionados.length }})</span>
          </template>
        </button>
        <button
          type="button"
          class="btn-primary-action"
          :disabled="seleccionados.length === 0 || generandoPDF || compartiendo"
          @click="generarReporte"
        >
          <ion-spinner v-if="generandoPDF" name="crescent" color="light" />
          <span v-else>Descargar PDF ({{ seleccionados.length }})</span>
        </button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonPage, IonContent, IonFooter, IonSpinner } from '@ionic/vue'
import { jsPDF } from 'jspdf'
import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { ganaderoService } from '../../services/ganadero'
import { fotoUrl } from '../../services/media'
import { paths } from '../../router/paths'

const route = useRoute()
const router = useRouter()
const idFinca = route.params.idFinca

const animales = ref([])
const loading = ref(true)
const busqueda = ref('')
const seleccionados = ref([])
const generandoPDF = ref(false)
const compartiendo = ref(false)

const disponibles = computed(() => animales.value.filter(a => a.estado === 'Activo'))

const filtrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  if (!q) return disponibles.value
  return disponibles.value.filter(a => (a.nombre_animal || '').toLowerCase().includes(q))
})

const todosSeleccionados = computed(() =>
  filtrados.value.length > 0 && filtrados.value.every(a => seleccionados.value.includes(a.n_arete))
)

// Forzamos el regreso controlado con Vue Router apuntando al catálogo de fincas con el query param requerido
function irAtras() {
  router.push(`${paths.ganadero.fincas}?modo=reporte`)
}

async function cargar() {
  loading.value = true
  try {
    const res = await ganaderoService.getAnimales(idFinca, 'nombre')
    animales.value = res.data
  } finally {
    loading.value = false
  }
}

function toggleSeleccion(nArete) {
  const i = seleccionados.value.indexOf(nArete)
  if (i === -1) seleccionados.value.push(nArete)
  else seleccionados.value.splice(i, 1)
}

function seleccionarTodos() {
  if (todosSeleccionados.value) {
    const visibles = filtrados.value.map(a => a.n_arete)
    seleccionados.value = seleccionados.value.filter(n => !visibles.includes(n))
  } else {
    const set = new Set(seleccionados.value)
    filtrados.value.forEach(a => set.add(a.n_arete))
    seleccionados.value = [...set]
  }
}

async function imgToDataUrl(nArete) {
  try {
    const res = await ganaderoService.getFoto(nArete)
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(res.data)
    })
  } catch {
    return null
  }
}

// Construye el PDF del lote seleccionado y devuelve el documento jsPDF.
async function construirPDF() {
  const seleccion = animales.value.filter(a => seleccionados.value.includes(a.n_arete))
  const doc = new jsPDF()
  const pageH = doc.internal.pageSize.getHeight()

  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor('#0f2318')
  doc.text('BOVWEIGHT CR - REPORTE DE GANADO', 14, 20)

  doc.setDrawColor('#1D9E75')
  doc.setLineWidth(1)
  doc.line(14, 23, 196, 23)

  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor('#555555')
  doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-CR')}`, 14, 30)
  doc.text(`Volumen del Lote Seleccionado: ${seleccion.length} cabeza(s) de ganado`, 14, 35)

  let y = 45
  for (const a of seleccion) {
    if (y > pageH - 42) { doc.addPage(); y = 20 }

    doc.setDrawColor('#e5e5e5')
    doc.setFillColor('#f9f9f9')
    doc.rect(14, y, 36, 30, 'F')

    if (a.foto_animal) {
      const dataUrl = await imgToDataUrl(a.n_arete)
      if (dataUrl) {
        let fmt = dataUrl.substring(dataUrl.indexOf('/') + 1, dataUrl.indexOf(';')).toUpperCase()
        if (fmt === 'JPG') fmt = 'JPEG'
        try { doc.addImage(dataUrl, fmt, 15, y + 1, 34, 28) } catch { /* silenciar fallos */ }
      }
    }

    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor('#0f2318')
    doc.text(`${a.nombre_animal || 'Sin nombre catalogado'}`, 55, y + 6)

    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor('#333333')
    doc.text(`Código Arete Único: ${a.n_arete}`, 55, y + 13)
    doc.text(`Raza / Cruce: ${a.raza || 'No especificada'}`, 55, y + 19)

    doc.setFont('Helvetica', 'bold')
    doc.setTextColor('#1D9E75')
    doc.text(`Peso de Registro: ${a.peso != null ? a.peso + ' kg' : 'Pendiente de pesaje'}`, 55, y + 26)

    doc.setDrawColor('#eaeaea')
    doc.setLineWidth(0.5)
    doc.line(14, y + 34, 196, y + 34)
    y += 40
  }

  // Aviso legal: la estimación es de apoyo, no sustituye báscula oficial.
  doc.setFont('Helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor('#999999')
  doc.text('Pesos estimados como apoyo en campo. No sustituyen una báscula oficial para transacciones formales.', 14, pageH - 10)

  return doc
}

async function generarReporte() {
  generandoPDF.value = true
  try {
    const doc = await construirPDF()
    doc.save(`reporte-bovweight-${Date.now()}.pdf`)
    try {
      await ganaderoService.registrarReporte(idFinca, seleccionados.value.length)
    } catch {}
  } finally {
    generandoPDF.value = false
  }
}

// Comparte el PDF por WhatsApp / correo / etc. (Don Diego, el comprador).
async function compartirReporte() {
  compartiendo.value = true
  try {
    const doc = await construirPDF()
    const nombre = `reporte-bovweight-${Date.now()}.pdf`
    const titulo = 'Reporte de ganado — BovWeight CR'
    const texto = 'Listado de ganado con peso estimado (de apoyo, no sustituye báscula oficial).'

    if (Capacitor.isNativePlatform()) {
      // Escribe el PDF en caché y comparte el archivo por la hoja nativa.
      const base64 = doc.output('datauristring').split(',')[1]
      const { uri } = await Filesystem.writeFile({
        path: nombre,
        data: base64,
        directory: Directory.Cache,
      })
      await Share.share({ title: titulo, text: texto, files: [uri] })
    } else {
      // Web: usa Web Share con archivo si está disponible; si no, descarga.
      const blob = doc.output('blob')
      const file = new File([blob], nombre, { type: 'application/pdf' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: titulo, text: texto, files: [file] })
      } else {
        doc.save(nombre)
      }
    }

    try {
      await ganaderoService.registrarReporte(idFinca, seleccionados.value.length)
    } catch {}
  } catch (e) {
    // Si el usuario cancela la hoja de compartir, no es un error real.
  } finally {
    compartiendo.value = false
  }
}

onMounted(cargar)
</script>

<style scoped>
ion-content { --background: #0f2318; }

.page-container {
  min-height: 100%;
  background: #0f2318;
  padding-bottom: 5.5rem;
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
.header-title { color: #ffffff; font-weight: 800; font-size: 1.1rem; font-family: Georgia, serif; text-align: left; }
.header-sub { color: rgba(255, 255, 255, 0.65); font-size: 0.76rem; margin-top: 1px; font-weight: 500; text-align: left; }

.content-body { padding: 1.2rem; display: flex; flex-direction: column; gap: 1rem; }

.custom-search-field-bar {
  display: flex; align-items: center; gap: 0.6rem;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px;
  padding: 0.85rem 1.1rem; color: rgba(255,255,255,0.4);
}
.custom-search-field-bar input { flex: 1; background: none; border: none; color: #ffffff; font-size: 1rem; outline: none; font-weight: 600; }
.custom-search-field-bar input::placeholder { color: rgba(255,255,255,0.4); }

.reporte-acciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.2rem 0.2rem 0.4rem;
}

.btn-select-all-toggle {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  color: #ffffff;
  padding: 0.5rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-select-all-toggle:active { background: rgba(255,255,255,0.12); }

.contador {
  font-size: 0.82rem;
  color: #24c290;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.flat-cards-list { display: flex; flex-direction: column; gap: 0.6rem; }

.item-checkbox-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease;
}
.item-checkbox-card:active { transform: scale(0.99); }
.card-is-checked {
  background: rgba(29, 158, 117, 0.05);
  border-color: rgba(29, 158, 117, 0.35);
}

.custom-checkbox-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 0.2rem;
}
.checkbox-box-box {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid rgba(255,255,255,0.3);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s ease;
}
.checkbox-box-box.box-checked {
  border-color: #1D9E75;
  background: #1D9E75;
}

.unique-thumbnail-frame {
  width: 44px; height: 44px; border-radius: 10px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
  overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.thumbnail-render { width: 100%; height: 100%; object-fit: cover; }

.flat-card-details { flex: 1; min-width: 0; text-align: left; }
.flat-card-title-name { color: #ffffff; font-weight: 700; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.flat-card-sub-desc { color: rgba(255,255,255,0.7); font-size: 0.78rem; margin-top: 0.15rem; font-weight: 500; }
.flat-card-sub-desc strong { color: #ffffff; }
.highlight-weight { color: #24c290; font-weight: 700; }

.empty-state-container-box { color: rgba(255,255,255,0.4); font-size: 0.85rem; text-align: center; padding: 3rem 1rem; font-weight: 600; }
.loading-wrap-center { display: flex; justify-content: center; padding: 3rem; }

.custom-flat-footer {
  background: #0f2318;
  border-top: 1px solid rgba(255,255,255,0.08);
  box-shadow: none;
}
.footer-button-wrapper { padding: 0.8rem 1.2rem 1.2rem; background: #0f2318; display: flex; gap: 0.6rem; }

.btn-primary-action {
  flex: 1; height: 50px; background: #1D9E75; color: white;
  border: none; border-radius: 12px; font-size: 0.95rem; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(29, 158, 117, 0.2);
}
.btn-primary-action:active:not(:disabled) { background: #167a5a; }
.btn-primary-action:disabled {
  background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.25);
  box-shadow: none; cursor: not-allowed;
}

.btn-share-action {
  flex: 1; height: 50px; background: transparent; color: #24c290;
  border: 1px solid rgba(36, 194, 144, 0.5); border-radius: 12px;
  font-size: 0.95rem; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
}
.btn-share-action:active:not(:disabled) { background: rgba(36, 194, 144, 0.08); }
.btn-share-action:disabled {
  border-color: rgba(255,255,255,0.08); color: rgba(255,255,255,0.25); cursor: not-allowed;
}
</style>