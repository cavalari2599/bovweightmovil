import { STORAGE_BASE_URL } from '../config'

// URL publica de un archivo guardado en storage (ej. foto de animal).
// Centraliza la construccion antes duplicada en cada vista (G5/G20).
export function fotoUrl(path) {
    return path ? `${STORAGE_BASE_URL}/${path}` : ''
}

// Comprime y redimensiona una imagen a JPEG.
// Motivo: las fotos de camara pesan 2-5 MB y superan el limite de subida de PHP
// (upload_max_filesize, 2 MB por defecto) -> "The foto failed to upload" (422).
// Ademas el modelo ML reescala a tamano fijo, asi que mas resolucion no da precision.
// Devuelve un Blob image/jpeg; si algo falla, devuelve el archivo original.
export async function comprimirImagen(file, maxLado = 1600, calidad = 0.8) {
    // Carrera contra un timeout: si la decodificacion/codificacion se cuelga
    // (visto en algunos webviews), devolvemos el original en vez de congelar la UI.
    const conTimeout = new Promise(res => setTimeout(() => res(file), 8000))
    return Promise.race([_comprimir(file, maxLado, calidad), conTimeout])
}

async function _comprimir(file, maxLado, calidad) {
    try {
        const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
        const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height))
        const w = Math.round(bitmap.width * escala)
        const h = Math.round(bitmap.height * escala)

        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h)
        bitmap.close?.()

        const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', calidad))
        return blob || file
    } catch {
        return file
    }
}
