// D7 CU4 — Mapa de asientos; mostrarMapa(idViaje) y calcularTotal() añadidos respecto a D4
import type { Asiento } from '../../models/boletos/Asiento'
import { AsientoRepository, type AsientoData } from '@/repositories/boletos/AsientoRepository'

export class MapaAsientos {
    idViaje: string = ''
    private repo = new AsientoRepository()

    // D7: carga el mapa de asientos del horario indicado
    mostrarMapa(idViaje: string): void {
        this.idViaje = idViaje
    }

    // Implementación real: obtiene asientos con estado de ocupación desde BD
    async obtenerMapa(horarioID: string): Promise<AsientoData[]> {
        return this.repo.obtenerPorHorario(horarioID)
    }

    seleccionar(nums: string[]): Asiento[] { return [] }

    verificarDisponibilidad(): boolean { return false }

    reservarTemporalmente(minutos: number): void {}

    calcularTotal(numPasajeros: number, precioBase: number): number {
        return numPasajeros * precioBase
    }
}
