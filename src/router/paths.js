// Rutas de la app centralizadas: unica fuente de verdad para navegacion (G5/N3).
// Mantener sincronizado con router/index.ts. Cambiar un prefijo aqui lo propaga
// a todos los router.push / back-href / tab href, evitando rutas rotas por typo.
export const paths = {
    login: '/login',

    ganadero: {
        menu: '/ganadero/menu',
        captura: '/ganadero/captura',
        calendario: '/ganadero/calendario',
        pendientes: '/ganadero/pendientes',
        fincas: '/ganadero/fincas',
        fincaDetalle: (idFinca) => `/ganadero/fincas/${idFinca}/detalle`,
        animales: (idFinca) => `/ganadero/fincas/${idFinca}/animales`,
        reporte: (idFinca) => `/ganadero/fincas/${idFinca}/reporte`,
        animalDetalle: (nArete) => `/ganadero/animales/${nArete}/detalle`,
    },

    veterinario: {
        fincas: '/veterinario/fincas',
        animales: (idFinca) => `/veterinario/fincas/${idFinca}/animales`,
        tratamientos: (nArete) => `/veterinario/animales/${nArete}/tratamientos`,
    },

    ayudante: {
        menu: '/ayudante/menu',
        animales: '/ayudante/animales',
        animalDetalle: (nArete) => `/ayudante/animales/${nArete}/detalle`,
        captura: '/ayudante/captura',
        pendientes: '/ayudante/pendientes',
    },
}
