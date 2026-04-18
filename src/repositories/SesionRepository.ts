import { prisma } from '@/lib/prisma'
import { SesionActiva } from '@/models/seguridad/SesionActiva'

// repository::seguridad — gestiona la persistencia de SesionActiva en BD
export class SesionRepository {

    async save(sesion: SesionActiva): Promise<void> {
        await prisma.sesionActiva.create({
            data: {
                sesionID:        sesion.getSesionID(),
                usuarioID:       sesion.getUsuarioID(),
                tokenAcceso:     sesion.getTokenAcceso(),
                fechaExpiracion: sesion.getFechaExpiracion(),
                ipOrigen:        sesion.getIpOrigen(),
                activa:          sesion.estaActiva(),
            },
        })
    }

    // Invalida todas las sesiones activas de un usuario (RN4)
    async invalidar(usuarioID: string): Promise<void> {
        await prisma.sesionActiva.updateMany({
            where: { usuarioID, activa: true },
            data:  { activa: false },
        })
    }
}
