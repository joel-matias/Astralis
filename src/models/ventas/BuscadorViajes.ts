/**
 * CU4 — Venta de Boletos (POS)
 * Clase: BuscadorViajes
 *
 * Responsabilidades (diagrama):
 * - Buscar viajes por origen, destino, fecha y número de pasajeros
 * - Mostrar lista de resultados con horarios y precios
 *
 * Instanciado por: ModuloPOS
 */

import { Viaje } from '../shared/Viaje'

export class BuscadorViajes {
    private criterios: Map<string, unknown>

    constructor() {
        this.criterios = new Map()
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    getCriterios(): Map<string, unknown> { return this.criterios }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Busca viajes que coincidan con los criterios proporcionados.
     * Diagrama: + buscar(origen, destino, fecha, pax) : List<Viaje>
     */
    buscar(origen: string, destino: string, fecha: Date, pax: number): Viaje[] {
        this.criterios.set('origen', origen)
        this.criterios.set('destino', destino)
        this.criterios.set('fecha', fecha)
        this.criterios.set('pax', pax)
        // Implementación real: RepositorioViajes.findByODFP(origen, destino, fecha, pax)
        return []
    }

    /**
     * Muestra los resultados de búsqueda en la pantalla del POS.
     * Diagrama: + mostrarResultados() : void
     */
    mostrarResultados(): void {
        // Renderiza la lista en la UI del POS
    }
}
