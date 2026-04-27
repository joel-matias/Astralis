'use server'

import { auth } from '@/auth'
import { BuscadorViajes } from '@/services/boletos/BuscadorViajes'
import { MapaAsientos } from '@/services/boletos/MapaAsientos'
import { GestorVentas } from '@/services/boletos/GestorVentas'
import type { ViajeData } from '@/repositories/boletos/ViajeRepository'
import type { AsientoData } from '@/repositories/boletos/AsientoRepository'

const buscador    = new BuscadorViajes()
const mapaService = new MapaAsientos()
const gestorVentas = new GestorVentas()

export async function buscarViajesAction(
    origen: string,
    destino: string,
    fechaStr: string,
    pax: number
): Promise<ViajeData[]> {
    const fecha = new Date(fechaStr)
    return buscador.buscarViajes({ origen, destino, fecha, pax })
}

export async function obtenerDestinosAction(origen: string): Promise<string[]> {
    return buscador.obtenerDestinos(origen)
}

export async function obtenerAsientosAction(horarioID: string): Promise<AsientoData[]> {
    return mapaService.obtenerMapa(horarioID)
}

export async function procesarVentaAction(datos: {
    horarioID: string
    clienteNombre: string
    clienteEmail?: string
    asientos: { asientoID: string; numero: string }[]
    precioUnitario: number
    metodoPago: 'TPV' | 'EFECTIVO'
    montoRecibido: number
}): Promise<{ ventaID: string; transaccionId: string; boletos: { id: string; qr: string; asiento: string }[] }> {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Sesión no válida')

    return gestorVentas.confirmarVenta({
        vendedorID:    session.user.id,
        horarioID:     datos.horarioID,
        clienteNombre: datos.clienteNombre,
        clienteEmail:  datos.clienteEmail,
        asientos:      datos.asientos,
        precioUnitario: datos.precioUnitario,
        metodoPago:    datos.metodoPago,
        montoRecibido: datos.montoRecibido,
    })
}
