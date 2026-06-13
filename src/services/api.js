import axios from 'axios'
import { API_BASE_URL } from '../config'

const api = axios.create({
    baseURL: API_BASE_URL,
    // Sin timeout una request colgada (server single-thread, red caida) congela la UI.
    timeout: 60000,
    headers: {
        'Accept': 'application/json',
    }
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            alert('No se pudo conectar con el servidor. Verifique su conexión.')
        } else if (error.response.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('usuario')
            window.location.href = '/login'
        } else if (error.response.status === 403) {
            alert('No tienes permisos para realizar esta acción.')
        } else if (error.response.status === 500) {
            alert('Error interno del servidor. Intente de nuevo más tarde.')
        }
        return Promise.reject(error)
    }
)

export default api