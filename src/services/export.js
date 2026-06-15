import * as XLSX from 'xlsx'

const SEXO = { M: 'Macho', F: 'Hembra' }

function fechaHoy() {
    return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

function limpiarNombre(texto) {
    return (texto || 'finca').replace(/[^\p{L}\p{N}_-]+/gu, '_')
}

/**
 * Exporta la lista de animales a un archivo Excel estándar.
 */
export function exportarAnimales(animales, nombreFinca) {
    const titulo = [[`BovWeight CR — Animales: ${nombreFinca}  |  Fecha: ${fechaHoy()}`]]
    const filas = animales.map(a => ({
        'Arete':       a.n_arete,
        'Nombre':      a.nombre_animal || '',
        'Raza':        a.raza || '',
        'Sexo':        SEXO[a.sexo] || '',
        'Edad (años)': a.edad ?? '',
        'Peso (kg)':   a.peso ?? '',
        'Estado':      a.estado || '',
    }))

    const activos  = animales.filter(a => a.estado === 'Activo').length
    const pesosProm = animales.filter(a => a.peso).reduce((s, a) => s + a.peso, 0) / (animales.filter(a => a.peso).length || 1)
    
    filas.push({
        'Arete': '',
        'Nombre': `Total: ${animales.length} animales`,
        'Raza': `Activos: ${activos}`,
        'Sexo': '',
        'Edad (años)': '',
        'Peso (kg)': `Prom: ${pesosProm.toFixed(1)}`,
        'Estado': '',
    })

    const hoja = XLSX.utils.json_to_sheet(filas, { origin: 'A2' })
    XLSX.utils.sheet_add_aoa(hoja, titulo, { origin: 'A1' })
    hoja['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }]

    hoja['!cols'] = [
        { wch: 14 }, { wch: 20 }, { wch: 16 }, { wch: 10 },
        { wch: 12 }, { wch: 11 }, { wch: 12 },
    ]

    const libro = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(libro, hoja, 'Animales')
    XLSX.writeFile(libro, `Animales_${limpiarNombre(nombreFinca)}_${fechaHoy()}.xlsx`)
}

/**
 * Exporta el historial de pesajes a un archivo Excel estándar.
 */
export function exportarPesajes(animal, pesajes) {
    const nombre = animal.nombre_animal || animal.n_arete
    const titulo = [[`BovWeight CR — Pesajes: ${nombre}  |  Fecha: ${fechaHoy()}`]]

    const filas = pesajes.map(p => ({
        'Fecha':     p.fecha_pesaje,
        'Peso (kg)': p.peso_aproximado,
    }))

    const pesos = pesajes.map(p => p.peso_aproximado).filter(Boolean)
    const promedio = pesos.length ? (pesos.reduce((a, b) => a + b, 0) / pesos.length).toFixed(1) : '-'
    const maximo   = pesos.length ? Math.max(...pesos) : '-'
    const minimo   = pesos.length ? Math.min(...pesos) : '-'
    
    filas.push({ 'Fecha': 'Promedio', 'Peso (kg)': promedio })
    filas.push({ 'Fecha': 'Máximo',   'Peso (kg)': maximo  })
    filas.push({ 'Fecha': 'Mínimo',   'Peso (kg)': minimo  })

    const hoja = XLSX.utils.json_to_sheet(filas, { origin: 'A2' })
    XLSX.utils.sheet_add_aoa(hoja, titulo, { origin: 'A1' })
    hoja['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }]

    hoja['!cols'] = [{ wch: 16 }, { wch: 13 }]

    const libro = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(libro, hoja, 'Pesajes')
    XLSX.writeFile(libro, `Pesajes_${limpiarNombre(nombre)}_${fechaHoy()}.xlsx`)
}