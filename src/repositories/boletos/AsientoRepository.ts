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
                boletos: {
                    where: { horarioID, estado: { not: 'CANCELADO' } },
                    select: { boletoID: true },
                },
            },
            orderBy: { numero: 'asc' },
        })

        return asientos.map(a => ({
            asientoID: a.asientoID,
            numero:    a.numero,
            ocupado:   a.boletos.length > 0,
        }))
    }
}
