export class Viaje {
    private viajeID: string
    private rutaID: string
    private origen: string
    private destino: string
    private fechaHoraSalida: Date
    private duracionEstimada: number     // minutos
    private precioBase: number
    private estado: string               // 'Activo' | 'Programado' | 'Cancelado' | 'Completado'

    constructor(
        viajeID: string,
        rutaID: string,
        origen: string,
        destino: string,
        fechaHoraSalida: Date,
        duracionEstimada: number,
        precioBase: number,
        estado: string = 'Programado'
    ) {
        this.viajeID = viajeID
        this.rutaID = rutaID
        this.origen = origen
        this.destino = destino
        this.fechaHoraSalida = fechaHoraSalida
        this.duracionEstimada = duracionEstimada
        this.precioBase = precioBase
        this.estado = estado
    }

    getViajeID(): string { return this.viajeID }
    getRutaID(): string { return this.rutaID }
    getOrigen(): string { return this.origen }
    getDestino(): string { return this.destino }
    getFechaHoraSalida(): Date { return this.fechaHoraSalida }
    getDuracionEstimada(): number { return this.duracionEstimada }
    getPrecioBase(): number { return this.precioBase }
    getEstado(): string { return this.estado }

    buscarDisponibilidad(): boolean {
        return this.estado === 'Programado' || this.estado === 'Activo'
    }

    calcularTotal(numPasajeros: number): number {
        return +(this.precioBase * numPasajeros).toFixed(2)
    }

    obtenerInfoViaje(): Record<string, unknown> {
        return {
            viajeID: this.viajeID,
            rutaID: this.rutaID,
            origen: this.origen,
            destino: this.destino,
            fechaHoraSalida: this.fechaHoraSalida,
            duracionEstimada: this.duracionEstimada,
            precioBase: this.precioBase,
            estado: this.estado,
        }
    }

    estaActivo(): boolean {
        return this.estado === 'Activo'
    }

    estaProgramado(): boolean {
        return this.estado === 'Programado' && this.fechaHoraSalida > new Date()
    }

    // Implementación real: RepositorioViajes.getPasajerosByViaje(this.viajeID)
    obtenerPasajeros(): string[] {
        return []
    }
}
