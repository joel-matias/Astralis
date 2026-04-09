/**
 * CU7 — Control de Andenes
 * Clase: Anden
 *
 * Responsabilidades (diagrama):
 * - Indicar su disponibilidad
 * - Actualizarse a Reservado u Ocupado
 * - Asociarse a un horario específico
 * - Permitir su selección para asignación
 *
 * Estado: Disponible → Reservado → Ocupado → Disponible
 */

import { EstadoAnden } from '@prisma/client'

export class Anden {
    private andenID: string
    private numero: number
    private estado: EstadoAnden
    private capacidad: number
    private horarioDisponible: Date | null

    constructor(
        andenID: string,
        numero: number,
        capacidad: number,
        estado: EstadoAnden = EstadoAnden.DISPONIBLE,
        horarioDisponible: Date | null = null
    ) {
        this.andenID = andenID
        this.numero = numero
        this.capacidad = capacidad
        this.estado = estado
        this.horarioDisponible = horarioDisponible
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    getAndenID(): string { return this.andenID }
    getNumero(): number { return this.numero }
    getEstado(): EstadoAnden { return this.estado }
    getCapacidad(): number { return this.capacidad }
    getHorarioDisponible(): Date | null { return this.horarioDisponible }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Verifica si el andén está disponible para ser asignado.
     * Diagrama: + estaDisponible() : Boolean
     */
    estaDisponible(): boolean {
        return this.estado === EstadoAnden.DISPONIBLE
    }

    /**
     * Actualiza el estado del andén (Reservado, Ocupado, Disponible).
     * Diagrama: + actualizarEstado(estado: String) : void
     */
    actualizarEstado(estado: EstadoAnden): void {
        this.estado = estado
    }
}
