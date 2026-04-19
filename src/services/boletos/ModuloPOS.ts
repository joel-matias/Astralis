// D4 CU4 — Orquestador del POS; métodos reducidos y más abstractos respecto a D3
// Discrepancia D2 vs D3: D2 nombra este rol "SistemaVentas"; D3/D4 lo llaman "ModuloPOS"
import type { BuscadorViajes } from './BuscadorViajes'
import type { Asiento } from '../../models/boletos/Asiento'

export class ModuloPOS {
    // D4: acceder al módulo POS
    acceder(): void {}

    // D4: navega hacia BuscadorViajes y lo retorna
    mostrarBuscador(): BuscadorViajes {
        return null as unknown as BuscadorViajes
    }

    // D4: calcula el total a partir de la lista de asientos seleccionados (Double→number)
    calcularTotal(asientos: Asiento[]): number { return 0 }

    // D4: confirma y ejecuta la venta completa
    confirmarVenta(): void {}
}
