// repository::rutas — ParadaRepository: persistencia de paradas intermedias independiente de la ruta
import { prisma } from '@/lib/prisma'
import type { ParadaIntermedia } from '@/models/rutas/ParadaIntermedia'

export class RepositorioParadas {

    async saveAll(rutaID: string, paradas: ParadaIntermedia[]): Promise<void> {
        await prisma.paradaIntermedia.createMany({
            data: paradas.map(p => ({
                rutaID,
                nombreParada: p.getNombreParada(),
                ciudad: p.getCiudad(),
                ordenEnRuta: p.getOrdenEnRuta(),
                distanciaDesdeOrigenKm: p.getDistanciaDesdeOrigen(),
                tiempoEsperaMin: p.getTiempoEsperaMin(),
                tarifaDesdeOrigen: p.getTarifaDesdeOrigen(),
            })),
        })
    }

    async deleteByRuta(rutaID: string): Promise<void> {
        await prisma.paradaIntermedia.deleteMany({ where: { rutaID } })
    }
}
