// D5 CU3 — Orquesta el caso de uso completo Programar Horario de Viaje
import { Horario } from '@/models/horarios/Horario'
import type { HorarioDTO } from '@/models/horarios/HorarioDTO'
import type { Autobus } from '@/models/horarios/Autobus'
import type { Conductor } from '@/models/horarios/Conductor'
import type { Ruta } from '@/models/horarios/Ruta'
import { NotificacionService } from './NotificacionService'
import { ValidadorRecursos } from './ValidadorRecursos'

export class HorarioService {
    private notificacion = new NotificacionService()
    private validador = new ValidadorRecursos()

    // Crea y persiste un horario a partir del DTO; la persistencia real la ejecuta HorarioRepository (D9)
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

    // Verifica que autobús y conductor estén disponibles y sin conflictos antes de asignar
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

    // La verificación real de conflictos de horario requiere consulta a BD (HorarioRepository)
    verificarConflictoHorario(fecha: Date, hora: Date): boolean {
        void fecha
        void hora
        return false
    }

    // D6: usa tarifaBase de la ruta; el repositorio provee la instancia de Ruta
    calcularPrecioViaje(ruta: Ruta): number {
        return ruta.getTarifaBase()
    }

    // Delega la notificación de asignación al conductor vía NotificacionService
    notificarConductor(conductorID: string, horario: Horario): void {
        this.notificacion.notificarAsignacion(conductorID, horario.getHorarioID())
    }

    // Registra la acción en LogAuditoria; el repositorio persiste en BD (D9)
    registrarEnLog(accion: string): void {
        void accion
    }

    // D7: orquesta el flujo completo de programación siguiendo los pasos 4-10 del diagrama de secuencia
    solicitarProgramacion(datos: HorarioDTO): string {
        const disponible = this.verificarDisponibilidadRecursos(
            datos.autobusID,
            datos.conductorID,
            datos.fechaInicio,
            datos.horaSalida
        )
        if (!disponible) return 'E1: recursos no disponibles'

        const horario = this.programarHorario(datos)
        this.notificarConductor(datos.conductorID, horario)
        this.registrarEnLog(`Horario programado exitosamente. ID: ${horario.getHorarioID()}`)
        return horario.getHorarioID()
    }
}
