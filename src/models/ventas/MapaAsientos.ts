import { Asiento } from './Asiento'

export class MapaAsientos {
    private idViaje: string

    constructor(idViaje: string) {
        this.idViaje = idViaje
    }

    getIdViaje(): string { return this.idViaje }

    mostrar(): void {
        // Renderiza el mapa de asientos con su estado actual
    }

    seleccionar(nums: string[]): Asiento[] {
        return nums.map(n => new Asiento(n))
    }

    // Implementación real: consulta MapaAsientosRepository
    verificarDisponibilidad(): boolean {
        return true
    }

    reservarTemporalmente(minutos: number): void {
        // Asiento.reservar(minutos) por cada asiento seleccionado
        void minutos
    }
}
