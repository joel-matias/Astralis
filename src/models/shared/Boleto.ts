/**
 * Clase compartida — Boleto
 * Referenciada en: CU3 (Horarios — generación), CU4 (Ventas — emisión),
 *                  CU8 (Equipaje — validación)
 *
 * Responsabilidades (diagramas CU3/CU4/CU8):
 * - Representar cada asiento disponible para venta (CU3)
 * - Asociarse a un horario y a un cliente (CU3)
 * - Generar código QR único para validación (CU4)
 * - Cambiar estado Disponible → Vendido → Cancelado (CU3)
 * - Validar que el pasajero tenga boleto activo (CU8)
 */

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

    // ── Getters ──────────────────────────────────────────────────────────────
    getBoletoID(): string { return this.boletoID }
    getHorarioID(): string { return this.horarioID }
    getClienteID(): string | null { return this.clienteID }
    getAsiento(): string { return this.asiento }
    getPrecio(): number { return this.precio }
    getCodigoQR(): string | null { return this.codigoQR }
    getEstado(): EstadoBoleto { return this.estado }
    getFechaVenta(): Date | null { return this.fechaVenta }
    getTransaccion(): string | null { return this.transaccion }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Genera un código QR único para este boleto.
     * Diagrama CU4: + generarCodigoQR() : String
     */
    generarCodigoQR(): string {
        const qr = `QR-${this.horarioID}-${this.asiento}-${this.boletoID}`
        this.codigoQR = qr
        return qr
    }

    /**
     * Emite el boleto asignándolo al cliente y marcándolo como vendido.
     * Diagrama CU3: + emitir() : void
     * Diagrama CU4: + emitir(horarioID, asiento) : void
     */
    emitir(clienteID: string, transaccion: string): void {
        this.clienteID = clienteID
        this.transaccion = transaccion
        this.estado = EstadoBoleto.VENDIDO
        this.fechaVenta = new Date()
        if (!this.codigoQR) this.generarCodigoQR()
    }

    /**
     * Cancela el boleto liberando el asiento.
     * Diagrama CU3/CU4: + cancelar() : void
     */
    cancelar(): void {
        this.estado = EstadoBoleto.CANCELADO
    }

    /**
     * Verifica si el asiento aún está disponible para compra.
     * Diagrama CU3: + estaDisponible() : Boolean
     */
    estaDisponible(): boolean {
        return this.estado === EstadoBoleto.DISPONIBLE
    }

    /**
     * Valida que el boleto esté activo (no cancelado ni vencido).
     * Diagrama CU8: + esValido() : Boolean
     */
    esValido(): boolean {
        return this.estado === EstadoBoleto.VENDIDO && this.codigoQR !== null
    }
}
