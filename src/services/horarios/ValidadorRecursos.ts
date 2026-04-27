// D6 CU3 — Verifica disponibilidad de autobús y conductor antes de programar un horario
import { prisma } from '@/lib/prisma'
import { Autobus, type TipoServicio, type EstadoOperativo } from '@/models/horarios/Autobus'
import { Conductor, type EstadoConductor } from '@/models/horarios/Conductor'

const ESTADO_AUTOBUS: Record<string, EstadoOperativo> = {
    DISPONIBLE:        'Disponible',
    ASIGNADO:          'EnServicio',
    EN_MANTENIMIENTO:  'Mantenimiento',
    FUERA_DE_SERVICIO: 'FueraDeServicio',
}

const ESTADO_CONDUCTOR: Record<string, EstadoConductor> = {
    ACTIVO:        'Activo',
    NO_DISPONIBLE: 'NoDisponible',
    INACTIVO:      'Inactivo',
}

const TIPO_SERVICIO: Record<string, TipoServicio> = {
    ECONOMICO: 'Economico',
    EJECUTIVO: 'Ejecutivo',
    LUJO:      'Lujo',
}

export class ValidadorRecursos {

    // D6: consulta BD para instanciar Autobus y Conductor, luego invoca sus métodos de dominio
    async validarDisponibilidadRecursos(
        autobusID: string,
        conductorID: string,
        fecha: Date,
        hora: Date,
        duracionHrs: number = 0
    ): Promise<boolean> {
        const [autobusData, conductorData] = await Promise.all([
            prisma.autobus.findUnique({ where: { autobusID } }),
            prisma.conductor.findUnique({ where: { conductorID } }),
        ])
        if (!autobusData || !conductorData) return false

        const autobus = new Autobus(
            autobusData.autobusID,
            autobusData.numeroEconomico,
            autobusData.marca,
            autobusData.modelo,
            autobusData.capacidadAsientos,
            TIPO_SERVICIO[autobusData.tipoServicio]      ?? 'Economico',
            ESTADO_AUTOBUS[autobusData.estadoOperativo]  ?? 'FueraDeServicio',
            autobusData.ultimoMantenimiento ?? new Date()
        )

        const conductor = new Conductor(
            conductorData.conductorID,
            conductorData.nombreCompleto,
            conductorData.numeroLicencia,
            conductorData.vigenciaLicencia,
            conductorData.numeroTelefonico ?? '',
            conductorData.disponible,
            Number(conductorData.horasAcumuladas),
            ESTADO_CONDUCTOR[conductorData.estado] ?? 'Inactivo'
        )

        // D6 paso 5.1 / 5.2 / 5.3 del diagrama de secuencia
        // horasAcumuladas no se actualiza al crear horarios, por lo que solo verificamos si ya excedió el límite
        return (
            autobus.estaDisponible(fecha, hora) &&
            conductor.tieneLicenciaVigente() &&
            !conductor.excededHoras(0)
        )
    }
}
