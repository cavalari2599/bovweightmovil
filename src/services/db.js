// Wrapper minimo de IndexedDB (sin dependencias). Funciona en navegador y webview.
// Stores:
//   - 'pendientes': capturas de pesaje hechas offline (foto Blob + animal + sexo).
//   - 'animales'  : cache de animales para poder elegir offline.

const DB_NAME = 'bovweight'
const DB_VERSION = 1
let dbPromise = null

function abrir() {
    if (dbPromise) return dbPromise
    dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION)
        req.onupgradeneeded = () => {
            const db = req.result
            if (!db.objectStoreNames.contains('pendientes')) {
                db.createObjectStore('pendientes', { keyPath: 'id', autoIncrement: true })
            }
            if (!db.objectStoreNames.contains('animales')) {
                db.createObjectStore('animales', { keyPath: 'n_arete' })
            }
        }
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
    return dbPromise
}

function operar(store, mode, accion) {
    return abrir().then(db => new Promise((resolve, reject) => {
        const t = db.transaction(store, mode)
        const req = accion(t.objectStore(store))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    }))
}

export const idb = {
    add: (store, value) => operar(store, 'readwrite', s => s.add(value)),
    put: (store, value) => operar(store, 'readwrite', s => s.put(value)),
    getAll: (store) => operar(store, 'readonly', s => s.getAll()),
    delete: (store, key) => operar(store, 'readwrite', s => s.delete(key)),
    clear: (store) => operar(store, 'readwrite', s => s.clear()),
    count: (store) => operar(store, 'readonly', s => s.count()),
}
