import { TipoRuta as PT, EstadoRuta as PE } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { Ruta, type TipoRuta, type EstadoRuta } from '@/models/rutas/Ruta'
import { ParadaIntermedia } from '@/models/rutas/ParadaIntermedia'

const MAP_TIPO: Record<TipoRuta, PT>   = { Directa: PT.DIRECTA, ConParadas: PT.CON_PARADAS }
const MAP_ESTADO: Record<EstadoRuta, PE> = { Activa: PE.ACTIVA, Inactiva: PE.INACTIVA }

export class RepositorioRutas {

    // D9: recupera una instancia completa de Ruta con sus ParadaIntermedia desde BD
    async findByID(rutaID: string): Promise<Ruta | null> {
        const data = await prisma.ruta.findUnique({
            where: { rutaID },
            include: { paradas: { orderBy: { ordenEnRuta: 'asc' } } },
        })
        if (!data) return null

        const paradas = data.paradas.map(p => new ParadaIntermedia(
            p.paradaID,
            p.rutaID,
            p.nombreParada,
            p.ciudad,
            p.ordenEnRuta,
            Number(p.distanciaDesdeOrigenKm),
            0,
            p.tiempoEsperaMin,
            Number(p.tarifaDesdeOrigen)
        ))

        return new Ruta(
            data.rutaID,
            data.codigoRuta,
            data.nombreRuta,
            data.ciudadOrigen,
            data.terminalOrigen,
            data.ciudadDestino,
            data.terminalDestino,
            Number(data.distanciaKm),
            Number(data.tiempoEstimadoHrs),
            data.tipoRuta === PT.CON_PARADAS ? 'ConParadas' : 'Directa',
            Number(data.tarifaBase),
            data.estado === PE.ACTIVA ? 'Activa' : 'Inactiva',
            data.creadoEn,
            paradas
        )
    }

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

    // Persiste una instancia de Ruta con sus paradas; usa los getters del modelo
    async guardarRuta(ruta: Ruta, usuarioID: string): Promise<{ codigoRuta: string; rutaID: string }> {
        const result = await prisma.ruta.create({
            data: {
                rutaID:           ruta.getRutaID(),
                codigoRuta:       ruta.getCodigoRuta().toUpperCase().trim(),
                nombreRuta:       ruta.getNombreRuta(),
                ciudadOrigen:     ruta.getCiudadOrigen(),
                terminalOrigen:   ruta.getTerminalOrigen(),
                ciudadDestino:    ruta.getCiudadDestino(),
                terminalDestino:  ruta.getTerminalDestino(),
                distanciaKm:      ruta.getDistanciaKm(),
                tiempoEstimadoHrs: ruta.getTiempoEstimadoHrs(),
                tipoRuta:         MAP_TIPO[ruta.getTipoRuta()],
                tarifaBase:       ruta.getTarifaBase(),
                estado:           MAP_ESTADO[ruta.getEstado()],
                creadoPorID:      usuarioID,
                paradas: {
                    create: ruta.getParadas().map(p => ({
                        nombreParada:           p.getNombreParada(),
                        ciudad:                 p.getCiudad(),
                        ordenEnRuta:            p.getOrdenEnRuta(),
                        distanciaDesdeOrigenKm: p.getDistanciaDesdeOrigen(),
                        tiempoEsperaMin:        p.getTiempoEsperaMin(),
                        tarifaDesdeOrigen:      p.getTarifaDesdeOrigen(),
                    })),
                },
            },
            select: { codigoRuta: true, rutaID: true },
        })
        return { codigoRuta: result.codigoRuta, rutaID: result.rutaID }
    }

    async contarRutas(): Promise<number> {
        return prisma.ruta.count()
    }

    async actualizarEstado(rutaID: string, estado: EstadoRuta): Promise<string> {
        const ruta = await prisma.ruta.update({
            where: { rutaID },
            data: { estado: MAP_ESTADO[estado] },
            select: { codigoRuta: true },
        })
        return ruta.codigoRuta
    }

    // Actualiza una ruta existente con la instancia de dominio Ruta; reemplaza sus paradas
    async actualizarRuta(rutaID: string, ruta: Ruta): Promise<void> {
        await prisma.ruta.update({
            where: { rutaID },
            data: {
                codigoRuta:       ruta.getCodigoRuta().toUpperCase().trim(),
                nombreRuta:       ruta.getNombreRuta(),
                ciudadOrigen:     ruta.getCiudadOrigen(),
                terminalOrigen:   ruta.getTerminalOrigen(),
                ciudadDestino:    ruta.getCiudadDestino(),
                terminalDestino:  ruta.getTerminalDestino(),
                distanciaKm:      ruta.getDistanciaKm(),
                tiempoEstimadoHrs: ruta.getTiempoEstimadoHrs(),
                tipoRuta:         MAP_TIPO[ruta.getTipoRuta()],
                tarifaBase:       ruta.getTarifaBase(),
                paradas: {
                    deleteMany: {},
                    create: ruta.getParadas().map(p => ({
                        nombreParada:           p.getNombreParada(),
                        ciudad:                 p.getCiudad(),
                        ordenEnRuta:            p.getOrdenEnRuta(),
                        distanciaDesdeOrigenKm: p.getDistanciaDesdeOrigen(),
                        tiempoEsperaMin:        p.getTiempoEsperaMin(),
                        tarifaDesdeOrigen:      p.getTarifaDesdeOrigen(),
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
