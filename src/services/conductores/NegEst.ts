// D7 CU6 — NegEst: Gestión Estado Conductor — implementa las transiciones del D5 (Diagrama de Estados)
import { EstadoConductor } from '@prisma/client'
import { BaseDatos } from './BaseDatos'
import { NegAud } from './NegAud'
import { Conductor } from '@/models/conductores/Conductor'

export class NegEst {
    private bd: BaseDatos
    private negAud: NegAud

    constructor() {
        this.bd = new BaseDatos()
        this.negAud = new NegAud()
    }

    // D5: Activo → NoDisponible/Temporal (vacaciones, incapacidad, suspensión)
    async setNoDisponible(conductorID: string, motivo: string, usuarioID?: string): Promise<{ ok: boolean; error?: string }> {
        const conductores = await this.bd.obtenerConductoresRegistrados()
        const condData = conductores.find(c => c.conductorID === conductorID)
        if (!condData) return { ok: false, error: 'Conductor no encontrado' }
        if (condData.estado !== EstadoConductor.ACTIVO) {
            return { ok: false, error: 'Solo un conductor Activo puede pasar a No Disponible' }
        }

        // D3: construir instancia y aplicar transición de estado
        const cond = new Conductor(
            condData.conductorID, condData.nombreCompleto, condData.domicilio ?? '',
            condData.curp, condData.numeroLicencia, condData.vigenciaLicencia,
            condData.numeroTelefonico ?? '', condData.estado, condData.fechaRegistro, condData.motivoBaja
        )
        cond.cambiarEstado(EstadoConductor.NO_DISPONIBLE)
        cond.registrarMotivoDeBajaAnterior(motivo)

        await this.bd.guardarCambios(cond)

        await this.negAud.registrar({
            usuarioID,
            accion: 'CAMBIAR_ESTADO',
            resultado: 'Exito',
            detalles: `conductorID=${conductorID} estado=NO_DISPONIBLE motivo=${motivo}`,
        })
        return { ok: true }
    }

    // D5: NoDisponible/Temporal → Activo (fin situación temporal, licencia vigente)
    async reactivar(conductorID: string, usuarioID?: string): Promise<{ ok: boolean; error?: string }> {
        const conductores = await this.bd.obtenerConductoresRegistrados()
        const condData = conductores.find(c => c.conductorID === conductorID)
        if (!condData) return { ok: false, error: 'Conductor no encontrado' }

        if (condData.estado === EstadoConductor.INACTIVO) {
            return { ok: false, error: 'No se puede reactivar un conductor dado de baja' }
        }
        // D5: NoDisponible/AsignadoAViaje no puede reactivarse manualmente
        if (condData.motivoBaja === 'ASIGNADO_A_VIAJE') {
            return { ok: false, error: 'No se puede reactivar: el conductor está asignado a un viaje. Libere la asignación primero.' }
        }
        if (new Date(condData.vigenciaLicencia) <= new Date()) {
            return { ok: false, error: 'No se puede reactivar: licencia vencida' }
        }

        const cond = new Conductor(
            condData.conductorID, condData.nombreCompleto, condData.domicilio ?? '',
            condData.curp, condData.numeroLicencia, condData.vigenciaLicencia,
            condData.numeroTelefonico ?? '', condData.estado, condData.fechaRegistro, condData.motivoBaja
        )
        cond.cambiarEstado(EstadoConductor.ACTIVO)
        cond.registrarMotivoDeBajaAnterior(null)

        await this.bd.guardarCambios(cond)

        await this.negAud.registrar({
            usuarioID,
            accion: 'CAMBIAR_ESTADO',
            resultado: 'Exito',
            detalles: `conductorID=${conductorID} estado=ACTIVO`,
        })
        return { ok: true }
    }

    // D5: Activo|Temporal → Inactivo/Baja (sin viajes activos, registrar motivo)
    async darDeBaja(conductorID: string, motivo: string, usuarioID?: string): Promise<{ ok: boolean; error?: string }> {
        const conductores = await this.bd.obtenerConductoresRegistrados()
        const condData = conductores.find(c => c.conductorID === conductorID)
        if (!condData) return { ok: false, error: 'Conductor no encontrado' }

        const cond = new Conductor(
            condData.conductorID, condData.nombreCompleto, condData.domicilio ?? '',
            condData.curp, condData.numeroLicencia, condData.vigenciaLicencia,
            condData.numeroTelefonico ?? '', condData.estado, condData.fechaRegistro, condData.motivoBaja
        )

        // D3, D5: darDeBajaMotivo bloquea si sub-estado es AsignadoAViaje
        if (!cond.darDeBajaMotivo(motivo)) {
            return { ok: false, error: 'No puede darse de baja: el conductor está asignado a un viaje en curso. Primero libere la asignación.' }
        }

        await this.bd.guardarCambios(cond)

        await this.negAud.registrar({
            usuarioID,
            accion: 'BAJA_CONDUCTOR',
            resultado: 'Exito',
            detalles: `conductorID=${conductorID} motivo=${motivo}`,
        })
        return { ok: true }
    }
}
