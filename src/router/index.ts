import { createRouter, createWebHistory } from '@ionic/vue-router'
import { useAuthStore } from '../stores/auth'
import LoginPage from '../views/auth/LoginPage.vue'
import DashboardPage from '../views/veterinario/DashboardPage.vue'
import VeterinarioMenuPage from '../views/veterinario/MenuPage.vue'
import FincasPage from '../views/veterinario/FincasPage.vue'
import AnimalesPage from '../views/veterinario/AnimalesPage.vue'
import TratamientosPage from '../views/veterinario/TratamientosPage.vue'
import GanaderoLayoutPage from '../views/ganadero/LayoutPage.vue'
import GanaderoMenuPage from '../views/ganadero/MenuPage.vue'
import GanaderoFincasPage from '../views/ganadero/FincasPage.vue'
import GanaderoFincaDetallePage from '../views/ganadero/FincaDetallePage.vue'
import GanaderoAnimalesPage from '../views/ganadero/AnimalesPage.vue'
import GanaderoAnimalDetallePage from '../views/ganadero/AnimalDetallePage.vue'
import GanaderoReportePage from '../views/ganadero/ReportePage.vue'
import GanaderoCapturaRapidaPage from '../views/ganadero/CapturaRapidaPage.vue'
import GanaderoCalendarioPage from '../views/ganadero/CalendarioPage.vue'
import GanaderoPendientesPage from '../views/ganadero/PendientesPage.vue'
import AyudanteLayoutPage from '../views/ayudante/LayoutPage.vue'
import AyudanteMenuPage from '../views/ayudante/MenuPage.vue'
import AyudanteAnimalesPage from '../views/ayudante/AnimalesPage.vue'
import AyudanteAnimalDetallePage from '../views/ayudante/AnimalDetallePage.vue'
import AyudanteCapturaPage from '../views/ayudante/CapturaPage.vue'
import AyudantePendientesPage from '../views/ayudante/PendientesPage.vue'
import { paths } from './paths'

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginPage, meta: { guest: true } },

    // Veterinario
    {
        path: '/veterinario',
        component: DashboardPage,
        meta: { requiresAuth: true },
        children: [
            { path: 'menu', component: VeterinarioMenuPage },
            { path: 'fincas', component: FincasPage },
            { path: 'fincas/:idFinca/animales', component: AnimalesPage },
            { path: 'animales/:nArete/tratamientos', component: TratamientosPage },
        ]
    },

    // Ganadero
    {
        path: '/ganadero',
        component: GanaderoLayoutPage,
        meta: { requiresAuth: true },
        children: [
            { path: 'menu', component: GanaderoMenuPage },
            { path: 'captura', component: GanaderoCapturaRapidaPage },
            { path: 'calendario', component: GanaderoCalendarioPage },
            { path: 'pendientes', component: GanaderoPendientesPage },
            { path: 'fincas', component: GanaderoFincasPage },
            { path: 'fincas/:idFinca/detalle', component: GanaderoFincaDetallePage },
            { path: 'fincas/:idFinca/animales', component: GanaderoAnimalesPage },
            { path: 'fincas/:idFinca/reporte', component: GanaderoReportePage },
            { path: 'animales/:nArete/detalle', component: GanaderoAnimalDetallePage },
        ]
    },

    // Ayudante
    {
        path: '/ayudante',
        component: AyudanteLayoutPage,
        meta: { requiresAuth: true },
        children: [
            { path: 'menu', component: AyudanteMenuPage },
            { path: 'captura', component: AyudanteCapturaPage },
            { path: 'pendientes', component: AyudantePendientesPage },
            { path: 'animales', component: AyudanteAnimalesPage },
            { path: 'animales/:nArete/detalle', component: AyudanteAnimalDetallePage },
        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes as any
})

router.beforeEach((to, from) => {
    const auth = useAuthStore()
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return '/login'
    }
    if (to.meta.guest && auth.isAuthenticated) {
        const rol = auth.usuario?.rol
        if (rol === 2) return paths.veterinario.menu
        if (rol === 1) return paths.ganadero.menu
        if (rol === 3) return paths.ayudante.menu
    }
})

export default router