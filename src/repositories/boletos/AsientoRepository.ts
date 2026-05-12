// D5 CU4 — consulta y actualiza asientos por horario; consolida lógica de MapaAsientos
import { prisma } from '@/lib/prisma'

export interface AsientoData {
    asientoID: string
    numero: string
    ocupado: boolean
}

export class AsientoRepository {

    async obtenerPorHorario(horarioID: string): Promise<AsientoData[]> {
        const horario = await prisma.horario.findUnique({
            where: { horarioID },
            select: { autobusID: true },
        })
        if (!horario) return []

        const asientos = await prisma.asiento.findMany({
            where: { autobusID: horario.autobusID },
            select: {
                asientoID: true,
                numero:    true,
                reservadoHasta: true,
                boletos: {
                    where: { horarioID, estado: { not: 'CANCELADO' } },
                    select: { boletoID: true },
                },
            },
            orderBy: { numero: 'asc' },
        })
        const ahora = new Date()
        return asientos.map(a => ({
            asientoID: a.asientoID,
            numero:    a.numero,
            ocupado: a.boletos.length > 0 || (!!a.reservadoHasta && a.reservadoHasta > ahora),
        }))
    }
    //CU vender boleto: Paso 8 — RN7: bloquea asientos seleccionados por 5 minutos
    async bloquearTemporalmente(asientoIDs: string[], minutos: number = 5): Promise<void> {
        const reservadoHasta = new Date(Date.now() + minutos * 60 * 1000)
        await prisma.asiento.updateMany({
            where: { asientoID: { in: asientoIDs } },
            data: { reservadoHasta },
        })
    }

    async liberarBloqueo(asientoIDs: string[]): Promise<void> {
        await prisma.asiento.updateMany({
            where: { asientoID: { in: asientoIDs } },
            data: { reservadoHasta: null },
        })
    }
}
