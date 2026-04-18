import { EstadoUsuario } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { Usuario } from '@/models/seguridad/Usuario'
import { Rol } from '@/models/seguridad/Rol'

// Paso 3 del diagrama: buscarUsuario(usuario)
// Encapsula todo acceso a BD relacionado con Usuario para la autenticación
export class RepositorioUsuario {

    // Retorna el dominio Usuario ya construido, o null si no existe.
    // También maneja el auto-desbloqueo: si el tiempo de bloqueo expiró, resetea en BD antes de retornar.
    async buscarUsuario(email: string): Promise<Usuario | null> {
        const raw = await prisma.usuario.findUnique({
            where: { email },
            include: { rol: true },
        })

        if (!raw) return null

        // Auto-desbloqueo: bloqueadoHasta existe en BD pero no en el dominio,
        // por eso se maneja aquí antes de construir el objeto de dominio
        if (raw.estado === 'BLOQUEADO' && raw.bloqueadoHasta && raw.bloqueadoHasta < new Date()) {
            await prisma.usuario.update({
                where: { usuarioID: raw.usuarioID },
                data: { estado: 'ACTIVO', intentosFallidos: 0, bloqueadoHasta: null },
            })
            raw.estado = EstadoUsuario.ACTIVO
            raw.intentosFallidos = 0
        }

        const rol = new Rol(raw.rol.rolID, raw.rol.nombre, [])

        // contrasenaHash de BD → contrasena en dominio (siempre almacenada como hash bcrypt)
        return new Usuario(
            raw.usuarioID,
            raw.nombreCompleto,
            raw.email,
            raw.contrasenaHash,
            raw.intentosFallidos,
            raw.estado,
            rol
        )
    }

    // E1/E2/E3: persiste el incremento de intentos fallidos y el bloqueo si aplica
    async actualizarIntentos(usuarioID: string, intentos: number, bloquear: boolean): Promise<void> {
        await prisma.usuario.update({
            where: { usuarioID },
            data: {
                intentosFallidos: intentos,
                estado: bloquear ? 'BLOQUEADO' : 'ACTIVO',
                bloqueadoHasta: bloquear ? new Date(Date.now() + 15 * 60 * 1000) : null,
            },
        })
    }

    // Después de login exitoso: resetea el contador de intentos fallidos
    async resetearIntentos(usuarioID: string): Promise<void> {
        await prisma.usuario.update({
            where: { usuarioID },
            data: { intentosFallidos: 0 },
        })
    }
}
