import { EstadoBoleto } from '@prisma/client'

export class Boleto {
    private boletoID: string
    private horarioID: string
    private clienteID: string | null
    private asiento: string
    private precio: number
    private codigoQR: string | null
    private estado: EstadoBoleto
    private fechaVenta: Date | null
    private transaccion: string | null

    constructor(
        boletoID: string,
        horarioID: string,
        asiento: string,
        precio: number,
        estado: EstadoBoleto = EstadoBoleto.DISPONIBLE,
        clienteID: string | null = null,
        codigoQR: string | null = null,
        fechaVenta: Date | null = null,
        transaccion: string | null = null
    ) {
        this.boletoID = boletoID
        this.horarioID = horarioID
        this.clienteID = clienteID
        this.asiento = asiento
        this.precio = precio
        this.codigoQR = codigoQR
        this.estado = estado
        this.fechaVenta = fechaVenta
        this.transaccion = transaccion
    }

    getBoletoID(): string { return this.boletoID }
    getHorarioID(): string { return this.horarioID }
    getClienteID(): string | null { return this.clienteID }
    getAsiento(): string { return this.asiento }
    getPrecio(): number { return this.precio }
    getCodigoQR(): string | null { return this.codigoQR }
    getEstado(): EstadoBoleto { return this.estado }
    getFechaVenta(): Date | null { return this.fechaVenta }
    getTransaccion(): string | null { return this.transaccion }

    generarCodigoQR(): string {
        const qr = `QR-${this.horarioID}-${this.asiento}-${this.boletoID}`
        this.codigoQR = qr
        return qr
    }

    emitir(clienteID: string, transaccion: string): void {
        this.clienteID = clienteID
        this.transaccion = transaccion
        this.estado = EstadoBoleto.VENDIDO
        this.fechaVenta = new Date()
        if (!this.codigoQR) this.generarCodigoQR()
    }

    cancelar(): void {
        this.estado = EstadoBoleto.CANCELADO
    }

    estaDisponible(): boolean {
        return this.estado === EstadoBoleto.DISPONIBLE
    }

    esValido(): boolean {
        return this.estado === EstadoBoleto.VENDIDO && this.codigoQR !== null
    }
}
