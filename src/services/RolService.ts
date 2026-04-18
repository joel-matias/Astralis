import { prisma } from '@/lib/prisma'
import { Rol } from '@/models/seguridad/Rol'
import type { Permiso } from '@/models/seguridad/Rol'

// service::roles — gestiona permisos y roles del sistema
export class RolService {

    // Verifica si el rol de un usuario tiene permiso para una acción dada
    async tienePermiso(usuarioID: string, accion: string): Promise<boolean> {
        const usuario = await prisma.usuario.findUnique({
            where: { usuarioID },
            include: { rol: { include: { permisos: true } } },
        })
        if (!usuario) return false

        const permisos: Permiso[] = usuario.rol.permisos.map(p => ({
            permisoID: p.permisoID,
            rolID:     p.rolID,
            accion:    p.accion,
            modulo:    p.modulo,
        }))

        const rol = new Rol(usuario.rol.rolID, usuario.rol.nombre, permisos)
        return rol.tienePermiso(accion)
    }

    // Asigna un permiso a un usuario a través de su rol
    async asignarPermiso(usuarioID: string, accion: string, modulo: string): Promise<void> {
        const usuario = await prisma.usuario.findUnique({ where: { usuarioID } })
        if (!usuario) return

        await prisma.permiso.upsert({
            where:  { rolID_accion: { rolID: usuario.rolID, accion } },
            create: { rolID: usuario.rolID, accion, modulo },
            update: {},
        })
    }
}

// PermisoService — lista permisos disponibles en el sistema
export class PermisoService {

    async listarPermisos(): Promise<Permiso[]> {
        const registros = await prisma.permiso.findMany()
        return registros.map(p => ({
            permisoID: p.permisoID,
            rolID:     p.rolID,
            accion:    p.accion,
            modulo:    p.modulo,
        }))
    }
}
