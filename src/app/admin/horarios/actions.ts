'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { FrecuenciaHorario, VigenciaHorario, EstadoHorario } from '@prisma/client'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function crearHorario(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const rutaID      = formData.get('rutaID') as string
    const autobusID   = formData.get('autobusID') as string
    const conductorID = formData.get('conductorID') as string
    const fechaStr    = formData.get('fechaInicio') as string
    const horaStr     = formData.get('horaSalida') as string
    const frecuencia  = formData.get('frecuencia') as FrecuenciaHorario
    const vigencia    = formData.get('vigencia') as VigenciaHorario
    const fechaFinStr = formData.get('fechaFin') as string | null
    const precioBase  = parseFloat(formData.get('precioBase') as string)

    const fechaInicio = new Date(fechaStr)
    const [hh, mm]    = horaStr.split(':').map(Number)
    const horaSalida  = new Date(0)
    horaSalida.setUTCHours(hh, mm, 0, 0)

    const horario = await prisma.horario.create({
        data: {
            rutaID,
            autobusID,
            conductorID,
            programadoPorID: session.user.id,
            fechaInicio,
            horaSalida,
            frecuencia,
            vigencia,
            fechaFin: vigencia === VigenciaHorario.DEFINIDA && fechaFinStr ? new Date(fechaFinStr) : null,
            precioBase,
            estado: EstadoHorario.ACTIVO,
        },
    })

    await prisma.logAuditoria.create({
        data: {
            usuarioID: session.user.id,
            accion: 'CREAR_HORARIO',
            modulo: 'Horarios',
            resultado: 'Exito',
            detalles: `Horario creado: ${horario.horarioID}`,
        },
    })

    revalidatePath('/admin/horarios')
    redirect(`/admin/horarios/${horario.horarioID}`)
}

export async function cancelarHorario(horarioID: string) {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    await prisma.horario.update({
        where: { horarioID },
        data: { estado: EstadoHorario.CANCELADO },
    })

    await prisma.logAuditoria.create({
        data: {
            usuarioID: session.user.id,
            accion: 'CANCELAR_HORARIO',
            modulo: 'Horarios',
            resultado: 'Exito',
            detalles: `Horario cancelado: ${horarioID}`,
        },
    })

    revalidatePath('/admin/horarios')
    redirect('/admin/horarios')
}
