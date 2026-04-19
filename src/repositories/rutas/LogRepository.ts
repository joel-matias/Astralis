// repository::rutas — LogRepository: persistencia dedicada de auditoría del módulo rutas
import { prisma } from '@/lib/prisma'

export interface DatosLog {
    usuarioID: string
    accion: string
    codigoRuta: string
    fechaHora: Date
}

export class LogRepository {

    async save(datos: DatosLog): Promise<void> {
        await prisma.logAuditoria.create({
            data: {
                usuarioID: datos.usuarioID,
                accion: datos.accion,
                modulo: 'rutas',
                resultado: 'Exito',
                detalles: `Ruta: ${datos.codigoRuta}`,
                fechaHora: datos.fechaHora,
            },
        })
    }
}
