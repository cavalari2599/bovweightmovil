<template>
    <ion-modal :is-open="isOpen" @did-dismiss="$emit('dismiss')">
        <ion-header>
            <ion-toolbar color="success">
                <ion-title>{{ esEdicion ? 'Editar Animal' : 'Nuevo Animal' }}</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="$emit('dismiss')">Cancelar</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <ion-item>
                <ion-label position="floating">N° Arete</ion-label>
                <ion-input v-model="form.n_arete" :disabled="esEdicion" />
            </ion-item>

            <ion-item>
                <ion-label position="floating">Nombre</ion-label>
                <ion-input v-model="form.nombre_animal" />
            </ion-item>

            <ion-item>
                <ion-label position="floating">Raza</ion-label>
                <ion-select v-model="form.raza" placeholder="Selecciona raza" interface="action-sheet">
                    <ion-select-option v-for="r in razas" :key="r" :value="r">{{ r }}</ion-select-option>
                </ion-select>
            </ion-item>

            <ion-item>
                <ion-label position="floating">Sexo</ion-label>
                <ion-select v-model="form.sexo" placeholder="Selecciona sexo" interface="action-sheet">
                    <ion-select-option value="F">Hembra</ion-select-option>
                    <ion-select-option value="M">Macho</ion-select-option>
                </ion-select>
            </ion-item>

            <ion-item>
                <ion-label position="floating">Edad (años)</ion-label>
                <ion-input v-model="form.edad" type="number" :disabled="!!form.fecha_nacimiento" />
            </ion-item>
            <p v-if="form.fecha_nacimiento" class="hint">Edad calculada automáticamente desde la fecha de nacimiento.</p>

            <ion-item>
                <ion-label position="floating">Peso (kg)</ion-label>
                <ion-input v-model="form.peso" type="number" />
            </ion-item>

            <ion-item>
                <ion-label position="floating">Estado</ion-label>
                <ion-select v-model="form.estado">
                    <ion-select-option value="Activo">Activo</ion-select-option>
                    <ion-select-option value="Vendido">Vendido</ion-select-option>
                    <ion-select-option value="Muerto">Muerto</ion-select-option>
                </ion-select>
            </ion-item>

            <div class="fecha-group">
                <label>Fecha de nacimiento</label>
                <ion-datetime
                    presentation="date"
                    v-model="form.fecha_nacimiento"
                    :prefer-wheel="false"
                    max="2030-12-31"
                />
            </div>

            <div class="fecha-group">
                <label>Foto del animal {{ esEdicion ? '(dejar vacío para mantener la actual)' : '' }}</label>
                <input type="file" accept="image/*" @change="onFotoChange" />
            </div>

            <p v-if="error" class="error">{{ error }}</p>

            <ion-button
                expand="block"
                class="ion-margin-top"
                :disabled="guardando"
                @click="guardar"
                style="--background: #2d6a4f"
            >
                {{ guardando ? 'Guardando...' : 'Guardar' }}
            </ion-button>
        </ion-content>
    </ion-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
    IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
    IonDatetime, IonButtons, IonButton
} from '@ionic/vue'
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
        error.value = e.response?.data?.message || 'Error al guardar.'
    } finally {
        guardando.value = false
    }
}
</script>

<style scoped>
.error {
    color: red;
    font-size: 0.85rem;
    text-align: center;
    margin: 0.5rem 0;
}

.hint {
    color: #2d6a4f;
    font-size: 0.75rem;
    margin: 0.25rem 1rem 0;
}

.fecha-group {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #ddd;
}

.fecha-group label {
    display: block;
    font-size: 0.8rem;
    color: #888;
    margin-bottom: 0.25rem;
}
</style>
