'use server'

import { GestionRegistroAutobus } from '@/services/flota/GestionRegistroAutobus'
import { GestionEstadoAutobus } from '@/services/flota/GestionEstadoAutobus'
import { GestionMantenimiento } from '@/services/flota/GestionMantenimiento'
import { GestionAsignacionAutobusViaje } from '@/services/flota/GestionAsignacionAutobusViaje'
import { TipoServicio, EstadoAutobus, TipoMantenimiento } from '@prisma/client'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

async function getEmail(): Promise<string> {
    const sesion = await auth()
    return (sesion?.user as { email?: string } | undefined)?.email ?? 'sistema'
}

// D3, D7 — UIReg: registra un nuevo autobús
export async function registrarAutobusAction(formData: FormData) {
    const email = await getEmail()
    const svc = new GestionRegistroAutobus()
    const resultado = await svc.registrarAutobus({
        numeroEconomico: String(formData.get('numeroEconomico') ?? ''),
        placas:          String(formData.get('placas') ?? ''),
        vin:             String(formData.get('vin') ?? ''),
        marca:           String(formData.get('marca') ?? ''),
        modelo:          String(formData.get('modelo') ?? ''),
        anio:            Number(formData.get('anio') ?? 0),
        capacidadAsientos: Number(formData.get('capacidadAsientos') ?? 0),
        tipoAutobus:     formData.get('tipoAutobus') as TipoServicio,
    }, email)
    if (resultado.exito) revalidatePath('/admin/flota')
    return resultado
}

// D4 — UIAct: actualiza datos de un autobús
export async function actualizarAutobusAction(autobusID: string, formData: FormData) {
    const email = await getEmail()
    const svc = new GestionRegistroAutobus()
    const resultado = await svc.actualizarAutobus(autobusID, {
        marca:             formData.get('marca') ? String(formData.get('marca')) : undefined,
        modelo:            formData.get('modelo') ? String(formData.get('modelo')) : undefined,
        capacidadAsientos: formData.get('capacidadAsientos') ? Number(formData.get('capacidadAsientos')) : undefined,
        tipoAutobus:       formData.get('tipoAutobus') ? formData.get('tipoAutobus') as TipoServicio : undefined,
    }, email)
    if (resultado.exito) revalidatePath('/admin/flota')
    return resultado
}

// D6 — UIEstado: cambia el estado operativo del autobús
export async function cambiarEstadoAutobusAction(autobusID: string, nuevoEstado: EstadoAutobus, motivo: string) {
    const email = await getEmail()
    const svc = new GestionEstadoAutobus()
    const resultado = await svc.cambiarEstadoAutobus(autobusID, nuevoEstado, motivo, email)
    if (resultado.exito) revalidatePath('/admin/flota')
    return resultado
}

// D4, D2 — UIMtto: registra un mantenimiento
export async function registrarMantenimientoAction(autobusID: string, formData: FormData) {
    const email = await getEmail()
    const svc = new GestionMantenimiento()
    const resultado = await svc.registrarMantenimiento(autobusID, {
        tipo:                formData.get('tipo') as TipoMantenimiento,
        fechaInicio:         new Date(String(formData.get('fechaInicio') ?? '')),
        kilometraje:         Number(formData.get('kilometraje') ?? 0),
        descripcionActividad: String(formData.get('descripcionActividad') ?? ''),
        refacciones:         String(formData.get('refacciones') ?? ''),
        responsable:         String(formData.get('responsable') ?? ''),
        importaciones:       String(formData.get('importaciones') ?? ''),
        observaciones:       String(formData.get('observaciones') ?? ''),
    }, email)
    if (resultado.exito) revalidatePath('/admin/flota')
    return resultado
}

// D4 — UIMtto: cierra un mantenimiento abierto
export async function cerrarMantenimientoAction(mantenimientoID: string, fechaCierre: string) {
    const email = await getEmail()
    const svc = new GestionMantenimiento()
    const resultado = await svc.cerrarMantenimiento(mantenimientoID, new Date(fechaCierre), email)
    if (resultado.exito) revalidatePath('/admin/flota')
    return resultado
}

// D2, D4 — UIAsig: asigna un autobús a un horario
export async function asignarAutobusAction(formData: FormData) {
    const email = await getEmail()
    const svc = new GestionAsignacionAutobusViaje()
    const resultado = await svc.asignarAutobusAViaje(
        String(formData.get('autobusID') ?? ''),
        String(formData.get('horarioID') ?? ''),
        String(formData.get('conductorID') ?? ''),
        String(formData.get('observaciones') ?? ''),
        email,
    )
    if (resultado.exito) revalidatePath('/admin/flota')
    return resultado
}

// D4 — libera un autobús de su asignación activa
export async function liberarAutobusAction(asignacionID: string) {
    const email = await getEmail()
    const svc = new GestionAsignacionAutobusViaje()
    const resultado = await svc.liberarAutobus(asignacionID, email)
    if (resultado.exito) revalidatePath('/admin/flota')
    return resultado
}
