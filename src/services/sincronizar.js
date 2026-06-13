import { colaPesajes } from './colaPesajes'
import { comprimirImagen } from './media'

// Estima el peso de las capturas en cola que aun no tienen peso (cuando hay conexion).
// Guarda el peso_estimado en cada item para que al abrir Pendientes ya esten "pesadas".
// service: objeto con estimarPeso(formData).
// Devuelve { estimadas, fallidas } de esta corrida.
//
// Distincion clave para no quedar en bucle infinito:
//   - Sin respuesta del servidor (sin red) -> se deja pendiente y se reintenta luego.
//   - Respuesta 4xx (foto invalida, no se detecto vaca, sexo faltante) -> es un
//     rechazo definitivo: se guarda el motivo en error_estim y NO se reintenta.
//     La pantalla de Pendientes lo muestra y permite ingresar el peso a mano.
export async function estimarPendientes(service) {
    const items = await colaPesajes.listar()
    let estimadas = 0
    let fallidas = 0

    for (const it of items) {
        // Ya estimado, o ya marcado como fallido: no reintentar.
        if (it.peso_estimado != null || it.error_estim) continue

        try {
            const fd = new FormData()
            // Recomprime por si la captura quedo guardada sin comprimir (items viejos
            // de 2-5 MB que superan el limite de subida de PHP).
            const fotoBlob = await comprimirImagen(it.foto)
            fd.append('foto', fotoBlob, it.foto.name || 'captura.jpg')
            fd.append('sexo', it.sexo)

            const { data } = await service.estimarPeso(fd)
            await colaPesajes.actualizar(it.id, { peso_estimado: data.peso_estimado_kg, error_estim: null })
            estimadas++
        } catch (e) {
            // Sin respuesta del servidor: fue un fallo de red -> reintentar en la proxima corrida.
            if (!e.response) continue

            // El servidor rechazo la imagen (422 u otro 4xx): definitivo, no reintentar.
            const motivo = e.response?.data?.message || 'No se pudo estimar el peso de esta foto.'
            await colaPesajes.actualizar(it.id, { error_estim: motivo })
            fallidas++
        }
    }

    return { estimadas, fallidas }
}
