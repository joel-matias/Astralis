'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { EstadoRuta, EstadoUsuario } from '@prisma/client'
import { auth } from '@/auth'
import { Usuario } from '@/models/seguridad/Usuario'
import type { RutaDTO } from '@/models/rutas/RutaDTO'
import { RutaService } from '@/services/RutaService'

export type { RutaDTO, ParadaDTO } from '@/models/rutas/RutaDTO'

const rutaService = new RutaService()

function usuarioDesdeSession(id: string, name: string | null | undefined, email: string | null | undefined): Usuario {
    return new Usuario(id, name ?? '', email ?? '', '', 0, EstadoUsuario.ACTIVO, '')
}

export async function toggleEstadoRuta(rutaID: string, estadoActual: EstadoRuta) {
    const session = await auth()
    await rutaService.toggleEstado(rutaID, estadoActual, session?.user?.id ?? null)
    revalidatePath('/admin/rutas')
}

export async function crearRuta(data: RutaDTO): Promise<{ error: string } | { warning: string } | void> {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Sesión no válida.' }

    const error = rutaService.validarDatos(data)
    if (error) return { error }

    const warning = await rutaService.verificarDuplicado(data.ciudadOrigen, data.ciudadDestino)
    if (warning && !data.omitirDuplicado) return { warning }

    try {
        const usuario = usuarioDesdeSession(session.user.id, session.user.name, session.user.email)
        await rutaService.crearRuta(data, usuario)
    } catch (e: unknown) {
        const err = e as { code?: string }
        if (err?.code === 'P2002') return { error: 'El código de ruta ya existe.' }
        return { error: 'Error al guardar la ruta. Intenta de nuevo.' }
    }

    redirect('/admin/rutas')
}

export async function actualizarRuta(rutaID: string, data: RutaDTO): Promise<{ error: string } | { warning: string } | void> {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Sesión no válida.' }

    const error = rutaService.validarDatos(data)
    if (error) return { error }

    const warning = await rutaService.verificarDuplicado(data.ciudadOrigen, data.ciudadDestino, rutaID)
    if (warning && !data.omitirDuplicado) return { warning }

    try {
        const usuario = usuarioDesdeSession(session.user.id, session.user.name, session.user.email)
        await rutaService.actualizarRuta(rutaID, data, usuario)
    } catch (e: unknown) {
        const err = e as { code?: string }
        if (err?.code === 'P2002') return { error: 'El código de ruta ya existe.' }
        return { error: 'Error al actualizar la ruta. Intenta de nuevo.' }
    }

    redirect('/admin/rutas')
}
