import axios from 'axios'

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
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