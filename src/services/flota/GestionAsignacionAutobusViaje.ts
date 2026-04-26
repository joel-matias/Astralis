import { prisma } from '@/lib/prisma'
import { Autobus } from '@/models/flota/Autobus'
import { Viaje } from '@/models/flota/Viaje'
import { Conductor } from '@/models/flota/Conductor'
import { AsignacionAutobusViaje } from '@/models/flota/AsignacionAutobusViaje'
import { BaseDatos } from './BaseDatos'
import { AuditoriaService } from './AuditoriaService'
import { EstadoAutobus } from '@prisma/client'
import { randomUUID } from 'crypto'

export type ResultadoAsignacion =
    | { exito: true; asignacionID: string }
    | { exito: false; motivo: 'autobus_no_encontrado' | 'horario_no_encontrado' | 'conductor_no_encontrado' | 'autobus_no_disponible' | 'conductor_no_activo' | 'choque_horario' | 'en_mantenimiento' | 'error_bd' }

export type ResultadoLiberacion =
    | { exito: true }
    | { exito: false; motivo: 'no_encontrado' | 'ya_liberada' | 'error_bd' }

// D8: NegAsig — Gestión Asignación Autobús Viaje
// D2, D4, D5 — vincula autobús con viaje y conductor; valida reglas de disponibilidad y horario
export class GestionAsignacionAutobusViaje {
    private bd = new BaseDatos()
    private auditoria = new AuditoriaService()

    // D4, D2 — asigna un autobús a un horario/viaje con el conductor indicado
    async asignarAutobusAViaje(autobusID: string, horarioID: string, conductorID: string, observaciones: string, usuarioEmail: string): Promise<ResultadoAsignacion> {
        const [regBus, regHorario, regConductor] = await Promise.all([
            prisma.autobus.findUnique({ where: { autobusID } }),
            prisma.horario.findUnique({ where: { horarioID }, include: { ruta: true } }),
            prisma.conductor.findUnique({ where: { conductorID } }),
        ])

        if (!regBus) return { exito: false, motivo: 'autobus_no_encontrado' }
        if (!regHorario) return { exito: false, motivo: 'horario_no_encontrado' }
        if (!regConductor) return { exito: false, motivo: 'conductor_no_encontrado' }

        // D2 — verificar estado activo del autobús
        if (regBus.estadoOperativo !== EstadoAutobus.DISPONIBLE) {
            if (regBus.estadoOperativo === EstadoAutobus.EN_MANTENIMIENTO) {
                return { exito: false, motivo: 'en_mantenimiento' }
            }
            return { exito: false, motivo: 'autobus_no_disponible' }
        }

        // D2 — verificar conductor activo
        if (regConductor.estado !== 'ACTIVO' || !regConductor.disponible) {
            return { exito: false, motivo: 'conductor_no_activo' }
        }

        const bus = new Autobus(
            regBus.autobusID, regBus.numeroEconomico, regBus.placas, regBus.vin,
            regBus.marca, regBus.modelo, regBus.anio, regBus.capacidadAsientos,
            regBus.tipoServicio, regBus.estadoOperativo, regBus.fechaRegistro,
        )
        const viaje = new Viaje(
            0, 0,
            regHorario.fechaInicio,
            regHorario.fechaFin ?? regHorario.fechaInicio,
            0, 'Programado'
        )
        const conductor = new Conductor(0, regConductor.nombreCompleto, regConductor.curp, regConductor.estado)

        // D2, D4 — verificar compatibilidad de horario (choque)
        const hayChoque = await this.bd.verificarChoqueHorarioAutobus(bus, viaje)
        if (hayChoque) return { exito: false, motivo: 'choque_horario' }

        const asignacionID = randomUUID()
        const asignacion = new AsignacionAutobusViaje(asignacionID, new Date(), observaciones)
        const ok = asignacion.crearAsignacion(bus, viaje, conductor)
        if (!ok) return { exito: false, motivo: 'autobus_no_disponible' }

        const guardado = await this.bd.guardarAsignacion(asignacion, autobusID, horarioID, conductorID)
        if (!guardado) return { exito: false, motivo: 'error_bd' }

        // D2 — actualiza estado del autobús al asignar
        await prisma.autobus.update({
            where: { autobusID },
            data: { estadoOperativo: EstadoAutobus.ASIGNADO },
        })

        await this.auditoria.registrarEvento(
            usuarioEmail,
            'Asignación autobús-viaje',
            `Bus ${regBus.numeroEconomico} → horario ${horarioID}`
        )

        return { exito: true, asignacionID }
    }

    // D4 — libera el autobús al finalizar el viaje; estado → DISPONIBLE
    async liberarAutobus(asignacionID: string, usuarioEmail: string): Promise<ResultadoLiberacion> {
        const registro = await prisma.asignacionAutobusViaje.findUnique({
            where: { asignacionID },
            include: { autobus: true },
        })
        if (!registro) return { exito: false, motivo: 'no_encontrado' }
        if (registro.liberado) return { exito: false, motivo: 'ya_liberada' }

        await prisma.asignacionAutobusViaje.update({
            where: { asignacionID },
            data: { liberado: true, fechaLiberacion: new Date() },
        })

        await prisma.autobus.update({
            where: { autobusID: registro.autobusID },
            data: { estadoOperativo: EstadoAutobus.DISPONIBLE },
        })

        await this.auditoria.registrarEvento(
            usuarioEmail,
            'Liberación autobús',
            `Bus ${registro.autobus.numeroEconomico} liberado de asignación ${asignacionID}`
        )

        return { exito: true }
    }
}
