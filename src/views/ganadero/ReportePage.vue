<template>
    <ion-page>
        <ganadero-header title="Reporte para comprador" :back-href="`${paths.ganadero.fincas}?modo=reporte`" />

        <ion-content>
            <div v-if="loading" class="ion-text-center ion-padding">
                <ion-spinner />
            </div>

            <div v-else>
                <ion-searchbar
                    v-model="busqueda"
                    placeholder="Buscar por nombre"
                    :debounce="200"
                />

                <div class="reporte-acciones">
                    <ion-button size="small" fill="outline" color="success" @click="seleccionarTodos">
                        {{ todosSeleccionados ? 'Quitar todos' : 'Seleccionar todos' }}
                    </ion-button>
                    <span class="contador">{{ seleccionados.length }} seleccionados</span>
                </div>

                <ion-list>
                    <ion-item v-for="a in filtrados" :key="a.n_arete">
                        <ion-checkbox
                            slot="start"
                            :checked="seleccionados.includes(a.n_arete)"
                            @ionChange="toggleSeleccion(a.n_arete)"
                        />
                        <ion-thumbnail slot="start" v-if="a.foto_animal">
                            <img :src="fotoUrl(a.foto_animal)" alt="foto" />
                        </ion-thumbnail>
                        <ion-label>
                            <h3>{{ a.nombre_animal || 'Sin nombre' }}</h3>
                            <p>Arete: {{ a.n_arete }} | Peso: {{ a.peso }} kg</p>
                        </ion-label>
                    </ion-item>
                    <ion-item v-if="filtrados.length === 0">
                        <ion-label class="ion-text-center">No hay animales disponibles.</ion-label>
                    </ion-item>
                </ion-list>
            </div>
        </ion-content>

        <ion-footer>
            <ion-toolbar>
                <ion-button
                    expand="block"
                    class="ion-margin"
                    :disabled="seleccionados.length === 0 || generandoPDF"
                    @click="generarReporte"
                    style="--background: #2d6a4f"
                >
                    {{ generandoPDF ? 'Generando...' : `Generar reporte (${seleccionados.length})` }}
                </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
    IonPage, IonToolbar, IonContent, IonFooter,
    IonList, IonItem, IonLabel, IonSpinner,
    IonButton, IonSearchbar, IonCheckbox, IonThumbnail
} from '@ionic/vue'
import { jsPDF } from 'jspdf'
import { ganaderoService } from '../../services/ganadero'
import { fotoUrl } from '../../services/media'
import { paths } from '../../router/paths'
import GanaderoHeader from '../../components/ganadero/GanaderoHeader.vue'

const route = useRoute()
const idFinca = route.params.idFinca

const animales = ref([])
const loading = ref(true)
const busqueda = ref('')
const seleccionados = ref([])
const generandoPDF = ref(false)

const disponibles = computed(() => animales.value.filter(a => a.estado === 'Activo'))

const filtrados = computed(() => {
    const q = busqueda.value.trim().toLowerCase()
    if (!q) return disponibles.value
    return disponibles.value.filter(a => (a.nombre_animal || '').toLowerCase().includes(q))
})

const todosSeleccionados = computed(() =>
    filtrados.value.length > 0 &&
    filtrados.value.every(a => seleccionados.value.includes(a.n_arete))
)

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

async function generarReporte() {
    generandoPDF.value = true
    try {
        const seleccion = animales.value.filter(a => seleccionados.value.includes(a.n_arete))
        const doc = new jsPDF()
        const pageH = doc.internal.pageSize.getHeight()

        doc.setFontSize(18)
        doc.setTextColor('#2d6a4f')
        doc.text('Animales Disponibles', 14, 20)
        doc.setFontSize(10)
        doc.setTextColor('#666')
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-CR')}`, 14, 27)
        doc.text(`Total: ${seleccion.length} animal(es)`, 14, 32)

        let y = 42
        for (const a of seleccion) {
            if (y > pageH - 40) { doc.addPage(); y = 20 }

            if (a.foto_animal) {
                const dataUrl = await imgToDataUrl(a.n_arete)
                if (dataUrl) {
                    let fmt = dataUrl.substring(dataUrl.indexOf('/') + 1, dataUrl.indexOf(';')).toUpperCase()
                    if (fmt === 'JPG') fmt = 'JPEG'
                    try { doc.addImage(dataUrl, fmt, 14, y, 35, 28) } catch { /* formato no soportado */ }
                }
            }

            doc.setFontSize(13)
            doc.setTextColor('#222')
            doc.text(`${a.nombre_animal || 'Sin nombre'}`, 55, y + 7)
            doc.setFontSize(10)
            doc.setTextColor('#444')
            doc.text(`Arete: ${a.n_arete}`, 55, y + 14)
            doc.text(`Raza: ${a.raza || '-'}`, 55, y + 20)
            doc.text(`Peso estimado: ${a.peso != null ? a.peso + ' kg' : '-'}`, 55, y + 26)

            doc.setDrawColor('#ddd')
            doc.line(14, y + 32, 196, y + 32)
            y += 40
        }

        doc.save(`reporte-animales-${Date.now()}.pdf`)

        try {
            await ganaderoService.registrarReporte(idFinca, seleccion.length)
        } catch { /* no bloquear descarga si falla el registro */ }
    } finally {
        generandoPDF.value = false
    }
}

onMounted(cargar)
</script>

<style scoped>
.reporte-acciones {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem 0.5rem;
}

.contador {
    font-size: 0.85rem;
    color: #2d6a4f;
    font-weight: bold;
}
</style>
