// D7 CU4 — Búsqueda de viajes; buscarViajes(criterios) según D7
import type { Viaje } from '../../models/boletos/Viaje'
import { ViajeRepository, type ViajeData } from '@/repositories/boletos/ViajeRepository'

export class BuscadorViajes {
    criterios: Map<string, unknown> = new Map()
    private repo = new ViajeRepository()

    // D7: retorna lista de Viaje; lista vacía si no hay resultados (alt E1)
    async buscarViajes(criterios: Record<string, unknown>): Promise<ViajeData[]> {
        const { origen, destino, fecha, pax } = criterios as {
            origen: string; destino: string; fecha: Date; pax: number
        }
        return this.repo.buscarViajes(origen, destino, fecha, pax)
    }

    // D4: firma con parámetros explícitos — se mantiene para compatibilidad
    buscar(origen: string, destino: string, fecha: Date, pax: number): Viaje[] { return [] }

    mostrarResultados(): void {}

    async obtenerOrigenes(): Promise<string[]> {
        return this.repo.obtenerOrigenes()
    }

    async obtenerDestinos(origen: string): Promise<string[]> {
        return this.repo.obtenerDestinos(origen)
    }
}
