import { prisma } from '@/lib/prisma'
import { Autobus } from '@/models/flota/Autobus'
import { Mantenimiento } from '@/models/flota/Mantenimiento'
import { AsignacionAutobusViaje } from '@/models/flota/AsignacionAutobusViaje'
import { Viaje } from '@/models/flota/Viaje'
import { EstadoAutobus, TipoServicio } from '@prisma/client'

// D4, D5 — BaseDatos: abstracción de acceso a datos para el módulo Gestión de Flota
export class BaseDatos {

    // D4, D5 — persiste un nuevo autobús en la base de datos
    async guardarAutobus(autobus: Autobus): Promise<boolean> {
        try {
            await prisma.autobus.create({
                data: {
                    autobusID:         autobus.getAutobusID(),
                    numeroEconomico:   autobus.getNumeroEconomico(),
                    placas:            autobus.getPlacas(),
                    vin:               autobus.getVin(),
                    marca:             autobus.getMarca(),
                    modelo:            autobus.getModelo(),
                    anio:              autobus.getAnio(),
                    capacidadAsientos: autobus.getCapacidadAsientos(),
                    tipoServicio:      autobus.getTipoAutobus() as TipoServicio,
                    estadoOperativo:   autobus.getEstado(),
                    fechaRegistro:     autobus.getFechaRegistro(),
                },
            })
            return true
        } catch {
            return false
        }
    }

    // D4, D5 — actualiza los datos generales de un autobús existente
    async guardarCambios(autobus: Autobus): Promise<boolean> {
        try {
            await prisma.autobus.update({
                where: { autobusID: autobus.getAutobusID() },
                data: {
                    marca:             autobus.getMarca(),
                    modelo:            autobus.getModelo(),
                    capacidadAsientos: autobus.getCapacidadAsientos(),
                    tipoServicio:      autobus.getTipoAutobus() as TipoServicio,
                },
            })
            return true
        } catch {
            return false
        }
    }

    // D4, D5 — persiste un registro de mantenimiento
    async guardarMantenimiento(mto: Mantenimiento, autobusID: string): Promise<boolean> {
        try {
            await prisma.mantenimiento.create({
                data: {
                    mantenimientoID:     mto.getMantenimientoID(),
                    autobusID,
                    tipo:                mto.getTipo(),
                    fechaInicio:         mto.getFechaInicio(),
                    fechaFin:            mto.getFechaFin() ?? undefined,
                    kilometraje:         mto.getKilometraje(),
                    descripcionActividad: mto.getDescripcionActividad(),
                    responsable:         mto.getResponsable(),
                    refaccionesInsumos:  `${mto.getRefacciones()} | ${mto.getImportaciones()}`,
                    observaciones:       mto.getObservaciones() || undefined,
                    estaAbierto:         mto.esValidoAbrirlo(),
                },
            })
            return true
        } catch {
            return false
        }
    }

    // D5 — persiste una asignación autobús-viaje
    async guardarAsignacion(asig: AsignacionAutobusViaje, autobusID: string, horarioID: string, conductorID: string): Promise<boolean> {
        try {
            await prisma.asignacionAutobusViaje.create({
                data: {
                    asignacionID:    asig.getAsignacionID(),
                    autobusID,
                    horarioID,
                    conductorID,
                    fechaAsignacion: asig.getFechaAsignacion(),
                    observaciones:   asig.getObservaciones() || undefined,
                },
            })
            return true
        } catch {
            return false
        }
    }

    // D4, D5 — retorna lista de todos los autobuses registrados
    async obtenerAutobusesRegistrados(): Promise<Autobus[]> {
        const rows = await prisma.autobus.findMany({ orderBy: { fechaRegistro: 'desc' } })
        return rows.map(r => new Autobus(
            r.autobusID, r.numeroEconomico, r.placas, r.vin,
            r.marca, r.modelo, r.anio, r.capacidadAsientos,
            r.tipoServicio, r.estadoOperativo, r.fechaRegistro
        ))
    }

    // D4, D5 — retorna lista de autobuses disponibles para la fecha indicada
    async obtenerAutobusesDisponibles(fecha: Date): Promise<Autobus[]> {
        void fecha
        const rows = await prisma.autobus.findMany({
            where: { estadoOperativo: EstadoAutobus.DISPONIBLE },
            orderBy: { numeroEconomico: 'asc' },
        })
        return rows.map(r => new Autobus(
            r.autobusID, r.numeroEconomico, r.placas, r.vin,
            r.marca, r.modelo, r.anio, r.capacidadAsientos,
            r.tipoServicio, r.estadoOperativo, r.fechaRegistro
        ))
    }

    // D5 — retorna lista de conductores disponibles (estado ACTIVO y disponible = true)
    async obtenerConductoresDisponibles(): Promise<Array<{ conductorID: string; nombreCompleto: string }>> {
        return prisma.conductor.findMany({
            where: { estado: 'ACTIVO', disponible: true },
            select: { conductorID: true, nombreCompleto: true },
        })
    }

    // D4, D5 — verifica si el autobús tiene conflicto de horario con el viaje dado
    async verificarChoqueHorarioAutobus(autobus: Autobus, viaje: Viaje): Promise<boolean> {
        const conflicto = await prisma.asignacionAutobusViaje.findFirst({
            where: {
                autobusID: autobus.getAutobusID(),
                liberado: false,
                horario: {
                    fechaInicio: { lte: viaje.getFechaHoraSalida() },
                },
            },
        })
        return !!conflicto
    }

    // D3, D4, D5 — retorna true si ya existe otro autobús con las mismas placas, número económico o VIN
    async verificarDuplicado(placas: string, numEco: string, VIN: string): Promise<boolean> {
        const existente = await prisma.autobus.findFirst({
            where: {
                OR: [
                    { placas },
                    { numeroEconomico: numEco },
                    { vin: VIN },
                ],
            },
        })
        return !!existente
    }

    // D4, D5 — actualiza solo el estadoOperativo del autobús en la BD
    async actualizarEstadoAutobus(autobus: Autobus): Promise<boolean> {
        try {
            await prisma.autobus.update({
                where: { autobusID: autobus.getAutobusID() },
                data: { estadoOperativo: autobus.getEstado() },
            })
            return true
        } catch {
            return false
        }
    }
}
