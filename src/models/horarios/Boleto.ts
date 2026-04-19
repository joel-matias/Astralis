// D1 CU3 — Boleto generado al confirmar un horario; la lógica completa de venta es CU4
export type EstadoBoleto = 'Disponible' | 'Vendido' | 'Cancelado'

export class Boleto {
    private boletoID: string
    private horarioID: string
    private clienteID: string
    private asiento: string
    private precio: number
    private codigoQR: string
    private estado: EstadoBoleto
    private fechaVenta: Date

    constructor(
        boletoID: string,
        horarioID: string,
        clienteID: string,
        asiento: string,
        precio: number,
        codigoQR: string,
        estado: EstadoBoleto = 'Disponible',
        fechaVenta: Date = new Date()
    ) {
        this.boletoID = boletoID
        this.horarioID = horarioID
        this.clienteID = clienteID
        this.asiento = asiento
        this.precio = precio
        this.codigoQR = codigoQR
        this.estado = estado
        this.fechaVenta = fechaVenta
    }

    getBoletoID(): string { return this.boletoID }
    getHorarioID(): string { return this.horarioID }
    getClienteID(): string { return this.clienteID }
    getAsiento(): string { return this.asiento }
    getPrecio(): number { return this.precio }
    getCodigoQR(): string { return this.codigoQR }
    getEstado(): EstadoBoleto { return this.estado }
    getFechaVenta(): Date { return this.fechaVenta }

    // D4: recibe horarioID y asiento al momento de emitir; la lógica de cobro y cliente es CU4
    emitir(horarioID: string, asiento: string): void {
        this.horarioID = horarioID
        this.asiento = asiento
        this.estado = 'Vendido'
        this.fechaVenta = new Date()
    }

    // D4: formato QR basado en D3 → "QR-{horarioID sin guión}-{asiento}"
    generarCodigoQR(): string {
        const idLimpio = this.horarioID.replace(/-/g, '')
        this.codigoQR = `QR-${idLimpio}-${this.asiento}`
        return this.codigoQR
    }

    cancelar(): void {
        this.estado = 'Cancelado'
    }

    estaDisponible(): boolean {
        return this.estado === 'Disponible'
    }
}
