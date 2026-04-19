import { TipoRuta, EstadoRuta } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { ParadaIntermedia } from '@/models/rutas/ParadaIntermedia'
import type { DatosParada } from '@/services/rutas/GestorParadas'

export interface DatosCompletos {
    codigoRuta: string
    nombreRuta: string
    ciudadOrigen: string
    terminalOrigen: string
    ciudadDestino: string
    terminalDestino: string
    distanciaKm: number
    tiempoEstimadoHrs: number
    tipoRuta: 'Directa' | 'ConParadas'
    tarifaBase: number
    estado: 'Activa' | 'Inactiva'
    paradas: ParadaIntermedia[]
    usuarioID: string
}

const mapTipoRuta: Record<'Directa' | 'ConParadas', TipoRuta> = {
    Directa: TipoRuta.DIRECTA,
    ConParadas: TipoRuta.CON_PARADAS,
}

const mapEstadoRuta: Record<'Activa' | 'Inactiva', EstadoRuta> = {
    Activa: EstadoRuta.ACTIVA,
    Inactiva: EstadoRuta.INACTIVA,
}

export class RepositorioRutas {
    async verificarDuplicado(origen: string, destino: string, excluirRutaID?: string): Promise<string | null> {
        const duplicado = await prisma.ruta.findFirst({
            where: {
                ciudadOrigen: origen.trim(),
                ciudadDestino: destino.trim(),
                ...(excluirRutaID ? { rutaID: { not: excluirRutaID } } : {}),
            },
            select: { codigoRuta: true },
        })
        return duplicado?.codigoRuta ?? null
    }

    async guardarRuta(datos: DatosCompletos): Promise<{ codigoRuta: string; rutaID: string }> {
        const ruta = await prisma.ruta.create({
            data: {
                codigoRuta: datos.codigoRuta.toUpperCase().trim(),
                nombreRuta: datos.nombreRuta,
                ciudadOrigen: datos.ciudadOrigen,
                terminalOrigen: datos.terminalOrigen,
                ciudadDestino: datos.ciudadDestino,
                terminalDestino: datos.terminalDestino,
                distanciaKm: datos.distanciaKm,
                tiempoEstimadoHrs: datos.tiempoEstimadoHrs,
                tipoRuta: mapTipoRuta[datos.tipoRuta],
                tarifaBase: datos.tarifaBase,
                estado: mapEstadoRuta[datos.estado],
                creadoPorID: datos.usuarioID,
                paradas: {
                    create: datos.paradas.map(p => ({
                        nombreParada: p.getNombreParada(),
                        ciudad: p.getCiudad(),
                        ordenEnRuta: p.getOrdenEnRuta(),
                        distanciaDesdeOrigenKm: p.getDistanciaDesdeOrigen(),
                        tiempoEsperaMin: p.getTiempoEsperaMin(),
                        tarifaDesdeOrigen: p.getTarifaDesdeOrigen(),
                    })),
                },
            },
            select: { codigoRuta: true, rutaID: true },
        })
        return { codigoRuta: ruta.codigoRuta, rutaID: ruta.rutaID }
    }

    async contarRutas(): Promise<number> {
        return prisma.ruta.count()
    }

    async actualizarEstado(rutaID: string, estado: 'Activa' | 'Inactiva'): Promise<string> {
        const ruta = await prisma.ruta.update({
            where: { rutaID },
            data: { estado: mapEstadoRuta[estado] },
            select: { codigoRuta: true },
        })
        return ruta.codigoRuta
    }

    async actualizarRuta(rutaID: string, datos: Omit<DatosCompletos, 'usuarioID'>): Promise<void> {
        await prisma.ruta.update({
            where: { rutaID },
            data: {
                codigoRuta: datos.codigoRuta.toUpperCase().trim(),
                nombreRuta: datos.nombreRuta,
                ciudadOrigen: datos.ciudadOrigen,
                terminalOrigen: datos.terminalOrigen,
                ciudadDestino: datos.ciudadDestino,
                terminalDestino: datos.terminalDestino,
                distanciaKm: datos.distanciaKm,
                tiempoEstimadoHrs: datos.tiempoEstimadoHrs,
                tipoRuta: mapTipoRuta[datos.tipoRuta],
                tarifaBase: datos.tarifaBase,
                paradas: {
                    deleteMany: {},
                    create: datos.paradas.map(p => ({
                        nombreParada: p.getNombreParada(),
                        ciudad: p.getCiudad(),
                        ordenEnRuta: p.getOrdenEnRuta(),
                        distanciaDesdeOrigenKm: p.getDistanciaDesdeOrigen(),
                        tiempoEsperaMin: p.getTiempoEsperaMin(),
                        tarifaDesdeOrigen: p.getTarifaDesdeOrigen(),
                    })),
                },
            },
        })
    }

    async registrarLog(usuarioID: string, accion: string, codigoRuta: string, fechaHora: Date): Promise<void> {
        await prisma.logAuditoria.create({
            data: {
                usuarioID,
                accion,
                modulo: 'rutas',
                resultado: 'Exito',
                detalles: `Ruta creada: ${codigoRuta}`,
                fechaHora,
            },
        })
    }
}
