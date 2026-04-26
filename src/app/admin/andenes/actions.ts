'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { EstadoAnden } from '@prisma/client'
import { auth } from '@/auth'

export interface AndenFormData {
    numero: number
    capacidad: number
    estado: EstadoAnden
    horarioDisponible: string | null
}

export async function crearAnden(data: AndenFormData) {
    try {
        await prisma.anden.create({
            data: {
                numero: data.numero,
                capacidad: data.capacidad,
                estado: data.estado,
                horarioDisponible: data.horarioDisponible,
            },
        })

        revalidatePath('/admin/andenes')
        redirect('/admin/andenes')
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        return { error: message }
    }
}

export async function actualizarAnden(andenID: string, data: AndenFormData) {
    try {
        await prisma.anden.update({
            where: { andenID },
            data: {
                numero: data.numero,
                capacidad: data.capacidad,
                estado: data.estado,
                horarioDisponible: data.horarioDisponible,
            },
        })

        revalidatePath('/admin/andenes')
        redirect('/admin/andenes')
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        return { error: message }
    }
}

export async function asignarAnden(
    horarioID: string,
    andenID: string
): Promise<{ error: string } | void> {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Sesión no válida.' }

    try {
        // E3: verificar que el horario existe y está activo
        const horario = await prisma.horario.findUnique({
            where: { horarioID },
            select: { estado: true }
        })
        if (!horario || horario.estado !== 'ACTIVO') {
            return { error: 'El autobús seleccionado no cuenta con un viaje válido.' }
        }

        // E2: verificar que el andén sigue disponible
        const anden = await prisma.anden.findUnique({
            where: { andenID },
            select: { estado: true, capacidad: true }
        })
        if (!anden || anden.estado !== 'DISPONIBLE') {
            return { error: 'El andén seleccionado ya no está disponible.' }
        }

        // Contar asignaciones activas
        const asignacionesActivas = await prisma.asignacionAnden.count({
            where: {
                andenID,
                cancelada: false,
                estado: { in: ['RESERVADO', 'OCUPADO'] }
            }
        })

        // Si con esta nueva asignación se llena → OCUPADO, si no → DISPONIBLE
        const nuevoEstado = (asignacionesActivas + 1) >= anden.capacidad
            ? 'OCUPADO'
            : 'DISPONIBLE'

        await prisma.$transaction([
            prisma.asignacionAnden.create({
                data: {
                    andenID,
                    horarioID,
                    supervisorID: session.user.id,
                    estado: 'RESERVADO',
                }
            }),
            prisma.anden.update({
                where: { andenID },
                data: { estado: nuevoEstado }  // ← ya no hardcodeado
            }),
            prisma.logAuditoria.create({
                data: {
                    usuarioID: session.user.id,
                    accion: 'anden:asignar',
                    modulo: 'andenes',
                    resultado: 'Exito',
                    detalles: `Andén asignado al horario ${horarioID}`,
                }
            })
        ])

        revalidatePath('/admin/andenes')
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        return { error: message }
    }

    redirect('/admin/andenes')
}