import api from '../api'

export const ayudanteService = {
    getFinca() {
        return api.get('/ayudante/finca')
    },

    getAnimales(ordenar = 'peso') {
        return api.get('/ayudante/animales', { params: { ordenar } })
    },

    getAnimal(nArete) {
        return api.get(`/ayudante/animales/${nArete}`)
    },

    getPesajes(nArete) {
        return api.get(`/ayudante/animales/${nArete}/pesajes`)
    },

    getTratamientos(nArete) {
        return api.get(`/ayudante/animales/${nArete}/tratamientos`)
    },

    estimarPeso(formData) {
        return api.post('/ayudante/estimar-peso', formData)
    },

    crearPesaje(nArete, formData) {
        return api.post(`/ayudante/animales/${nArete}/pesajes`, formData)
    },
}
