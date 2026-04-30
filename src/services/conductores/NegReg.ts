// D7 CU6 — NegReg: Gestión Registro Conductor
import { randomUUID } from 'crypto'
import { EstadoConductor } from '@prisma/client'
import { BaseDatos } from './BaseDatos'
import { NegVal } from './NegVal'
import { NegAud } from './NegAud'
import { Conductor } from '@/models/conductores/Conductor'
import type { ConductorDTO } from '@/models/conductores/ConductorDTO'

export class NegReg {
    private bd: BaseDatos
    private negVal: NegVal
    private negAud: NegAud

    constructor() {
        this.bd = new BaseDatos()
        this.negVal = new NegVal()
        this.negAud = new NegAud()
    }

    // D6 paso 1: registrar conductor — crea instancia Conductor, valida, persiste y audita
    async registrarConductor(dto: ConductorDTO, usuarioID?: string): Promise<{ ok: boolean; conductorID?: string; error?: string }> {
        const datos = new Map<string, unknown>(Object.entries(dto))
        const validacion = await this.negVal.validarRegistro(datos)
        if (!validacion.valido) return { ok: false, error: validacion.error }

        const conductorID = randomUUID()

        // D3: crear instancia Conductor con los datos del DTO
        const cond = new Conductor(
            conductorID,
            dto.nombreCompleto,
            dto.domicilio || '',
            dto.curp.toUpperCase(),
            dto.numeroLicencia,
            new Date(dto.vigenciaLicencia),
            dto.numeroTelefonico || '',
            EstadoConductor.ACTIVO,
            new Date(),
            null
        )

        // D3: registrarDatos() — valida campos obligatorios en la instancia
        if (!cond.registrarDatos()) return { ok: false, error: 'Datos incompletos' }

        // D3: guardarConductor(cond) — persiste la instancia
        const guardado = await this.bd.guardarConductor(cond)
        if (!guardado) return { ok: false, error: 'Error al guardar el conductor' }

        await this.negAud.registrar({
            usuarioID,
            accion: 'REGISTRAR_CONDUCTOR',
            resultado: 'Exito',
            detalles: `conductorID=${conductorID} nombre=${dto.nombreCompleto}`,
        })

        return { ok: true, conductorID }
    }

    // D2: actualizarDatosNuevos — obtiene conductor actual, aplica cambios en instancia, persiste
    async actualizarConductor(conductorID: string, dto: Partial<ConductorDTO>, usuarioID?: string): Promise<{ ok: boolean; error?: string }> {
        if (dto.curp || dto.numeroLicencia) {
            const datos = new Map<string, unknown>(Object.entries(dto))
            const validacion = await this.negVal.validarRegistro(datos, conductorID)
            if (!validacion.valido) return { ok: false, error: validacion.error }
        }

        // Obtener datos actuales para construir la instancia
        const { prisma } = await import('@/lib/prisma')
        const actual = await prisma.conductor.findUnique({ where: { conductorID } })
        if (!actual) return { ok: false, error: 'Conductor no encontrado' }

        // D3: construir instancia con datos actuales
        const cond = new Conductor(
            actual.conductorID,
            actual.nombreCompleto,
            actual.domicilio ?? '',
            actual.curp,
            actual.numeroLicencia,
            actual.vigenciaLicencia,
            actual.numeroTelefonico ?? '',
            actual.estado,
            actual.fechaRegistro,
            actual.motivoBaja
        )

        // D3: actualizarDatosNuevos(Map) — aplica cambios en memoria
        const datosNuevos = new Map<string, unknown>()
        if (dto.nombreCompleto) datosNuevos.set('nombreCompleto', dto.nombreCompleto)
        if (dto.domicilio !== undefined) datosNuevos.set('domicilio', dto.domicilio)
        if (dto.numeroTelefonico !== undefined) datosNuevos.set('numeroTelefonico', dto.numeroTelefonico)
        if (dto.vigenciaLicencia) datosNuevos.set('vigenciaLicencia', new Date(dto.vigenciaLicencia))
        cond.actualizarDatosNuevos(datosNuevos)

        // D3: guardarCambios(cond) — persiste la instancia actualizada
        const guardado = await this.bd.guardarCambios(cond)
        if (!guardado) return { ok: false, error: 'Error al actualizar el conductor' }

        await this.negAud.registrar({
            usuarioID,
            accion: 'ACTUALIZAR_CONDUCTOR',
            resultado: 'Exito',
            detalles: `conductorID=${conductorID}`,
        })

        return { ok: true }
    }
}
