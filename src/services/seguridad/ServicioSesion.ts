import { prisma } from '@/lib/prisma'
import { SesionActiva } from '@/models/seguridad/SesionActiva'

// Paso 7 del diagrama de comunicación: crearSesion(usuarioId, rol)
// Responsable de crear la sesión en BD y retornar el objeto de dominio SesionActiva
export class ServicioSesion {
    private static readonly DURACION_HRS = 8

    async crearSesion(usuarioId: string, ip: string): Promise<SesionActiva> {
        // RN4 (diagrama de estados): no se permiten sesiones simultáneas en múltiples dispositivos
        // Se invalidan todas las sesiones activas previas del usuario antes de crear la nueva
        await prisma.sesionActiva.updateMany({
            where: { usuarioID: usuarioId, activa: true },
            data: { activa: false },
        })

        const sesionID = crypto.randomUUID()
        const fechaInicio = new Date()
        const fechaExpiracion = new Date(
            Date.now() + ServicioSesion.DURACION_HRS * 60 * 60 * 1000
        )

        await prisma.sesionActiva.create({
            data: {
                sesionID,
                usuarioID: usuarioId,
                // El JWT real viaja en la cookie cifrada de NextAuth;
                // aquí guardamos el sesionID como referencia para invalidar desde BD
                tokenAcceso: sesionID,
                fechaExpiracion,
                ipOrigen: ip,
                activa: true,
            },
        })

        // Paso 8: retornarTokenSesion() → devuelve el objeto de dominio
        return new SesionActiva(sesionID, usuarioId, sesionID, fechaInicio, fechaExpiracion, ip)
    }
}
