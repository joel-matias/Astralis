'use server'

import { NegReg } from '@/services/conductores/NegReg'
import { NegEst } from '@/services/conductores/NegEst'
import { NegAsig } from '@/services/conductores/NegAsig'
import { NegAud } from '@/services/conductores/NegAud'
import { NegVal } from '@/services/conductores/NegVal'
import { BaseDatos } from '@/services/conductores/BaseDatos'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

async function getUserID(): Promise<string | undefined> {
    const session = await auth()
    return (session?.user as { id?: string } | null)?.id
}

export async function registrarConductorAction(formData: FormData) {
    const curp = (formData.get('curp') as string | null)?.toUpperCase() ?? ''
    const datos = new Map<string, unknown>([
        ['nombreCompleto', formData.get('nombreCompleto') ?? ''],
        ['curp', curp],
        ['numeroLicencia', formData.get('numeroLicencia') ?? ''],
        ['vigenciaLicencia', formData.get('vigenciaLicencia') ?? ''],
        ['numeroTelefonico', formData.get('numeroTelefonico') || undefined],
    ])

    const negVal = new NegVal()
    const validacion = await negVal.validarRegistro(datos)
    if (!validacion.valido) return { ok: false, error: validacion.error }

    const usuarioID = await getUserID()
    const negReg = new NegReg()
    const resultado = await negReg.registrarConductor({
        nombreCompleto: datos.get('nombreCompleto') as string,
        domicilio: formData.get('domicilio') as string,
        curp: datos.get('curp') as string,
        numeroLicencia: datos.get('numeroLicencia') as string,
        vigenciaLicencia: datos.get('vigenciaLicencia') as string,
        numeroTelefonico: formData.get('numeroTelefonico') as string,
    }, usuarioID)

    if (resultado.ok) revalidatePath('/admin/conductores')
    return resultado
}

export async function actualizarConductorAction(conductorID: string, formData: FormData) {
    const datos = new Map<string, unknown>([
        ['nombreCompleto', formData.get('nombreCompleto') ?? ''],
        ['vigenciaLicencia', formData.get('vigenciaLicencia') ?? ''],
        ['numeroTelefonico', formData.get('numeroTelefonico') || undefined],
    ])

    const negVal = new NegVal()
    const validacion = await negVal.validarActualizacion(datos)
    if (!validacion.valido) return { ok: false, error: validacion.error }

    const usuarioID = await getUserID()
    const negReg = new NegReg()
    const resultado = await negReg.actualizarConductor(conductorID, {
        nombreCompleto: formData.get('nombreCompleto') as string,
        domicilio: formData.get('domicilio') as string,
        numeroTelefonico: formData.get('numeroTelefonico') as string,
        vigenciaLicencia: formData.get('vigenciaLicencia') as string,
    }, usuarioID)

    if (resultado.ok) revalidatePath(`/admin/conductores/${conductorID}`)
    return resultado
}

export async function cambiarEstadoAction(conductorID: string, nuevoEstado: string, motivo: string) {
    const usuarioID = await getUserID()
    const negEst = new NegEst()
    let resultado: { ok: boolean; error?: string }

    if (nuevoEstado === 'NO_DISPONIBLE') {
        resultado = await negEst.setNoDisponible(conductorID, motivo, usuarioID)
    } else if (nuevoEstado === 'ACTIVO') {
        resultado = await negEst.reactivar(conductorID, usuarioID)
    } else {
        resultado = await negEst.darDeBaja(conductorID, motivo, usuarioID)
    }

    if (resultado.ok) revalidatePath(`/admin/conductores/${conductorID}`)
    return resultado
}

export async function darDeBajaAction(conductorID: string, motivo: string) {
    const usuarioID = await getUserID()
    const negEst = new NegEst()
    const resultado = await negEst.darDeBaja(conductorID, motivo, usuarioID)
    if (resultado.ok) revalidatePath('/admin/conductores')
    return resultado
}

export async function asignarConductorAction(conductorID: string, horarioID: string, observaciones: string) {
    const usuarioID = await getUserID()
    const negAsig = new NegAsig()
    const resultado = await negAsig.asignarConductor(conductorID, horarioID, observaciones, usuarioID)
    if (resultado.ok) {
        revalidatePath('/admin/conductores')
        revalidatePath('/admin/conductores/asignar')
    }
    return resultado
}

export async function liberarConductorAction(asignacionID: string, conductorID: string) {
    const usuarioID = await getUserID()
    const negAsig = new NegAsig()
    const resultado = await negAsig.liberarConductor(asignacionID, conductorID, usuarioID)
    if (resultado.ok) revalidatePath(`/admin/conductores/${conductorID}`)
    return resultado
}

// D7: obtener conductores candidatos para un viaje — Activos, licencia vigente, sin choque de horario
export async function obtenerConductoresParaViajeAction(horarioID: string) {
    const bd = new BaseDatos()
    const conductores = await bd.obtenerConductoresParaViaje(horarioID)
    return conductores.map(c => ({
        conductorID: c.conductorID,
        nombreCompleto: c.nombreCompleto,
        curp: c.curp,
        vigenciaLicencia: c.vigenciaLicencia,
        estado: c.estado,
    }))
}

// S1.2: registrar abandono del flujo de asignación
export async function registrarAbandonoAction() {
    const usuarioID = await getUserID()
    const negAud = new NegAud()
    await negAud.registrar({
        usuarioID,
        accion: 'ABANDONAR_ASIGNACION',
        resultado: 'Abandonado',
        detalles: 'Usuario abandonó el flujo de asignación de conductor',
    })
}
