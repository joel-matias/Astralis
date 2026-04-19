'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { HorarioService } from '@/services/horarios/HorarioService'
import type { HorarioDTO } from '@/models/horarios/HorarioDTO'
import type { FrecuenciaHorario, VigenciaHorario } from '@/models/horarios/Horario'

const servicio = new HorarioService()

function mapFrecuencia(valor: string): FrecuenciaHorario {
    const map: Record<string, FrecuenciaHorario> = {
        UNICO: 'Unico', DIARIO: 'Diario', SEMANAL: 'Semanal',
        Unico: 'Unico', Diario: 'Diario', Semanal: 'Semanal',
    }
    return map[valor] ?? 'Unico'
}

function mapVigencia(valor: string): VigenciaHorario {
    return (valor === 'DEFINIDA' || valor === 'Definida') ? 'Definida' : 'Indefinida'
}

export async function crearHorario(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const frecuenciaStr = formData.get('frecuencia') as string
    const vigenciaStr   = formData.get('vigencia') as string
    const fechaStr      = formData.get('fechaInicio') as string
    const horaStr       = formData.get('horaSalida') as string
    const fechaFinStr   = formData.get('fechaFin') as string | null

    const fechaInicio = new Date(fechaStr)
    const [hh, mm]    = horaStr.split(':').map(Number)
    const horaSalida  = new Date(0)
    horaSalida.setUTCHours(hh, mm, 0, 0)

    const vigencia = mapVigencia(vigenciaStr)

    const datos: HorarioDTO = {
        rutaID:          formData.get('rutaID') as string,
        autobusID:       formData.get('autobusID') as string,
        conductorID:     formData.get('conductorID') as string,
        fechaInicio,
        horaSalida,
        frecuencia:      mapFrecuencia(frecuenciaStr),
        vigencia,
        fechaFin:        vigencia === 'Definida' && fechaFinStr ? new Date(fechaFinStr) : undefined,
        precioBase:      parseFloat(formData.get('precioBase') as string),
        programadoPorID: session.user.id,
    }

    const horarioID = await servicio.solicitarProgramacion(datos)
    revalidatePath('/admin/horarios')
    redirect(`/admin/horarios/${horarioID}`)
}

export async function cancelarHorario(horarioID: string) {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    await servicio.cancelar(horarioID, session.user.id)
    revalidatePath('/admin/horarios')
    redirect('/admin/horarios')
}
