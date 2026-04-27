// D1 CU3 — Conductor como recurso asignable a un horario; la gestión completa es CU6 Administración de Conductores
export type EstadoConductor = 'Activo' | 'NoDisponible' | 'Inactivo'

// Límite legal de horas continuas por jornada para conductores de autobús (D2)
const LIMITE_HORAS_JORNADA = 8

export class Conductor {
    private conductorID: string
    private nombreCompleto: string
    private licencia: string
    private vigenciaLicencia: Date
    private telefono: string
    private disponible: boolean
    private horasAcumuladas: number
    private estado: EstadoConductor

    constructor(
        conductorID: string,
        nombreCompleto: string,
        licencia: string,
        vigenciaLicencia: Date,
        telefono: string,
        disponible: boolean,
        horasAcumuladas: number,
        estado: EstadoConductor = 'Activo'
    ) {
        this.conductorID = conductorID
        this.nombreCompleto = nombreCompleto
        this.licencia = licencia
        this.vigenciaLicencia = vigenciaLicencia
        this.telefono = telefono
        this.disponible = disponible
        this.horasAcumuladas = horasAcumuladas
        this.estado = estado
    }

    getConductorID(): string { return this.conductorID }
    getNombreCompleto(): string { return this.nombreCompleto }
    getLicencia(): string { return this.licencia }
    getVigenciaLicencia(): Date { return this.vigenciaLicencia }
    getTelefono(): string { return this.telefono }
    getDisponible(): boolean { return this.disponible }
    getHorasAcumuladas(): number { return this.horasAcumuladas }
    getEstado(): EstadoConductor { return this.estado }

    // La verificación de conflictos reales (viajes en esa fecha/hora) la ejecuta ValidadorRecursos
    estaDisponible(fecha: Date, hora: Date): boolean {
        void fecha
        void hora
        return this.estado === 'Activo' && this.disponible && this.tieneLicenciaVigente() && !this.excededHoras(0)
    }

    tieneLicenciaVigente(): boolean {
        return this.vigenciaLicencia > new Date()
    }

    // D4: recibe duración a agregar para verificar si excedería el límite antes de asignar
    // Nombre del diagrama: excededHoras (mezcla español/inglés — ver correcciones D4)
    excededHoras(duracion: number): boolean {
        return this.horasAcumuladas + duracion > LIMITE_HORAS_JORNADA
    }

    // D4: reemplaza asignar() de D2 con firma explícita; cambia estado a NoDisponible al ser asignado
    asignarAHorario(horarioID: string): void {
        void horarioID
        this.disponible = false
        this.estado = 'NoDisponible'
    }

    // D4: stub — la notificación real la envía NotificacionService (colaboración externa)
    recibirNotificacion(msg: string): void {
        void msg
    }
}
