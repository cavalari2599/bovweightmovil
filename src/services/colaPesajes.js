import { idb } from './db'

// Cola local de pesajes capturados offline.
// Cada item: { id, sexo, foto (Blob), fecha_captura, peso_estimado (null hasta estimar) }
// El animal NO se elige offline: se asigna al aceptar (online) en Pendientes.

export const colaPesajes = {
    async encolar({ sexo, foto }) {
        // On Capacitor/Android, File objects from native camera pickers reference
        // temporary native paths. Reading arrayBuffer() forces the bytes into
        // webview memory before IndexedDB serializes them.
        const buffer = await foto.arrayBuffer()
        const fotoBlob = new Blob([buffer], { type: foto.type || 'image/jpeg' })
        return idb.add('pendientes', {
            sexo,
            foto: fotoBlob,
            fecha_captura: new Date().toISOString(),
            peso_estimado: null,
        })
    },

    listar() {
        return idb.getAll('pendientes')
    },

    async actualizar(id, patch) {
        const items = await idb.getAll('pendientes')
        const item = items.find(x => x.id === id)
        if (!item) return
        await idb.put('pendientes', { ...item, ...patch })
    },

    eliminar(id) {
        return idb.delete('pendientes', id)
    },

    contar() {
        return idb.count('pendientes')
    },
}
