// D9 CU4 — Consolida MapaAsientos + ValidadorAsientos (D8) en un solo componente; implementa IAsientos
import type { IAsientos } from './interfaces/IAsientos'
import type { Asiento } from '../../models/boletos/Asiento'

export class GestorAsientos implements IAsientos {
    // D9: consulta y actualiza Base de Datos según el diagrama de componentes
    mostrarMapa(idViaje: string): void {}
    seleccionar(nums: string[]): Asiento[] { return [] }
    verificarDisponibilidad(): boolean { return false }
    reservarTemporalmente(minutos: number): void {}
    calcularTotal(numPasajeros: number, precioBase: number): number { return numPasajeros * precioBase }
}
