import api from './api'

export const veterinarioService = {
    getFincas() {
        return api.get('/veterinario/fincas')
    },

    getAnimales(idFinca) {
        return api.get(`/veterinario/fincas/${idFinca}/animales`)
    },

    getTratamientos(nArete) {
        return api.get(`/veterinario/animales/${nArete}/tratamientos`)
    },

    createTratamiento(data) {
        return api.post('/veterinario/tratamientos', data)
    },

    updateTratamiento(id, data) {
        return api.put(`/veterinario/tratamientos/${id}`, data)
    },

    getPesajes(nArete) {
        return api.get(`/veterinario/animales/${nArete}/pesajes`)
    }
}