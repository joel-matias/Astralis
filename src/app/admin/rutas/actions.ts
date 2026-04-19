'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { EstadoRuta } from '@prisma/client'
import { auth } from '@/auth'
import type { RutaDTO } from '@/models/rutas/RutaDTO'
import { ControladorRutas } from '@/services/rutas/ControladorRutas'
import { RepositorioRutas } from '@/repositories/rutas/RepositorioRutas'
import { APIMapas } from '@/services/rutas/APIMapas'

export type { RutaDTO, ParadaDTO } from '@/models/rutas/RutaDTO'

const controlador = new ControladorRutas()
const repositorio = new RepositorioRutas()

function mapTipoRuta(valor: string): 'Directa' | 'ConParadas' {
    if (valor === 'CON_PARADAS' || valor === 'ConParadas') return 'ConParadas'
    return 'Directa'
}

// RN1: código autogenerado basado en el total de rutas existentes
export async function generarCodigoRuta(): Promise<string> {
    const count = await repositorio.contarRutas()
    return `RUT-${String(count + 1).padStart(3, '0')}`
}

// S2: calcula distancia y tiempo reales vía Mapbox; retorna 0,0 si la API no está disponible
export async function calcularDistanciaRuta(
    origen: string,
    destino: string,
    paradas: string[]
): Promise<{ distanciaKm: number; tiempoHoras: number }> {
    const api = new APIMapas()
    return api.calcularDistanciaYTiempo(origen, destino, paradas)
}

// D7 S3: al activar/desactivar registra en LogAuditoria vía ControladorRutas → AuditoriaService
export async function toggleEstadoRuta(rutaID: string, estadoActual: EstadoRuta) {
    const session = await auth()
    if (!session?.user?.id) return

    const estadoInterno: 'Activa' | 'Inactiva' = estadoActual === EstadoRuta.ACTIVA ? 'Activa' : 'Inactiva'
    await controlador.toggleEstado(rutaID, estadoInterno, session.user.id)
    revalidatePath('/admin/rutas')
}

// D7: validación server-side de cada parada — llamada desde PasoConfiguracionParadas al confirmar
export async function validarParadaServidor(
    parada: { nombreParada: string; ciudad: string; distanciaDesdeOrigenKm: number; tiempoEsperaMin: number; tarifaDesdeOrigen: number },
    distanciaTotal: number,
    paradasExistentes: { ciudad: string }[]
): Promise<{ valida: boolean; errorDetalle: string | null }> {
    return controlador.validarParada(
        { ...parada, ordenEnRuta: 1, tiempoDesdeOrigen: 0 },
        distanciaTotal,
        paradasExistentes.map(p => ({
            nombreParada: '',
            ciudad: p.ciudad,
            ordenEnRuta: 0,
            distanciaDesdeOrigenKm: 0,
            tiempoDesdeOrigen: 0,
            tiempoEsperaMin: 0,
            tarifaDesdeOrigen: 0,
        }))
    )
}

// El redirect lo maneja el wizard después del diálogo PreguntandoActivacion
export async function crearRuta(data: RutaDTO): Promise<{ error: string } | { warning: string } | { rutaID: string }> {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Sesión no válida.' }

    try {
        const resultado = await controlador.procesarCreacion({
            codigoRuta: data.codigoRuta,
            nombreRuta: data.nombreRuta ?? `${data.ciudadOrigen} - ${data.ciudadDestino}`,
            ciudadOrigen: data.ciudadOrigen,
            terminalOrigen: data.terminalOrigen,
            ciudadDestino: data.ciudadDestino,
            terminalDestino: data.terminalDestino,
            distanciaKm: data.distanciaKm,
            tiempoEstimadoHrs: data.tiempoEstimadoHrs,
            tipoRuta: mapTipoRuta(data.tipoRuta as string),
            tarifaBase: data.tarifaBase,
            estado: 'Inactiva',
            paradas: data.paradas.map((p, i) => ({ ...p, ordenEnRuta: i + 1, tiempoDesdeOrigen: 0 })),
            usuarioID: session.user.id,
        })

        if (resultado.duplicado && !data.omitirDuplicado) {
            return { warning: `Ya existe la ruta ${resultado.duplicado} con el mismo origen y destino. ¿Deseas guardar de todas formas?` }
        }

        return { rutaID: resultado.rutaID }
    } catch (e: unknown) {
        const err = e as { message?: string; code?: string }
        if (err?.code === 'P2002') return { error: 'El código de ruta ya existe.' }
        return { error: err?.message ?? 'Error al guardar la ruta. Intenta de nuevo.' }
    }
}

export async function actualizarRuta(rutaID: string, data: RutaDTO): Promise<{ error: string } | { warning: string } | void> {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Sesión no válida.' }

    try {
        const resultado = await controlador.procesarActualizacion(rutaID, {
            codigoRuta: data.codigoRuta,
            nombreRuta: data.nombreRuta ?? `${data.ciudadOrigen} - ${data.ciudadDestino}`,
            ciudadOrigen: data.ciudadOrigen,
            terminalOrigen: data.terminalOrigen,
            ciudadDestino: data.ciudadDestino,
            terminalDestino: data.terminalDestino,
            distanciaKm: data.distanciaKm,
            tiempoEstimadoHrs: data.tiempoEstimadoHrs,
            tipoRuta: mapTipoRuta(data.tipoRuta as string),
            tarifaBase: data.tarifaBase,
            estado: 'Activa',
            paradas: data.paradas.map((p, i) => ({ ...p, ordenEnRuta: i + 1, tiempoDesdeOrigen: 0 })),
            usuarioID: session.user.id,
        })

        if (resultado.duplicado && !data.omitirDuplicado) {
            return { warning: `Ya existe la ruta ${resultado.duplicado} con el mismo origen y destino. ¿Deseas guardar de todas formas?` }
        }
    } catch (e: unknown) {
        const err = e as { message?: string; code?: string }
        if (err?.code === 'P2002') return { error: 'El código de ruta ya existe.' }
        return { error: err?.message ?? 'Error al actualizar la ruta. Intenta de nuevo.' }
    }

    redirect('/admin/rutas')
}
