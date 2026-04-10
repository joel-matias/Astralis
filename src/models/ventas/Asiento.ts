export class Asiento {
    private numero: string
    private disponible: boolean
    private reservadoHasta: Date | null

    constructor(
        numero: string,
        disponible: boolean = true,
        reservadoHasta: Date | null = null
    ) {
        this.numero = numero
        this.disponible = disponible
        this.reservadoHasta = reservadoHasta
    }

    getNumero(): string { return this.numero }
    isDisponible(): boolean { return this.disponible }
    getReservadoHasta(): Date | null { return this.reservadoHasta }

    // Bloqueo temporal por defecto de 5 minutos mientras se procesa el pago
    reservar(minutos: number = 5): void {
        this.disponible = false
        this.reservadoHasta = new Date(Date.now() + minutos * 60_000)
    }

    marcarOcupado(): void {
        this.disponible = false
        this.reservadoHasta = null
    }

    liberarReserva(): void {
        this.disponible = true
        this.reservadoHasta = null
    }

    tieneReservaVigente(): boolean {
        return !this.disponible && this.reservadoHasta !== null && this.reservadoHasta > new Date()
    }
}
