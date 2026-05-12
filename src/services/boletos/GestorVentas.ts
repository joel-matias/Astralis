// D8 CU4 — paquete Logica de Negocio; orquesta el flujo completo de una venta
import { prisma } from '@/lib/prisma'
import { VentaRepository, type DatosCrearVenta, type BoletoCreado } from '@/repositories/boletos/VentaRepository'

export class GestorVentas {
    private repo = new VentaRepository()

    iniciarVenta(): void {}

    async confirmarVenta(datos: DatosCrearVenta): Promise<{ ventaID: string; transaccionId: string; boletos: BoletoCreado[] }> {
        try {
            const resultado = await this.repo.crearVenta(datos)

            await prisma.logAuditoria.create({
                data: {
                    usuarioID: datos.vendedorID,
                    accion:    'VENTA_BOLETO',
                    modulo:    'POS',
                    resultado: 'Exito',
                    detalles:  `Transacción ${resultado.transaccionId} · ${datos.asientos.length} boleto(s) · $${datos.precioUnitario * datos.asientos.length} MXN`,
                }
            })

            return resultado
        } catch (error) {
            await prisma.logAuditoria.create({
                data: {
                    usuarioID: datos.vendedorID,
                    accion:    'VENTA_BOLETO',
                    modulo:    'POS',
                    resultado: 'Fallo',
                    detalles:  error instanceof Error ? error.message : 'Error desconocido',
                }
            })
            throw error
        }
    }

    cancelarVenta(): void {}
}
