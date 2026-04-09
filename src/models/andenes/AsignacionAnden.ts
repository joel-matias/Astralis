/**
 * CU7 — Control de Andenes
 * Clase: AsignacionAnden  (nombrada "Asignacion" en el diagrama)
 *
 * Responsabilidades (diagrama):
 * - Asociar un autobús a un andén
 * - Guardar la asignación en la base de datos
 * - Validar disponibilidad del andén
 * - Permitir su cancelación
 *
 * Asigna: Autobus (1)
 * Ocupa: Anden (1)
 * Genera: LogAuditoria (1)
 */

import { EstadoAsignacion } from '@prisma/client'
import { Anden } from './Anden'
import { Autobus } from '../flota/Autobus'
import { Viaje } from '../shared/Viaje'

export class AsignacionAnden {
    private asignacionID: string
    private fechaHora: Date
    private estado: EstadoAsignacion

    private anden: Anden | null
    private autobus: Autobus | null
    private viaje: Viaje | null

    constructor(
        asignacionID: string,
        fechaHora: Date = new Date(),
        estado: EstadoAsignacion = EstadoAsignacion.RESERVADO
    ) {
        this.asignacionID = asignacionID
        this.fechaHora = fechaHora
        this.estado = estado
        this.anden = null
        this.autobus = null
        this.viaje = null
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    getAsignacionID(): string { return this.asignacionID }
    getFechaHora(): Date { return this.fechaHora }
    getEstado(): EstadoAsignacion { return this.estado }
    getAnden(): Anden | null { return this.anden }
    getAutobus(): Autobus | null { return this.autobus }
    getViaje(): Viaje | null { return this.viaje }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Persiste la asignación en la base de datos y actualiza el estado del andén.
     * Diagrama: + guardar() : void
     */
    guardar(): void {
        if (this.anden) {
            this.anden.actualizarEstado('RESERVADO' as Parameters<typeof this.anden.actualizarEstado>[0])
        }
        this.estado = EstadoAsignacion.RESERVADO
        // RepositorioAndenes.persistirAsignacion(this)
    }

    /**
     * Cancela la asignación y libera el andén.
     * Diagrama: + cancelar() : void
     */
    cancelar(): void {
        if (this.anden) {
            this.anden.actualizarEstado('DISPONIBLE' as Parameters<typeof this.anden.actualizarEstado>[0])
        }
        this.estado = EstadoAsignacion.LIBERADO
    }

    /**
     * Verifica que el andén seleccionado esté disponible antes de asignar.
     * Diagrama: + validarDisponibilidad() : void
     */
    validarDisponibilidad(): boolean {
        return this.anden?.estaDisponible() ?? false
    }

    /**
     * Configura los objetos que participan en la asignación.
     */
    configurar(anden: Anden, autobus: Autobus, viaje: Viaje): boolean {
        if (!anden.estaDisponible()) return false
        if (!viaje.estaProgramado()) return false
        this.anden = anden
        this.autobus = autobus
        this.viaje = viaje
        return true
    }
}
