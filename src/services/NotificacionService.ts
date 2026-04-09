/**
 * CU3 — Programación de Horarios y Viajes
 * Clase: NotificacionService  «SERVICE»
 *
 * Diagrama de Dependencias (CU3):
 * + enviarNotificacion(dest, msg) : void
 * + notificarAsignacion(conductorID) : void
 *
 * Envía notificaciones asíncronas al conductor cuando se le asigna un horario.
 * Integra con ServicioSMTP (externo).
 */

export class NotificacionService {

    /**
     * Envía una notificación genérica al destinatario indicado.
     * Diagrama CU3: + enviarNotificacion(dest, msg) : void
     */
    enviarNotificacion(dest: string, msg: string): void {
        // ServicioSMTP.send(dest, msg) — integración externa
        void dest; void msg
    }

    /**
     * Notifica al conductor que ha sido asignado a un horario de viaje.
     * Diagrama CU3: + notificarAsignacion(conductorID) : void
     */
    notificarAsignacion(conductorID: string, horarioID: string): void {
        const msg = `Tienes una nueva asignación. Horario: ${horarioID}`
        this.enviarNotificacion(conductorID, msg)
    }
}
