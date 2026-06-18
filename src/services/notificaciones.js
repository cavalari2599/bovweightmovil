// Notificaciones locales para los recordatorios de re-pesaje.
// El cliente (Don Iván) pidió que la app le avise en el teléfono cuándo
// volver a pesar un animal. Esto agenda una notificación local nativa por
// cada recordatorio futuro. En web (dev) no hace nada: el calendario en
// pantalla sigue funcionando igual.
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

let permisoCache = null

async function asegurarPermiso() {
    if (!Capacitor.isNativePlatform()) return false
    if (permisoCache !== null) return permisoCache
    try {
        let estado = await LocalNotifications.checkPermissions()
        if (estado.display !== 'granted') {
            estado = await LocalNotifications.requestPermissions()
        }
        permisoCache = estado.display === 'granted'
    } catch {
        permisoCache = false
    }
    return permisoCache
}

// ID numérico estable a partir del arete: permite re-agendar sin duplicar.
function idDesdeArete(arete) {
    const s = String(arete)
    let h = 0
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 2000000000
    return h + 1
}

/**
 * Sincroniza las notificaciones locales con la lista de recordatorios.
 * Cancela lo agendado y reprograma una notificación (8:00 a.m.) por cada
 * recordatorio con fecha futura. No agenda fechas pasadas (no se puede),
 * esos siguen visibles como "atrasados" dentro de la app.
 */
export async function sincronizarRecordatorios(recordatorios = []) {
    if (!(await asegurarPermiso())) return
    try {
        const pendientes = await LocalNotifications.getPending()
        if (pendientes.notifications.length) {
            await LocalNotifications.cancel({
                notifications: pendientes.notifications.map(n => ({ id: n.id })),
            })
        }

        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)

        const aAgendar = []
        for (const r of recordatorios) {
            const fechaStr = (r.proximo_pesaje || '').slice(0, 10)
            if (!fechaStr) continue
            const fecha = new Date(fechaStr + 'T08:00:00')
            if (isNaN(fecha) || fecha < hoy) continue
            aAgendar.push({
                id: idDesdeArete(r.n_arete),
                title: 'Recordatorio de pesaje',
                body: `Toca pesar a ${r.nombre_animal || r.n_arete}.`,
                schedule: { at: fecha },
            })
        }

        if (aAgendar.length) {
            await LocalNotifications.schedule({ notifications: aAgendar })
        }
    } catch {
        // Silenciar: la app no debe romperse si fallan las notificaciones.
    }
}
