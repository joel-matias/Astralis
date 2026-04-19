'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { TipoRuta, EstadoRuta } from '@prisma/client'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import type { RutaDTO } from '@/models/rutas/RutaDTO'
import { ControladorRutas } from '@/services/rutas/ControladorRutas'
import { APIMapas } from '@/services/rutas/APIMapas'

export type { RutaDTO, ParadaDTO } from '@/models/rutas/RutaDTO'

const controlador = new ControladorRutas()

function mapTipoRuta(valor: string): 'Directa' | 'ConParadas' {
    if (valor === 'CON_PARADAS' || valor === 'ConParadas') return 'ConParadas'
    return 'Directa'
}

// RN1: código autogenerado basado en el total de rutas existentes
export async function generarCodigoRuta(): Promise<string> {
    const count = await prisma.ruta.count()
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

export async function toggleEstadoRuta(rutaID: string, estadoActual: EstadoRuta) {
    const nuevoEstado = estadoActual === EstadoRuta.ACTIVA ? EstadoRuta.INACTIVA : EstadoRuta.ACTIVA
    await prisma.ruta.update({ where: { rutaID }, data: { estado: nuevoEstado } })
    revalidatePath('/admin/rutas')
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

    if (!data.omitirDuplicado) {
        const duplicado = await prisma.ruta.findFirst({
            where: { ciudadOrigen: data.ciudadOrigen, ciudadDestino: data.ciudadDestino, rutaID: { not: rutaID } },
            select: { codigoRuta: true },
        })
        if (duplicado) return { warning: `Ya existe la ruta ${duplicado.codigoRuta} con el mismo origen y destino. ¿Deseas guardar de todas formas?` }
    }

    try {
        const tipoRutaPrisma = mapTipoRuta(data.tipoRuta as string) === 'ConParadas' ? TipoRuta.CON_PARADAS : TipoRuta.DIRECTA
        await prisma.ruta.update({
            where: { rutaID },
            data: {
                codigoRuta: data.codigoRuta.toUpperCase().trim(),
                nombreRuta: data.nombreRuta ?? `${data.ciudadOrigen} - ${data.ciudadDestino}`,
                ciudadOrigen: data.ciudadOrigen,
                terminalOrigen: data.terminalOrigen,
                ciudadDestino: data.ciudadDestino,
                terminalDestino: data.terminalDestino,
                distanciaKm: data.distanciaKm,
                tiempoEstimadoHrs: data.tiempoEstimadoHrs,
                tipoRuta: tipoRutaPrisma,
                tarifaBase: data.tarifaBase,
                paradas: {
                    deleteMany: {},
                    create: data.paradas.map((p, i) => ({
                        nombreParada: p.nombreParada,
                        ciudad: p.ciudad,
                        ordenEnRuta: i + 1,
                        distanciaDesdeOrigenKm: p.distanciaDesdeOrigenKm,
                        tiempoEsperaMin: p.tiempoEsperaMin,
                        tarifaDesdeOrigen: p.tarifaDesdeOrigen,
                    })),
                },
            },
        })
    } catch (e: unknown) {
        const err = e as { code?: string }
        if (err?.code === 'P2002') return { error: 'El código de ruta ya existe.' }
        return { error: 'Error al actualizar la ruta. Intenta de nuevo.' }
    }

    redirect('/admin/rutas')
}
