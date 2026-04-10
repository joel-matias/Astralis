'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { EstadoAnden } from '@prisma/client'

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