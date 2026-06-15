<template>
  <ion-modal :is-open="isOpen" @did-dismiss="emit('dismiss')" class="bovweight-form-modal">
    <div class="modal-full-wrapper">
      
      <div class="modal-custom-header">
        <div class="modal-header-title">{{ esEdicion ? 'Editar Registro de Bovino' : 'Registrar Nuevo Bovino' }}</div>
        <button type="button" class="modal-close-button-flat" @click="emit('dismiss')">
          <span>Cancelar</span>
        </button>
      </div>

      <div class="modal-custom-body">
        
        <div class="form-block-group">
          <label class="field-label-custom">Número de Arete Único:</label>
          <div class="custom-input-box-wrapper" :class="{ 'input-disabled-state': esEdicion }">
            <input v-model="form.n_arete" type="text" :disabled="esEdicion" placeholder="Ej: ARETE-000" />
          </div>
        </div>

        <div class="form-block-group">
          <label class="field-label-custom">Nombre del Animal:</label>
          <div class="custom-input-box-wrapper">
            <input v-model="form.nombre_animal" type="text" placeholder="Ej: Canela, Tormenta..." />
          </div>
        </div>

        <div class="form-block-group">
          <label class="field-label-custom">Raza / Encaste:</label>
          <div class="custom-input-box-wrapper">
            <select v-model="form.raza" class="custom-flat-select">
              <option value="" disabled selected>Seleccione la raza</option>
              <option v-for="r in razas" :key="r" :value="r">{{ r }}</option>
            </select>
            <div class="select-arrow-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </div>

        <div class="form-block-group">
          <label class="field-label-custom">Sexo del Bovino:</label>
          <div class="custom-input-box-wrapper">
            <select v-model="form.sexo" class="custom-flat-select">
              <option value="" disabled selected>Seleccione el sexo</option>
              <option value="F">Hembra</option>
              <option value="M">Macho</option>
            </select>
            <div class="select-arrow-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </div>

        <div class="form-block-group">
          <label class="field-label-custom">Edad Estimada (Años):</label>
          <div class="custom-input-box-wrapper" :class="{ 'input-disabled-state': !!form.fecha_nacimiento }">
            <input v-model="form.edad" type="number" :disabled="!!form.fecha_nacimiento" placeholder="0" />
          </div>
          <p v-if="form.fecha_nacimiento" class="hint-text-success">Edad calculada automáticamente desde el nacimiento.</p>
        </div>

        <div class="form-block-group">
          <label class="field-label-custom">Peso Base de Registro (kg):</label>
          <div class="custom-input-box-wrapper">
            <input v-model="form.peso" type="number" placeholder="0.0" />
            <span class="input-side-unit">KG</span>
          </div>
        </div>

        <div class="form-block-group">
          <label class="field-label-custom">Estado Fisiológico / Estatus:</label>
          <div class="custom-input-box-wrapper">
            <select v-model="form.estado" class="custom-flat-select">
              <option value="Activo">Activo</option>
              <option value="Vendido">Vendido</option>
              <option value="Muerto">Muerto</option>
            </select>
            <div class="select-arrow-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </div>

        <div class="form-block-group date-picker-custom-box">
          <label class="field-label-custom text-muted-label">Fecha de Nacimiento:</label>
          <ion-datetime
            presentation="date"
            v-model="form.fecha_nacimiento"
            :prefer-wheel="false"
            max="2030-12-31"
            class="custom-embedded-datetime"
          />
        </div>

        <div class="form-block-group file-uploader-custom-box">
          <label class="field-label-custom text-muted-label">
            Fotografía del Animal {{ esEdicion ? '(Dejar vacío para mantener la actual)' : '' }}:
          </label>
          <div class="file-input-styled-card">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            <input type="file" accept="image/*" @change="onFotoChange" class="hidden-file-input" />
            <span class="file-label-text">{{ fotoFile ? fotoFile.name : 'Seleccionar fotografía desde la cámara' }}</span>
          </div>
        </div>

        <p v-if="error" class="error-msg-alert">{{ error }}</p>

        <div class="form-submit-wrapper">
          <button 
            type="button" 
            class="btn-submit-action-form" 
            :disabled="guardando" 
            @click="guardar"
          >
            {{ guardando ? 'Guardando Registro...' : 'Guardar Bovino' }}
          </button>
        </div>

      </div>
    </div>
  </ion-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { IonModal, IonDatetime } from '@ionic/vue'
