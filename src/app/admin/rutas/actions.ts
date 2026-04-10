'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { EstadoRuta, TipoRuta } from '@prisma/client'

export interface ParadaFormData {
    nombreParada: string
    ciudad: string
    distanciaDesdeOrigenKm: number
    tiempoEsperaMin: number
    tarifaDesdeOrigen: number
}

export interface RutaFormData {
    codigoRuta: string
    tipoRuta: TipoRuta
    tarifaBase: number
    ciudadOrigen: string
    terminalOrigen: string
    ciudadDestino: string
    terminalDestino: string
    distanciaKm: number
    tiempoEstimadoHrs: number
    paradas: ParadaFormData[]
    omitirDuplicado?: boolean
}

export async function toggleEstadoRuta(rutaID: string, estadoActual: EstadoRuta) {
    const session = await auth()
    const nuevoEstado = estadoActual === EstadoRuta.ACTIVA
        ? EstadoRuta.INACTIVA
        : EstadoRuta.ACTIVA

    await prisma.ruta.update({
        where: { rutaID },
        data: { estado: nuevoEstado },
    })

    await prisma.logAuditoria.create({
        data: {
            usuarioID: session?.user?.id ?? undefined,
            accion: nuevoEstado === EstadoRuta.ACTIVA ? 'ACTIVAR_RUTA' : 'DESACTIVAR_RUTA',
            modulo: 'rutas',
            resultado: 'Exito',
            detalles: `Ruta ${rutaID} → ${nuevoEstado}`,
        },
    })

    revalidatePath('/admin/rutas')
}

export async function crearRuta(data: RutaFormData): Promise<{ error: string } | { warning: string } | void> {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Sesión no válida.' }

    if (!data.codigoRuta || !data.ciudadOrigen || !data.ciudadDestino
        || !data.terminalOrigen || !data.terminalDestino) {
        return { error: 'Completa todos los campos obligatorios.' }
    }
    if (data.ciudadOrigen.trim().toLowerCase() === data.ciudadDestino.trim().toLowerCase()) {
        return { error: 'La ciudad de origen y destino no pueden ser iguales.' }
    }
    if (data.distanciaKm <= 0) {
        return { error: 'La distancia debe ser mayor a 0 km.' }
    }
    if (data.tarifaBase <= 0) {
        return { error: 'La tarifa base debe ser mayor a $0.' }
    }
    if (data.tipoRuta === TipoRuta.CON_PARADAS && data.paradas.length === 0) {
        return { error: 'Una ruta CON PARADAS debe tener al menos una parada.' }
    }

    const duplicado = await prisma.ruta.findFirst({
        where: {
            ciudadOrigen: data.ciudadOrigen.trim(),
            ciudadDestino: data.ciudadDestino.trim(),
        },
    })
    if (duplicado && !data.omitirDuplicado) {
        return { warning: `Ya existe la ruta ${duplicado.codigoRuta} con el mismo origen y destino. ¿Deseas guardar de todas formas?` }
    }

    try {
        await prisma.ruta.create({
            data: {
                codigoRuta: data.codigoRuta.toUpperCase().trim(),
                nombreRuta: `${data.ciudadOrigen} - ${data.ciudadDestino}`,
                ciudadOrigen: data.ciudadOrigen,
                ciudadDestino: data.ciudadDestino,
                terminalOrigen: data.terminalOrigen,
                terminalDestino: data.terminalDestino,
                distanciaKm: data.distanciaKm,
                tiempoEstimadoHrs: data.tiempoEstimadoHrs,
                tipoRuta: data.tipoRuta,
                tarifaBase: data.tarifaBase,
                creadoPorID: session.user.id,
                paradas: {
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

        await prisma.logAuditoria.create({
            data: {
                usuarioID: session.user.id,
                accion: 'CREAR_RUTA',
                modulo: 'rutas',
                resultado: 'Exito',
                detalles: `Ruta creada: ${data.codigoRuta} (${data.ciudadOrigen} → ${data.ciudadDestino})`,
            },
        })
    } catch (e: unknown) {
        const err = e as { code?: string }
        if (err?.code === 'P2002') return { error: 'El código de ruta ya existe.' }
        return { error: 'Error al guardar la ruta. Intenta de nuevo.' }
    }

    redirect('/admin/rutas')
}

export async function actualizarRuta(rutaID: string, data: RutaFormData): Promise<{ error: string } | { warning: string } | void> {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Sesión no válida.' }

    if (!data.codigoRuta || !data.ciudadOrigen || !data.ciudadDestino
        || !data.terminalOrigen || !data.terminalDestino) {
        return { error: 'Completa todos los campos obligatorios.' }
    }
    if (data.ciudadOrigen.trim().toLowerCase() === data.ciudadDestino.trim().toLowerCase()) {
        return { error: 'La ciudad de origen y destino no pueden ser iguales.' }
    }
    if (data.distanciaKm <= 0) {
        return { error: 'La distancia debe ser mayor a 0 km.' }
    }
    if (data.tarifaBase <= 0) {
        return { error: 'La tarifa base debe ser mayor a $0.' }
    }
    if (data.tipoRuta === TipoRuta.CON_PARADAS && data.paradas.length === 0) {
        return { error: 'Una ruta CON PARADAS debe tener al menos una parada.' }
    }

    const duplicado = await prisma.ruta.findFirst({
        where: {
            rutaID: { not: rutaID },
            ciudadOrigen: data.ciudadOrigen.trim(),
            ciudadDestino: data.ciudadDestino.trim(),
        },
    })
    if (duplicado && !data.omitirDuplicado) {
        return { warning: `Ya existe la ruta ${duplicado.codigoRuta} con el mismo origen y destino. ¿Deseas guardar de todas formas?` }
    }

    try {
        await prisma.ruta.update({
            where: { rutaID },
            data: {
                codigoRuta: data.codigoRuta.toUpperCase().trim(),
                nombreRuta: `${data.ciudadOrigen} - ${data.ciudadDestino}`,
                ciudadOrigen: data.ciudadOrigen,
                ciudadDestino: data.ciudadDestino,
                terminalOrigen: data.terminalOrigen,
                terminalDestino: data.terminalDestino,
                distanciaKm: data.distanciaKm,
                tiempoEstimadoHrs: data.tiempoEstimadoHrs,
                tipoRuta: data.tipoRuta,
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

        await prisma.logAuditoria.create({
            data: {
                usuarioID: session.user.id,
                accion: 'ACTUALIZAR_RUTA',
                modulo: 'rutas',
                resultado: 'Exito',
                detalles: `Ruta actualizada: ${rutaID}`,
            },
        })
    } catch (e: unknown) {
        const err = e as { code?: string }
        if (err?.code === 'P2002') return { error: 'El código de ruta ya existe.' }
        return { error: 'Error al actualizar la ruta. Intenta de nuevo.' }
    }

    redirect('/admin/rutas')
}
