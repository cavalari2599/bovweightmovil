import { ref, onMounted, onUnmounted } from 'vue'

// Estado reactivo de conexion a internet, basado en navigator.onLine + eventos.
// Sin plugins nativos: funciona en navegador y en el webview de Capacitor.
export function useOnline() {
    const online = ref(navigator.onLine)
    const actualizar = () => { online.value = navigator.onLine }

    onMounted(() => {
        window.addEventListener('online', actualizar)
        window.addEventListener('offline', actualizar)
    })
    onUnmounted(() => {
        window.removeEventListener('online', actualizar)
        window.removeEventListener('offline', actualizar)
    })

    return online
}
