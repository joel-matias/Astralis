/**
 * CU4 — Venta de Boletos (POS)
 * Clase: MapaAsientos
 *
 * Responsabilidades (diagrama):
 * - Mostrar mapa gráfico de asientos del viaje
 * - Permitir selección de asientos disponibles
 * - Verificar disponibilidad antes de reservar
 * - Reservar asientos temporalmente (5 min)
 *
 * Instanciado por: ModuloPOS
 */

import { Asiento } from './Asiento'

export class MapaAsientos {
    private idViaje: string

    constructor(idViaje: string) {
        this.idViaje = idViaje
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    getIdViaje(): string { return this.idViaje }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Muestra el mapa gráfico de asientos en la pantalla del POS.
     * Diagrama: + mostrar() : void
     */
    mostrar(): void {
        // Renderiza el mapa de asientos con su estado actual
    }

    /**
     * Devuelve los objetos Asiento correspondientes a los números seleccionados.
     * Diagrama: + seleccionar(nums: List) : List<Asiento>
     */
    seleccionar(nums: string[]): Asiento[] {
        return nums.map(n => new Asiento(n))
    }

    /**
     * Verifica que todos los asientos seleccionados estén disponibles.
     * Diagrama: + verificarDisponibilidad() : Boolean
     */
    verificarDisponibilidad(): boolean {
        // Implementación real: consulta MapaAsientosRepository
        return true
    }

    /**
     * Reserva los asientos temporalmente por N minutos mientras se procesa el pago.
     * Diagrama: + reservarTemporalmente(minutos: Integer) : void
     */
    reservarTemporalmente(minutos: number): void {
        // Asiento.reservar(minutos) por cada asiento seleccionado
        void minutos
    }
}
