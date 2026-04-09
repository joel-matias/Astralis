/**
 * CU4 — Venta de Boletos (POS)
 * Clase: ModuloPOS
 *
 * Responsabilidades (diagrama):
 * - Punto de entrada del vendedor al sistema de ventas
 * - Mostrar buscador de viajes disponibles con precio
 * - Mostrar mapa de asientos
 * - Calcular total de la venta
 * - Confirmar venta y generar boletos con QR
 * - Actualizar inventario
 *
 * Instancia: BuscadorViajes, MapaAsientos
 * Delega pago a: ProcesadorPago
 * Delega emisión a: EmisorBoletos
 * Delega fiscal a: GestorFiscal
 */

import { BuscadorViajes } from './BuscadorViajes'
import { MapaAsientos } from './MapaAsientos'
import { Asiento } from './Asiento'

export class ModuloPOS {

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Valida credenciales y habilita el módulo para el vendedor.
     * Diagrama: + acceder() : void
     */
    acceder(): void {
        // Verifica sesión activa del VendedorTaquilla
    }

    /**
     * Crea y retorna la instancia del buscador de viajes.
     * Diagrama: + mostrarBuscador() : BuscadorViajes
     */
    mostrarBuscador(): BuscadorViajes {
        return new BuscadorViajes()
    }

    /**
     * Calcula el total de la venta sumando los precios de los asientos seleccionados.
     * Diagrama: + calcularTotal(asientos: List) : Double
     */
    calcularTotal(asientos: Asiento[]): number {
        // En la implementación real cada Asiento conoce su precio via el Boleto
        void asientos
        return 0
    }

    /**
     * Muestra el mapa de asientos para el viaje seleccionado.
     * Diagrama (comunicación): mostrarMapa(idViaje) → MapaAsientos
     */
    mostrarMapaAsientos(idViaje: string): MapaAsientos {
        return new MapaAsientos(idViaje)
    }

    /**
     * Confirma la venta: genera boletos, procesa pago y emite comprobante.
     * Diagrama: + confirmarVenta() : void
     */
    confirmarVenta(): void {
        // Secuencia: ProcesadorPago → EmisorBoletos → GestorFiscal → LogVentas
    }
}
