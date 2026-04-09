/**
 * CU6 — Administración de Conductores
 * Clase: AsignacionConductorViaje
 *
 * Responsabilidades (diagrama M6CU):
 * - Vincular conductor con viaje programado
 * - Validar que no haya choques de horario
 * - Verificar estado activo del conductor
 * - Verificar vigencia de licencia
 * - Actualizar estado del conductor al asignar
 *
 * Colabora con: Conductor, Viaje, LogAuditoria
 */

import { Conductor } from './Conductor'
import { Viaje } from '../shared/Viaje'

export class AsignacionConductorViaje {
    private asignacionID: string
    private fechaAsignacion: Date
    private observaciones: string

    private conductor: Conductor | null
    private viaje: Viaje | null

    constructor(
        asignacionID: string,
        fechaAsignacion: Date = new Date(),
        observaciones: string = ''
    ) {
        this.asignacionID = asignacionID
        this.fechaAsignacion = fechaAsignacion
        this.observaciones = observaciones
        this.conductor = null
        this.viaje = null
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    getAsignacionID(): string { return this.asignacionID }
    getFechaAsignacion(): Date { return this.fechaAsignacion }
    getObservaciones(): string { return this.observaciones }
    getConductor(): Conductor | null { return this.conductor }
    getViaje(): Viaje | null { return this.viaje }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Vincula el conductor con el viaje validando estado y licencia.
     * Diagrama M6CU: + crearAsignacion(conductor, viaje) : Boolean
     */
    crearAsignacion(conductor: Conductor, viaje: Viaje): boolean {
        if (!conductor.esActivo()) return false
        if (!conductor.verificarLicenciaVigente()) return false
        if (!viaje.estaProgramado()) return false
        this.conductor = conductor
        this.viaje = viaje
        return true
    }

    /**
     * Verifica que el conductor no tenga otro viaje en el mismo horario.
     * Diagrama M6CU: + validarChoqueHorario() : Boolean
     */
    validarChoqueHorario(): boolean {
        // Implementación real: BaseDatos.verificarChoqueHorario(conductor, viaje)
        return true
    }

    /**
     * Verifica que el conductor sea apto (activo + licencia vigente).
     * Diagrama M6CU: + validarConductorApto() : Boolean
     */
    validarConductorApto(): boolean {
        return (
            this.conductor !== null &&
            this.conductor.esActivo() &&
            this.conductor.verificarLicenciaVigente()
        )
    }

    /**
     * Libera al conductor y elimina la asignación al finalizar el viaje.
     * Diagrama M6CU: + liberar() : Boolean
     */
    liberar(): boolean {
        if (!this.conductor) return false
        this.conductor.establecerEstadoActivo()
        this.conductor = null
        this.viaje = null
        return true
    }
}
