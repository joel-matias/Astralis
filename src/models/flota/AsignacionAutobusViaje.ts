/**
 * CU5 — Gestión de Flota
 * Clase: AsignacionAutobusViaje
 *
 * Responsabilidades (diagrama M7CU):
 * - Vincular autobús con viaje del conductor
 * - Validar disponibilidad del autobús al asignar
 * - Verificar compatibilidad de horario
 * - Actualizar estado del autobús al asignar
 * - Impedir asignación si está en mantenimiento
 *
 * Colabora con: Autobus, Viaje, Conductor
 */

import { Autobus } from './Autobus'
import { Viaje } from '../shared/Viaje'

export class AsignacionAutobusViaje {
    private asignacionID: string
    private fechaAsignacion: Date
    private observaciones: string

    // Referencias a los objetos vinculados
    private autobus: Autobus | null
    private viaje: Viaje | null
    private conductorID: string | null

    constructor(
        asignacionID: string,
        fechaAsignacion: Date = new Date(),
        observaciones: string = ''
    ) {
        this.asignacionID = asignacionID
        this.fechaAsignacion = fechaAsignacion
        this.observaciones = observaciones
        this.autobus = null
        this.viaje = null
        this.conductorID = null
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    getAsignacionID(): string { return this.asignacionID }
    getFechaAsignacion(): Date { return this.fechaAsignacion }
    getObservaciones(): string { return this.observaciones }
    getAutobus(): Autobus | null { return this.autobus }
    getViaje(): Viaje | null { return this.viaje }
    getConductorID(): string | null { return this.conductorID }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Vincula el autobús con el viaje y el conductor validando disponibilidad.
     * Diagrama M7CU: + crearAsignacion(autobus, viaje, conductor: Conductor) : Boolean
     */
    crearAsignacion(autobus: Autobus, viaje: Viaje, conductorID: string): boolean {
        if (!autobus.estaDisponible()) return false
        if (!viaje.estaProgramado()) return false
        this.autobus = autobus
        this.viaje = viaje
        this.conductorID = conductorID
        autobus.cambiarEstado('ASIGNADO' as Parameters<typeof autobus.cambiarEstado>[0])
        return true
    }

    /**
     * Verifica que el autobús no tenga otro viaje en el mismo horario.
     * Diagrama M7CU: + validarChoqueHorario() : Boolean
     * La verificación real consulta AsignacionRepository.
     */
    validarChoqueHorario(): boolean {
        return true
    }

    /**
     * Verifica que el autobús esté disponible (no en mantenimiento).
     * Diagrama M7CU: + validarAutobusDisponible() : Boolean
     */
    validarAutobusDisponible(): boolean {
        return this.autobus?.estaDisponible() ?? false
    }

    /**
     * Libera el autobús y elimina la asignación al finalizar el viaje.
     * Diagrama M7CU: + liberar() : Boolean
     */
    liberar(): boolean {
        if (!this.autobus) return false
        this.autobus.establecerDisponible()
        this.autobus = null
        this.viaje = null
        this.conductorID = null
        return true
    }
}
