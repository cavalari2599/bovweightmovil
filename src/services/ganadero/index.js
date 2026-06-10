import api from '../api'

export const ganaderoService = {
    getFincas() {
        return api.get('/ganadero/fincas')
    },

    crearFinca(data) {
        return api.post('/ganadero/fincas', data)
    },

    editarFinca(idFinca, data) {
        return api.put(`/ganadero/fincas/${idFinca}`, data)
    },

    getAnimales(idFinca, ordenar = 'peso') {
        return api.get(`/ganadero/fincas/${idFinca}/animales`, { params: { ordenar } })
    },

    getResumenFinca(idFinca) {
        return api.get(`/ganadero/fincas/${idFinca}/resumen`)
    },

    crearAnimal(idFinca, data) {
        return api.post(`/ganadero/fincas/${idFinca}/animales`, data)
    },

    editarAnimal(nArete, data) {
        if (data instanceof FormData) {
            data.append('_method', 'PUT')
            return api.post(`/ganadero/animales/${nArete}`, data)
        }
        return api.put(`/ganadero/animales/${nArete}`, data)
    },

    getPesajes(nArete) {
        return api.get(`/ganadero/animales/${nArete}/pesajes`)
    },

    getTratamientos(nArete) {
        return api.get(`/ganadero/animales/${nArete}/tratamientos`)
    },

    getVeterinarios() {
        return api.get('/ganadero/veterinarios')
    },

    getAyudantes() {
        return api.get('/ganadero/ayudantes')
    },

    asignarVeterinario(idFinca, idVeterinario) {
        return api.post(`/ganadero/fincas/${idFinca}/veterinarios`, { id_veterinario: idVeterinario })
    },

    desasignarVeterinario(idFinca, idVeterinario) {
        return api.delete(`/ganadero/fincas/${idFinca}/veterinarios`, { data: { id_veterinario: idVeterinario } })
    },

    asignarAyudante(idFinca, idAyudante) {
        return api.post(`/ganadero/fincas/${idFinca}/ayudantes`, { id_ayudante: idAyudante })
    },

    desasignarAyudante(idAyudante) {
        return api.delete('/ganadero/ayudantes', { data: { id_ayudante: idAyudante } })
    },
    getAnimal(nArete) {
    return api.get(`/ganadero/animales/${nArete}`)
},
getFoto(nArete) {
    return api.get(`/ganadero/animales/${nArete}/foto`, { responseType: 'blob' })
},
registrarReporte(idFinca, cantidad) {
    return api.post('/ganadero/reportes', { id_finca: idFinca, cantidad })
},
getVeterinariosAsignados(idFinca) {
    return api.get(`/ganadero/fincas/${idFinca}/veterinarios`)
},

getAyudantesAsignados(idFinca) {
    return api.get(`/ganadero/fincas/${idFinca}/ayudantes`)
},

estimarPeso(formData) {
    return api.post('/ganadero/estimar-peso', formData)
},

crearPesaje(nArete, formData) {
    return api.post(`/ganadero/animales/${nArete}/pesajes`, formData)
},

getRecordatorios() {
    return api.get('/ganadero/recordatorios')
},

getTodosAnimales() {
    return api.get('/ganadero/animales-todos')
},

programarPesaje(nArete, data) {
    return api.put(`/ganadero/animales/${nArete}/programar`, data)
},
}