// D1 CU4 — Proyección de Horario+Ruta expuesta al POS; distinto de Horario en CU3
export class Viaje {
    // D1: idViaje, origen, destino, fecha (Date), horario (Time→string HH:mm), precioBase (Double→number)
    private idViaje: string
    private origen: string
    private destino: string
    private fecha: Date
    private horario: string
    private precioBase: number

    constructor(
        idViaje: string,
        origen: string,
        destino: string,
        fecha: Date,
        horario: string,
        precioBase: number
    ) {
        this.idViaje = idViaje
        this.origen = origen
        this.destino = destino
        this.fecha = fecha
        this.horario = horario
        this.precioBase = precioBase
    }

    getIdViaje(): string { return this.idViaje }
    getOrigen(): string { return this.origen }
    getDestino(): string { return this.destino }
    getFecha(): Date { return this.fecha }
    getHorario(): string { return this.horario }
    getPrecioBase(): number { return this.precioBase }

    // D1: stubs — lógica real depende de consulta a BD (asientos libres)
    buscarDisponibilidad(): boolean { return false }
    calcularTotal(numPasajeros: number): number { return this.precioBase * numPasajeros }
}
