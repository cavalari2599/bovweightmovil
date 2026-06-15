import * as XLSX from 'xlsx-js-style'

const SEXO = { M: 'Macho', F: 'Hembra' }

function fechaHoy() {
    return new Date().toISOString().slice(0, 10)
}

function limpiarNombre(texto) {
    return (texto || 'finca').replace(/[^\p{L}\p{N}_-]+/gu, '_')
}

function aplicarEstiloEncabezado(hoja, columnas) {
    const estilo = {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
        fill: { fgColor: { rgb: '1D6A4F' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
            top:    { style: 'thin', color: { rgb: 'AAAAAA' } },
            bottom: { style: 'thin', color: { rgb: 'AAAAAA' } },
            left:   { style: 'thin', color: { rgb: 'AAAAAA' } },
            right:  { style: 'thin', color: { rgb: 'AAAAAA' } },
        }
    }
    columnas.forEach((_, i) => {
        const celda = XLSX.utils.encode_cell({ r: 0, c: i })
        if (hoja[celda]) hoja[celda].s = estilo
    })
}

function aplicarEstiloFilas(hoja, totalFilas, totalCols) {
    for (let r = 1; r <= totalFilas; r++) {
        const esImpar = r % 2 === 1
        for (let c = 0; c < totalCols; c++) {
            const celda = XLSX.utils.encode_cell({ r, c })
            if (!hoja[celda]) hoja[celda] = { t: 's', v: '' }
            hoja[celda].s = {
                fill: { fgColor: { rgb: esImpar ? 'F0F7F4' : 'FFFFFF' } },
                alignment: { vertical: 'center', horizontal: c === 0 ? 'left' : 'center' },
                border: {
                    top:    { style: 'thin', color: { rgb: 'DDDDDD' } },
                    bottom: { style: 'thin', color: { rgb: 'DDDDDD' } },
                    left:   { style: 'thin', color: { rgb: 'DDDDDD' } },
                    right:  { style: 'thin', color: { rgb: 'DDDDDD' } },
                }
            }
        }
    }
}

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
    if (hoja['A1']) hoja['A1'].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 13 },
        fill: { fgColor: { rgb: '0D3D26' } },
        alignment: { horizontal: 'center', vertical: 'center' },
    }

    hoja['!cols'] = [
        { wch: 14 }, { wch: 20 }, { wch: 16 }, { wch: 10 },
        { wch: 12 }, { wch: 11 }, { wch: 12 },
    ]
    hoja['!rows'] = [{ hpt: 24 }, { hpt: 20 }]

    aplicarEstiloEncabezado(hoja, Object.keys(filas[0]))
    aplicarEstiloFilas(hoja, filas.length, 7)

    const libro = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(libro, hoja, 'Animales')
    XLSX.writeFile(libro, `Animales_${limpiarNombre(nombreFinca)}_${fechaHoy()}.xlsx`)
}

export function exportarPesajes(animal, pesajes) {
    const nombre = animal.nombre_animal || animal.n_arete
    const titulo = [[`BovWeight CR — Pesajes: ${nombre}  |  Fecha: ${fechaHoy()}`]]

    const filas = pesajes.map(p => ({
        'Fecha':      p.fecha_pesaje,
        'Peso (kg)': p.peso_aproximado,
    }))

    const pesos = pesajes.map(p => p.peso_aproximado).filter(Boolean)
    const promedio = pesos.length ? (pesos.reduce((a, b) => a + b, 0) / pesos.length).toFixed(1) : '-'
    const maximo  = pesos.length ? Math.max(...pesos) : '-'
    const minimo  = pesos.length ? Math.min(...pesos) : '-'
    filas.push({ 'Fecha': 'Promedio', 'Peso (kg)': promedio })
    filas.push({ 'Fecha': 'Máximo',   'Peso (kg)': maximo  })
    filas.push({ 'Fecha': 'Mínimo',   'Peso (kg)': minimo  })

    const hoja = XLSX.utils.json_to_sheet(filas, { origin: 'A2' })
    XLSX.utils.sheet_add_aoa(hoja, titulo, { origin: 'A1' })
    hoja['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }]
    if (hoja['A1']) hoja['A1'].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 13 },
        fill: { fgColor: { rgb: '0D3D26' } },
        alignment: { horizontal: 'center', vertical: 'center' },
    }

    hoja['!cols'] = [{ wch: 16 }, { wch: 13 }]
    hoja['!rows'] = [{ hpt: 24 }, { hpt: 20 }]

    aplicarEstiloEncabezado(hoja, ['Fecha', 'Peso (kg)'])
    aplicarEstiloFilas(hoja, filas.length, 2)

    const libro = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(libro, hoja, 'Pesajes')
    XLSX.writeFile(libro, `Pesajes_${limpiarNombre(nombre)}_${fechaHoy()}.xlsx`)
}