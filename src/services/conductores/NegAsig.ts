// D7 CU6 — NegAsig: Gestión Asignación Conductor a Viaje — implementa el flujo del D6 (Diagrama de Secuencia)
import { randomUUID } from 'crypto'
import { EstadoConductor } from '@prisma/client'
import { BaseDatos } from './BaseDatos'
import { NegAud } from './NegAud'
import { Conductor } from '@/models/conductores/Conductor'
import { Viaje } from '@/models/conductores/Viaje'
import { AsignacionConductorViaje } from '@/models/conductores/AsignacionConductorViaje'

export class NegAsig {
    private bd: BaseDatos
    private negAud: NegAud

    constructor() {
        this.bd = new BaseDatos()
        this.negAud = new NegAud()
    }

    // D6 paso 2: obtener viajes programados sin conductor
    async obtenerViajesProgramados() {
        return this.bd.obtenerViajesProgramados()
    }

    // D6 paso 8: obtener conductores disponibles
    async obtenerConductoresDisponibles() {
        return this.bd.obtenerConductoresDisponibles()
    }

    // D6: flujo completo de asignación — instancia objetos de dominio y delega validaciones
    async asignarConductor(
        conductorID: string,
        horarioID: string,
        observaciones: string,
        usuarioID?: string
    ): Promise<{ ok: boolean; asignacionID?: string; error?: string }> {

        // Obtener datos del conductor desde BD
        const conductores = await this.bd.obtenerConductoresRegistrados()
        const condData = conductores.find(c => c.conductorID === conductorID)
        if (!condData) return { ok: false, error: 'Conductor no encontrado' }

        // D6: condSel — instanciar objeto de dominio Conductor
        const condSel = new Conductor(
            condData.conductorID,
            condData.nombreCompleto,
            condData.domicilio ?? '',
            condData.curp,
            condData.numeroLicencia,
            condData.vigenciaLicencia,
            condData.numeroTelefonico ?? '',
            condData.estado,
            condData.fechaRegistro,
            condData.motivoBaja
        )

        // D6 E3: verificarEstadoActivo
        if (!condSel.verificarEstadoActivo()) {
            return { ok: false, error: 'El conductor no está activo' }
        }

        // D6 E4: verificarLicenciaVigente
        if (!condSel.verificarLicenciaVigente()) {
            return { ok: false, error: 'Licencia vencida' }
        }

        // D6 E5: verificarChoqueHorario — validación real vía BaseDatos (stub del modelo delega aquí)
        const hayChoque = await this.bd.verificarChoqueHorario(conductorID, horarioID)
        if (hayChoque) {
            return { ok: false, error: 'Choque de horario: el conductor ya tiene un viaje en ese periodo' }
        }

        // Obtener datos del horario para construir el Viaje
        const { prisma } = await import('@/lib/prisma')
        const horarioData = await prisma.horario.findUnique({
            where: { horarioID },
            include: { ruta: true },
        })
        if (!horarioData) return { ok: false, error: 'Viaje no encontrado' }

        // D6: viajeSel — instanciar objeto de dominio Viaje
        const viajeSel = new Viaje(
            horarioData.horarioID,
            horarioData.ruta.nombreRuta,
            horarioData.fechaInicio,
            Number(horarioData.ruta.tiempoEstimadoHrs),
            'Programado'
        )

        // D6: nuevaAsig — instanciar AsignacionConductorViaje
        const asignacionID = randomUUID()
        const nuevaAsig = new AsignacionConductorViaje(asignacionID, new Date(), observaciones || '')

        // D6: crearAsignacion(condSel, viajeSel) — valida aptitud y cambia estado del conductor en memoria
        const creada = nuevaAsig.crearAsignacion(condSel, viajeSel)
        if (!creada) return { ok: false, error: 'No se pudo crear la asignación' }

        // D5: marcar sub-estado AsignadoAViaje en el conductor
        condSel.registrarMotivoDeBajaAnterior('ASIGNADO_A_VIAJE')

        // D6: guardarAsignacion(nuevaAsig) — persiste la asignación
        const guardado = await this.bd.guardarAsignacion(nuevaAsig)
        if (!guardado) return { ok: false, error: 'Error al guardar la asignación' }

        // D6: guardarCambios(condSel) — persiste el nuevo estado NO_DISPONIBLE del conductor
        await this.bd.guardarCambios(condSel)

        // D6: registrar("Asignación conductor a viaje")
        await this.negAud.registrar({
            usuarioID,
            accion: 'ASIGNAR_CONDUCTOR',
            resultado: 'Exito',
            detalles: `conductorID=${conductorID} horarioID=${horarioID}`,
        })

        return { ok: true, asignacionID }
    }

    // D5: liberar conductor cuando el viaje finaliza
    async liberarConductor(asignacionID: string, conductorID: string, usuarioID?: string): Promise<{ ok: boolean; error?: string }> {
        const { prisma } = await import('@/lib/prisma')

        // Marcar la asignación como liberada
        await prisma.asignacionConductorViaje.update({
            where: { asignacionID },
            data: { liberado: true, fechaLiberacion: new Date() },
        })

        // Obtener conductor y construir instancia de dominio
        const condData = await prisma.conductor.findUnique({ where: { conductorID } })
        if (!condData) return { ok: false, error: 'Conductor no encontrado' }

        const cond = new Conductor(
            condData.conductorID,
            condData.nombreCompleto,
            condData.domicilio ?? '',
            condData.curp,
            condData.numeroLicencia,
            condData.vigenciaLicencia,
            condData.numeroTelefonico ?? '',
            condData.estado,
            condData.fechaRegistro,
            condData.motivoBaja
        )

        // D5: liberar — establecerEstadoActivo si licencia vigente; si no, queda NO_DISPONIBLE
        cond.establecerEstadoActivo()

        // Limpiar sub-estado AsignadoAViaje
        if (cond.getEstado() === EstadoConductor.ACTIVO) {
            cond.registrarMotivoDeBajaAnterior(null)
        } else {
            cond.registrarMotivoDeBajaAnterior('LICENCIA_VENCIDA')
        }

        // Persistir nuevo estado del conductor
        await this.bd.guardarCambios(cond)

        await this.negAud.registrar({
            usuarioID,
            accion: 'LIBERAR_CONDUCTOR',
            resultado: 'Exito',
            detalles: `asignacionID=${asignacionID} conductorID=${conductorID}`,
        })

        return { ok: true }
    }
}
