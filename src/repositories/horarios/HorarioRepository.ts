// D8 CU3 — Acceso a datos para la entidad Horario
import { FrecuenciaHorario as PF, VigenciaHorario as PV, EstadoHorario as PE } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { Horario, type FrecuenciaHorario, type VigenciaHorario, type EstadoHorario } from '@/models/horarios/Horario'

const mapFrecuencia: Record<string, PF> = { Unico: PF.UNICO, Diario: PF.DIARIO, Semanal: PF.SEMANAL }
const mapVigencia: Record<string, PV>   = { Definida: PV.DEFINIDA, Indefinida: PV.INDEFINIDA }
const mapEstado: Record<string, PE>     = { Activo: PE.ACTIVO, Cancelado: PE.CANCELADO, Completado: PE.COMPLETADO }

const mapFrecuenciaRev: Record<PF, FrecuenciaHorario> = { UNICO: 'Unico', DIARIO: 'Diario', SEMANAL: 'Semanal' }
const mapVigenciaRev: Record<PV, VigenciaHorario>     = { DEFINIDA: 'Definida', INDEFINIDA: 'Indefinida' }
const mapEstadoRev: Record<PE, EstadoHorario>         = { ACTIVO: 'Activo', CANCELADO: 'Cancelado', COMPLETADO: 'Completado' }

function toHorario(r: { horarioID: string; rutaID: string; autobusID: string; conductorID: string; fechaInicio: Date; horaSalida: Date; frecuencia: PF; vigencia: PV; precioBase: unknown; estado: PE }): Horario {
    return new Horario(
        r.horarioID,
        r.rutaID,
        r.autobusID,
        r.conductorID,
        r.fechaInicio,
        r.horaSalida,
        mapFrecuenciaRev[r.frecuencia],
        mapVigenciaRev[r.vigencia],
        Number(r.precioBase),
        mapEstadoRev[r.estado]
    )
}

export class HorarioRepository {

    async save(horario: Horario, programadoPorID: string, fechaFin?: Date): Promise<string> {
        const creado = await prisma.horario.create({
            data: {
                rutaID:          horario.getRutaID(),
                autobusID:       horario.getAutobusID(),
                conductorID:     horario.getConductorID(),
                programadoPorID,
                fechaInicio:     horario.getFechaInicio(),
                horaSalida:      horario.getHoraSalida(),
                frecuencia:      mapFrecuencia[horario.getFrecuencia()],
                vigencia:        mapVigencia[horario.getVigencia()],
                fechaFin:        fechaFin ?? null,
                precioBase:      horario.getPrecioBase(),
                estado:          mapEstado[horario.getEstado()],
            },
            select: { horarioID: true },
        })
        return creado.horarioID
    }

    async cancelar(horarioID: string): Promise<void> {
        await prisma.horario.update({
            where: { horarioID },
            data: { estado: PE.CANCELADO },
        })
    }

    async guardarLog(usuarioID: string, accion: string, detalles: string): Promise<void> {
        await prisma.logAuditoria.create({
            data: {
                usuarioID,
                accion,
                modulo: 'Horarios',
                resultado: 'Exito',
                detalles,
            },
        })
    }

    async findByRuta(rutaID: string): Promise<Horario[]> {
        const rows = await prisma.horario.findMany({
            where: { rutaID },
            orderBy: { fechaInicio: 'desc' },
        })
        return rows.map(toHorario)
    }

    async findConflictos(fecha: Date, hora: Date): Promise<Horario[]> {
        const rows = await prisma.horario.findMany({
            where: {
                fechaInicio: fecha,
                horaSalida: hora,
                estado: PE.ACTIVO,
            },
        })
        return rows.map(toHorario)
    }
}
