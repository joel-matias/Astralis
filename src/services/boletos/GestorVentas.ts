// D8 CU4 — paquete Logica de Negocio; orquesta el flujo completo de una venta
import { VentaRepository, type DatosCrearVenta, type BoletoCreado } from '@/repositories/boletos/VentaRepository'

export class GestorVentas {
    private repo = new VentaRepository()

    iniciarVenta(): void {}

    async confirmarVenta(datos: DatosCrearVenta): Promise<{ ventaID: string; transaccionId: string; boletos: BoletoCreado[] }> {
        return this.repo.crearVenta(datos)
    }

    cancelarVenta(): void {}
}
