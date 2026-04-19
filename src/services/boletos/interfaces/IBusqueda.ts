// D9 CU4 — Contrato que debe implementar BuscadorViajes para comunicarse con GestorVentas
import type { Viaje } from '../../../models/boletos/Viaje'

export interface IBusqueda {
    buscarViajes(criterios: Record<string, unknown>): Viaje[]
    mostrarResultados(): void
}