import { ganaderoService } from '../../services/ganadero'

const props = defineProps({
    isOpen: { type: Boolean, default: false },
    animal: { type: Object, default: null },
    idFinca: { type: [String, Number], required: true },
    razas: { type: Array, default: () => [] },
})

const emit = defineEmits(['dismiss', 'saved'])

const esEdicion = computed(() => !!props.animal)
const guardando = ref(false)
const error = ref('')
const fotoFile = ref(null)

const form = ref({
    n_arete: '',
    nombre_animal: '',
    raza: '',
    sexo: '',
    edad: '',
    peso: '',
    estado: 'Activo',
    fecha_nacimiento: '',
})

function calcularEdad(fecha) {
    if (!fecha) return ''
    const nac = new Date(fecha)
    if (isNaN(nac)) return ''
    const hoy = new Date()
    let edad = hoy.getFullYear() - nac.getFullYear()
    const m = hoy.getMonth() - nac.getMonth()
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
    return edad < 0 ? 0 : edad
}

watch(() => form.value.fecha_nacimiento, (fecha) => {
    if (fecha) form.value.edad = calcularEdad(fecha)
})

watch(() => props.isOpen, (open) => {
    if (!open) return
    error.value = ''
    fotoFile.value = null
    if (props.animal) {
        form.value = {
            n_arete: props.animal.n_arete,
            nombre_animal: props.animal.nombre_animal || '',
            raza: props.animal.raza || '',
            sexo: props.animal.sexo || '',
            edad: props.animal.edad ?? '',
            peso: props.animal.peso ?? '',
            estado: props.animal.estado,
            fecha_nacimiento: props.animal.fecha_nacimiento || '',
        }
    } else {
        form.value = { n_arete: '', nombre_animal: '', raza: '', sexo: '', edad: '', peso: '', estado: 'Activo', fecha_nacimiento: '' }
    }
})

function onFotoChange(e) {
    fotoFile.value = e.target.files?.[0] || null
}

async function guardar() {
    error.value = ''
    guardando.value = true
    try {
        const fecha = form.value.fecha_nacimiento?.split('T')[0] || null
        const edad = fecha ? calcularEdad(fecha) : form.value.edad
        
        if (esEdicion.value) {
            if (fotoFile.value) {
                const fd = new FormData()
                if (form.value.nombre_animal) fd.append('nombre_animal', form.value.nombre_animal)
                if (form.value.raza) fd.append('raza', form.value.raza)
                if (form.value.sexo) fd.append('sexo', form.value.sexo)
                if (edad !== '' && edad != null) fd.append('edad', edad)
                if (form.value.peso !== '' && form.value.peso != null) fd.append('peso', form.value.peso)
                fd.append('estado', form.value.estado)
                if (fecha) fd.append('fecha_nacimiento', fecha)
                fd.append('foto_animal', fotoFile.value)
                await ganaderoService.editarAnimal(props.animal.n_arete, fd)
            } else {
                await ganaderoService.editarAnimal(props.animal.n_arete, {
                    ...form.value,
                    edad: edad === '' ? null : edad,
                    fecha_nacimiento: fecha,
                })
            }
        } else {
            const fd = new FormData()
            fd.append('n_arete', form.value.n_arete)
            if (form.value.nombre_animal) fd.append('nombre_animal', form.value.nombre_animal)
            if (form.value.raza) fd.append('raza', form.value.raza)
            if (form.value.sexo) fd.append('sexo', form.value.sexo)
            if (edad !== '' && edad != null) fd.append('edad', edad)
            if (form.value.peso !== '' && form.value.peso != null) fd.append('peso', form.value.peso)
            fd.append('estado', form.value.estado)
            if (fecha) fd.append('fecha_nacimiento', fecha)
            if (fotoFile.value) fd.append('foto_animal', fotoFile.value)
            await ganaderoService.crearAnimal(props.idFinca, fd)
        }
        emit('saved')
    } catch (e) {
        const mensajeServidor = e.response?.data?.message;
        
        if (mensajeServidor) {
            // Interceptamos la validación en inglés del servidor y la traducimos
            if (mensajeServidor.toLowerCase().includes('n arete field is required')) {
                error.value = 'El número de arete es obligatorio.'
            } else if (mensajeServidor.toLowerCase().includes('nombre animal field is required')) {
                error.value = 'El nombre del animal es obligatorio.'
            } else if (mensajeServidor.toLowerCase().includes('raza field is required')) {
                error.value = 'Debe seleccionar una raza para el bovino.'
            } else if (mensajeServidor.toLowerCase().includes('sexo field is required')) {
                error.value = 'Debe seleccionar el sexo del animal.'
            } else if (mensajeServidor.toLowerCase().includes('already exists') || mensajeServidor.toLowerCase().includes('duplicate')) {
                error.value = 'El número de arete ya se encuentra registrado en el sistema.'
            } else if (mensajeServidor.toLowerCase().includes('unauthorized') || mensajeServidor.toLowerCase().includes('unauthenticated')) {
                error.value = 'Sesión expirada. Por favor, vuelva a iniciar sesión.'
            } else if (mensajeServidor.toLowerCase().includes('validation')) {
                error.value = 'Por favor, revise que los datos ingresados cumplan con el formato correcto.'
            } else {
                error.value = mensajeServidor; // Si el backend ya responde en español, usa ese directamente
            }
        } else if (e.message && e.message.includes('Network Error')) {
            error.value = 'Error de conexión. Verifique su señal de internet en el campo.'
        } else {
            error.value = 'Ocurrió un problema inesperado al intentar guardar el bovino.'
        }
    }
}
</script>

