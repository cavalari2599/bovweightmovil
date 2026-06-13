import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        usuario: JSON.parse(localStorage.getItem('usuario')) || null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        getRol: (state) => state.usuario?.rol || null,
    },

    actions: {
        async login(correo, clave) {
            const response = await api.post('/login', { correo, clave })
            this.token = response.data.token
            this.usuario = response.data.usuario
            localStorage.setItem('token', this.token)
            localStorage.setItem('usuario', JSON.stringify(this.usuario))
        },

        async logout() {
            await api.post('/logout')
            this.token = null
            this.usuario = null
            localStorage.removeItem('token')
            localStorage.removeItem('usuario')
        },
    }
})