export class NotificacionService {

    enviarNotificacion(dest: string, msg: string): void {
        // ServicioSMTP.send(dest, msg) — integración externa
        void dest; void msg
    }

    notificarAsignacion(conductorID: string, horarioID: string): void {
        const msg = `Tienes una nueva asignación. Horario: ${horarioID}`
        this.enviarNotificacion(conductorID, msg)
    }
}
