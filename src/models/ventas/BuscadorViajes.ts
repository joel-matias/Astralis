import { Viaje } from '../shared/Viaje'

export class BuscadorViajes {
    private criterios: Map<string, unknown>

    constructor() {
        this.criterios = new Map()
    }

    getCriterios(): Map<string, unknown> { return this.criterios }

    buscar(origen: string, destino: string, fecha: Date, pax: number): Viaje[] {
        this.criterios.set('origen', origen)
        this.criterios.set('destino', destino)
        this.criterios.set('fecha', fecha)
        this.criterios.set('pax', pax)
        // Implementación real: RepositorioViajes.findByODFP(origen, destino, fecha, pax)
        return []
    }

    mostrarResultados(): void {
        // Renderiza la lista en la UI del POS
    }
}