<style scoped>
.modal-full-wrapper {
  background: #0f2318;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-custom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.2rem;
  border-bottom: 2px solid #1D9E75;
  background: #0f2318;
}

.modal-header-title {
  color: #ffffff;
  font-family: Georgia, serif;
  font-weight: 700;
  font-size: 1.1rem;
}

.modal-close-button-flat {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  color: white;
  padding: 0.45rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.modal-custom-body {
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  flex: 1;
  overflow-y: auto;
}

.form-block-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  text-align: left;
}

.field-label-custom {
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.custom-input-box-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.custom-input-box-wrapper input {
  flex: 1;
  background: none;
  border: none;
  padding: 0.85rem 1.1rem;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  outline: none;
}
.custom-input-box-wrapper input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.input-side-unit {
  padding-right: 1.1rem;
  color: #24c290;
  font-weight: 800;
  font-size: 0.88rem;
}

.input-disabled-state {
  background: rgba(255, 255, 255, 0.02) !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
  opacity: 0.6;
}

.custom-flat-select {
  width: 100%;
  background: none;
  border: none;
  padding: 0.85rem 2.5rem 0.85rem 1.1rem;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  appearance: none;
}
.custom-flat-select option {
  background: #0f2318;
  color: white;
}

.select-arrow-icon {
  position: absolute;
  right: 1.1rem;
  color: #1D9E75;
  pointer-events: none;
}

/* GRUPOS COMPLEMENTARIOS */
.hint-text-success {
  color: #24c290;
  font-size: 0.78rem;
  font-weight: 600;
  margin: 0.1rem 0 0 0.2rem;
}

.text-muted-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
}

.date-picker-custom-box,
.file-uploader-custom-box {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 0.9rem;
}

.file-input-styled-card {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(29, 158, 117, 0.4);
  border-radius: 10px;
  padding: 0.8rem 1rem;
  position: relative;
  cursor: pointer;
}

.hidden-file-input {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  opacity: 0;
  cursor: pointer;
}

.file-label-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  text-align: left;
}

.error-msg-alert {
  color: #ef5350;
  font-size: 0.85rem;
  text-align: center;
  font-weight: 700;
  margin: 0.5rem 0;
}

.form-submit-wrapper {
  margin-top: 0.6rem;
}

.btn-submit-action-form {
  width: 100%;
  height: 50px;
  background: #1D9E75;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(29, 158, 117, 0.2);
  transition: background 0.15s;
}

.btn-submit-action-form:active {
  background: #167a5a;
}

.btn-submit-action-form:disabled {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.25);
  box-shadow: none;
  cursor: not-allowed;
}

.custom-embedded-datetime {
  --background: #0f2318;
  border-radius: 8px;
  margin-top: 0.4rem;
}
</style>

<style>
.bovweight-form-modal {
  --background: #0f2318 !important;
}
</style>