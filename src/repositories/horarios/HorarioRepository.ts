// D8 CU3 — Acceso a datos para la entidad Horario
import { FrecuenciaHorario as PF, VigenciaHorario as PV, EstadoHorario as PE } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { Horario } from '@/models/horarios/Horario'

const mapFrecuencia: Record<string, PF> = { Unico: PF.UNICO, Diario: PF.DIARIO, Semanal: PF.SEMANAL }
const mapVigencia: Record<string, PV>   = { Definida: PV.DEFINIDA, Indefinida: PV.INDEFINIDA }
const mapEstado: Record<string, PE>     = { Activo: PE.ACTIVO, Cancelado: PE.CANCELADO, Completado: PE.COMPLETADO }

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

    findByRuta(rutaID: string): Horario[] {
        void rutaID
        return []
    }

    findConflictos(fecha: Date, hora: Date): Horario[] {
        void fecha
        void hora
        return []
    }
}
