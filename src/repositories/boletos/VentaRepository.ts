// D5 CU4 — persiste Venta, Cliente y Boletos en una transacción atómica
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'
import { MetodoPago } from '@prisma/client'

export interface DatosCrearVenta {
    vendedorID: string
    horarioID: string
    clienteNombre: string
    clienteEmail?: string
    asientos: { asientoID: string; numero: string }[]
    precioUnitario: number
    metodoPago: 'TPV' | 'EFECTIVO'
    montoRecibido: number
}

export interface BoletoCreado {
    id: string
    qr: string
    asiento: string
}

const MAP_METODO: Record<string, MetodoPago> = {
    TPV: MetodoPago.TARJETA_DEBITO,
    EFECTIVO: MetodoPago.EFECTIVO,
}

export class VentaRepository {

    async crearVenta(datos: DatosCrearVenta): Promise<{ ventaID: string; transaccionId: string; boletos: BoletoCreado[] }> {
        const montoTotal   = datos.precioUnitario * datos.asientos.length
        const cambio       = datos.metodoPago === 'EFECTIVO' ? datos.montoRecibido - montoTotal : null
        const transaccionId = `TXN-${Date.now()}`

        const cliente = await prisma.cliente.create({
            data: { nombre: datos.clienteNombre, email: datos.clienteEmail },
            select: { clienteID: true },
        })

        const boletosInput = datos.asientos.map(a => {
            const boletoID = randomUUID()
            return {
                boletoID,
                horarioID:  datos.horarioID,
                clienteID:  cliente.clienteID,
                asientoID:  a.asientoID,
                precio:     datos.precioUnitario,
                codigoQR:   `QR-${boletoID.replace(/-/g, '')}`,
                estado:     'VENDIDO' as const,
                fechaVenta: new Date(),
                _numero:    a.numero,
            }
        })

        const venta = await prisma.venta.create({
            data: {
                vendedorID:      datos.vendedorID,
                metodoPago:      MAP_METODO[datos.metodoPago],
                montoTotal,
                cambioEntregado: cambio,
                idTransaccion:   transaccionId,
                estado:          'COMPLETADA',
                boletos: {
                    create: boletosInput.map(({ _numero: _, ...b }) => b),
                },
            },
            select: { ventaID: true },
        })

        return {
            ventaID: venta.ventaID,
            transaccionId,
            boletos: boletosInput.map(b => ({
                id:      b.boletoID,
                qr:      b.codigoQR,
                asiento: b._numero,
            })),
        }
    }
}
