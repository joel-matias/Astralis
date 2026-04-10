import { EstadoAnden } from '@prisma/client'

export class Anden {
    private andenID: string
    private numero: number
    private estado: EstadoAnden
    private capacidad: number
    private horarioDisponible: Date | null

    constructor(
        andenID: string,
        numero: number,
        capacidad: number,
        estado: EstadoAnden = EstadoAnden.DISPONIBLE,
        horarioDisponible: Date | null = null
    ) {
        this.andenID = andenID
        this.numero = numero
        this.capacidad = capacidad
        this.estado = estado
        this.horarioDisponible = horarioDisponible
    }

    getAndenID(): string { return this.andenID }
    getNumero(): number { return this.numero }
    getEstado(): EstadoAnden { return this.estado }
    getCapacidad(): number { return this.capacidad }
    getHorarioDisponible(): Date | null { return this.horarioDisponible }

    estaDisponible(): boolean {
        return this.estado === EstadoAnden.DISPONIBLE
    }

    actualizarEstado(estado: EstadoAnden): void {
        this.estado = estado
    }
}
