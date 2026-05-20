import { createRouter, createWebHistory } from '@ionic/vue-router'
import { useAuthStore } from '../stores/auth'
import LoginPage from '../views/LoginPage.vue'
import DashboardPage from '../views/DashboardPage.vue'
import FincasPage from '../views/FincasPage.vue'
import AnimalesPage from '../views/AnimalesPage.vue'
import TratamientosPage from '../views/TratamientosPage.vue'
import GanaderoFincasPage from '../views/GanaderoFincasPage.vue'
import GanaderoAnimalesPage from '../views/GanaderoAnimalesPage.vue'
import GanaderoAnimalDetallePage from '../views/GanaderoAnimalDetallePage.vue'
import GanaderoMenuPage from '../views/GanaderoMenuPage.vue'
import GanaderoFincaDetallePage from '../views/GanaderoFincaDetallePage.vue'

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginPage, meta: { guest: true } },
    {
        path: '/dashboard',
        component: DashboardPage,
        meta: { requiresAuth: true },
        children: [
            { path: '/fincas', component: FincasPage },
            { path: '/fincas/:idFinca/animales', component: AnimalesPage },
            { path: '/animales/:nArete/tratamientos', component: TratamientosPage },
            { path: '/ganadero/fincas', component: GanaderoFincasPage },
{ path: '/ganadero/fincas/:idFinca/animales', component: GanaderoAnimalesPage },
{ path: '/ganadero/animales/:nArete/detalle', component: GanaderoAnimalDetallePage },
{ path: '/ganadero/menu', component: GanaderoMenuPage },
{ path: '/ganadero/fincas/:idFinca/detalle', component: GanaderoFincaDetallePage },
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
        return '/dashboard'
    }
})

export default router