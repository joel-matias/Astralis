// D9 CU4 — Contrato que debe implementar GestorAsientos para comunicarse con GestorVentas
import type { Asiento } from '../../../models/boletos/Asiento'

export interface IAsientos {
    mostrarMapa(idViaje: string): void
    seleccionar(nums: string[]): Asiento[]
    verificarDisponibilidad(): boolean
    reservarTemporalmente(minutos: number): void
}
