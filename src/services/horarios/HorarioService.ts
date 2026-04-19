// D5 CU3 — Orquesta el caso de uso completo Programar Horario de Viaje
import { Horario } from '@/models/horarios/Horario'
import type { HorarioDTO } from '@/models/horarios/HorarioDTO'
import type { Autobus } from '@/models/horarios/Autobus'
import type { Conductor } from '@/models/horarios/Conductor'
import type { Ruta } from '@/models/horarios/Ruta'
import { NotificacionService } from './NotificacionService'
import { ValidadorRecursos } from './ValidadorRecursos'
import { RepositorioHorarios } from '@/repositories/horarios/RepositorioHorarios'

export class HorarioService {
    private notificacion = new NotificacionService()
    private validador = new ValidadorRecursos()
    private repositorio = new RepositorioHorarios()

    programarHorario(datos: HorarioDTO): Horario {
        return new Horario(
            crypto.randomUUID(),
            datos.rutaID,
            datos.autobusID,
            datos.conductorID,
            datos.fechaInicio,
            datos.horaSalida,
            datos.frecuencia,
            datos.vigencia,
            datos.precioBase ?? 0,
            datos.estado ?? 'Activo'
        )
    }

    validarRecursos(autobus: Autobus, conductor: Conductor): boolean {
        return (
            autobus.cumpleIntervalMantenimiento() &&
            conductor.tieneLicenciaVigente() &&
            !conductor.excededHoras(0)
        )
    }

    // D6: delega la verificación de disponibilidad a ValidadorRecursos
    verificarDisponibilidadRecursos(autobusID: string, conductorID: string, fecha: Date, hora: Date): boolean {
        return this.validador.validarDisponibilidadRecursos(autobusID, conductorID, fecha, hora)
    }

    verificarConflictoHorario(fecha: Date, hora: Date): boolean {
        void fecha
        void hora
        return false
    }

    // D6: usa tarifaBase de la ruta; el repositorio provee la instancia de Ruta
    calcularPrecioViaje(ruta: Ruta): number {
        return ruta.getTarifaBase()
    }

    notificarConductor(conductorID: string, horario: Horario): void {
        this.notificacion.notificarAsignacion(conductorID, horario.getHorarioID())
    }

    async registrarEnLog(usuarioID: string, accion: string, detalles: string): Promise<void> {
        await this.repositorio.guardarLog(usuarioID, accion, detalles)
    }

    // D7: orquesta el flujo completo — valida → programa → persiste → notifica → registra
    async solicitarProgramacion(datos: HorarioDTO): Promise<string> {
        const disponible = this.verificarDisponibilidadRecursos(
            datos.autobusID,
            datos.conductorID,
            datos.fechaInicio,
            datos.horaSalida
        )
        if (!disponible) throw new Error('E1: recursos no disponibles')

        const horario = this.programarHorario(datos)
        const horarioID = await this.repositorio.save(horario, datos.programadoPorID, datos.fechaFin)
        this.notificarConductor(datos.conductorID, horario)
        await this.registrarEnLog(datos.programadoPorID, 'CREAR_HORARIO', `Horario programado: ${horarioID}`)
        return horarioID
    }

    async cancelar(horarioID: string, usuarioID: string): Promise<void> {
        await this.repositorio.cancelar(horarioID)
        await this.registrarEnLog(usuarioID, 'CANCELAR_HORARIO', `Horario cancelado: ${horarioID}`)
    }
}
