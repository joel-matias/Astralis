// D1 CU4 — Asiento físico del autobús; un Viaje contiene 1..* Asientos
export class Asiento {
    // D1: numero, disponible, reservadoHasta (DateTime)
    private numero: string
    private disponible: boolean
    private reservadoHasta: Date | null

    constructor(numero: string, disponible: boolean = true, reservadoHasta: Date | null = null) {
        this.numero = numero
        this.disponible = disponible
        this.reservadoHasta = reservadoHasta
    }

    getNumero(): string { return this.numero }
    isDisponible(): boolean { return this.disponible }
    getReservadoHasta(): Date | null { return this.reservadoHasta }

    // D1: reservar() pone disponible=false con tiempo límite de reserva
    reservar(hasta: Date): void {
        this.disponible = false
        this.reservadoHasta = hasta
    }

    // D1: marcarOcupado() confirma ocupación permanente (venta completada)
    marcarOcupado(): void {
        this.disponible = false
        this.reservadoHasta = null
    }

    // D1: liberar si la reserva expiró o fue cancelada
    liberarReserva(): void {
        this.disponible = true
        this.reservadoHasta = null
    }
}
