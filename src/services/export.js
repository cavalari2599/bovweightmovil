import * as XLSX from 'xlsx'

// Exportacion de datos a Excel (.xlsx) para el contador del ganadero.
// SheetJS genera el libro y dispara la descarga en el navegador / webview.

const SEXO = { M: 'Macho', F: 'Hembra' }

function fechaHoy() {
    return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

function limpiarNombre(texto) {
    return (texto || 'finca').replace(/[^\p{L}\p{N}_-]+/gu, '_')
}

/**
 * Exporta la lista de animales (snapshot actual) a un archivo Excel.
 * @param {Array} animales  animales con n_arete, nombre_animal, raza, sexo, edad, peso, estado
 * @param {string} nombreFinca  nombre de la finca, para el nombre de archivo
 */
export function exportarAnimales(animales, nombreFinca) {
    const filas = animales.map(a => ({
        'Arete': a.n_arete,
        'Nombre': a.nombre_animal || '',
        'Raza': a.raza || '',
        'Sexo': SEXO[a.sexo] || '',
        'Edad (años)': a.edad ?? '',
        'Peso (kg)': a.peso ?? '',
        'Estado': a.estado || '',
    }))

    const hoja = XLSX.utils.json_to_sheet(filas)
    hoja['!cols'] = [
        { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 10 },
        { wch: 11 }, { wch: 11 }, { wch: 12 },
    ]

    const libro = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(libro, hoja, 'Animales')
    XLSX.writeFile(libro, `Animales_${limpiarNombre(nombreFinca)}_${fechaHoy()}.xlsx`)
}

/**
 * Exporta el historial de pesajes de un animal a Excel.
 * @param {Object} animal  con n_arete y nombre_animal
 * @param {Array} pesajes  con fecha_pesaje y peso_aproximado
 */
export function exportarPesajes(animal, pesajes) {
    const filas = pesajes.map(p => ({
        'Fecha': p.fecha_pesaje,
        'Peso (kg)': p.peso_aproximado,
    }))

    const hoja = XLSX.utils.json_to_sheet(filas)
    hoja['!cols'] = [{ wch: 14 }, { wch: 11 }]

    const libro = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(libro, hoja, 'Pesajes')
    const id = animal.nombre_animal || animal.n_arete
    XLSX.writeFile(libro, `Pesajes_${limpiarNombre(id)}_${fechaHoy()}.xlsx`)
}
