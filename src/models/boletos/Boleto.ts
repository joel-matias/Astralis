// D1 CU4 — Reescritura del stub de CU3; firma de emitir() simplificada (sin parámetros, estado interno)
// El stub de CU3 (horarios/Boleto.ts) tiene emitir(horarioID, asiento) — aquí el contexto ya está en el objeto
export type EstadoBoleto = 'Disponible' | 'Vendido' | 'Cancelado'

export class Boleto {
    // D1: idBoleto, codigoQR, precio (Double→number), estado
    private idBoleto: string
    private codigoQR: string
    private precio: number
    private estado: EstadoBoleto

    constructor(idBoleto: string, precio: number, estado: EstadoBoleto = 'Disponible') {
        this.idBoleto = idBoleto
        this.codigoQR = ''
        this.precio = precio
        this.estado = estado
    }

    getIdBoleto(): string { return this.idBoleto }
    getCodigoQR(): string { return this.codigoQR }
    getPrecio(): number { return this.precio }
    getEstado(): EstadoBoleto { return this.estado }

    // D1: genera código QR; formato heredado de CU3 → "QR-{idBoleto sin guión}"
    generarCodigoQR(): string {
        const idLimpio = this.idBoleto.replace(/-/g, '')
        this.codigoQR = `QR-${idLimpio}`
        return this.codigoQR
    }

    // D1: emitir() sin parámetros — el contexto de viajeID y asiento lo gestiona VentaService
    emitir(): void {
        this.estado = 'Vendido'
        this.generarCodigoQR()
    }

    cancelar(): void {
        this.estado = 'Cancelado'
    }

    estaDisponible(): boolean {
        return this.estado === 'Disponible'
    }
}
