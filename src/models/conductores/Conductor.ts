import { EstadoConductor } from '@prisma/client'

export class Conductor {
    private conductorID: string
    private nombreCompleto: string
    private domicilio: string
    private CURP: string
    private numeroLicencia: string
    private vigenciaLicencia: Date
    private numeroTelefonico: string
    private estado: EstadoConductor
    private fechaRegistro: Date
    private motivoBaja: string | null

    constructor(
        conductorID: string,
        nombreCompleto: string,
        domicilio: string,
        CURP: string,
        numeroLicencia: string,
        vigenciaLicencia: Date,
        numeroTelefonico: string,
        estado: EstadoConductor = EstadoConductor.ACTIVO,
        fechaRegistro: Date = new Date(),
        motivoBaja: string | null = null
    ) {
        this.conductorID = conductorID
        this.nombreCompleto = nombreCompleto
        this.domicilio = domicilio
        this.CURP = CURP
        this.numeroLicencia = numeroLicencia
        this.vigenciaLicencia = vigenciaLicencia
        this.numeroTelefonico = numeroTelefonico
        this.estado = estado
        this.fechaRegistro = fechaRegistro
        this.motivoBaja = motivoBaja
    }

    getConductorID(): string { return this.conductorID }
    getNombreCompleto(): string { return this.nombreCompleto }
    getDomicilio(): string { return this.domicilio }
    getCURP(): string { return this.CURP }
    getNumeroLicencia(): string { return this.numeroLicencia }
    getVigenciaLicencia(): Date { return this.vigenciaLicencia }
    getNumeroTelefonico(): string { return this.numeroTelefonico }
    getEstado(): EstadoConductor { return this.estado }
    getFechaRegistro(): Date { return this.fechaRegistro }
    getMotivoBaja(): string | null { return this.motivoBaja }

    registraDatos(datos: Map<string, unknown>): boolean {
        return (
            datos.has('nombreCompleto') &&
            datos.has('CURP') &&
            datos.has('numeroLicencia') &&
            datos.has('vigenciaLicencia')
        )
    }

    actualizarDatos(datosNuevos: Map<string, unknown>): boolean {
        if (datosNuevos.has('domicilio')) this.domicilio = datosNuevos.get('domicilio') as string
        if (datosNuevos.has('numeroTelefonico')) this.numeroTelefonico = datosNuevos.get('numeroTelefonico') as string
        if (datosNuevos.has('vigenciaLicencia')) this.vigenciaLicencia = datosNuevos.get('vigenciaLicencia') as Date
        return true
    }

    // Regla: no puede darse de baja si tiene viaje activo
    darDeBaja(motivo: string): boolean {
        if (this.estado === EstadoConductor.NO_DISPONIBLE) return false
        this.motivoBaja = motivo
        this.estado = EstadoConductor.INACTIVO
        return true
    }

    cambiarEstado(nuevoEstado: EstadoConductor): boolean {
        if (this.estado === EstadoConductor.NO_DISPONIBLE &&
            nuevoEstado === EstadoConductor.INACTIVO) {
            return false  // Debe reasignarse primero
        }
        if (nuevoEstado === EstadoConductor.ACTIVO && !this.verificarLicenciaVigente()) {
            return false  // No se reactiva con licencia vencida
        }
        this.estado = nuevoEstado
        return true
    }

    verificarLicenciaVigente(): boolean {
        return this.vigenciaLicencia > new Date()
    }

    verificarEstadoActivo(): void {
        // Lanza excepción o señal si no está activo — ver servicio
    }

    establecerEstadoActivo(): void {
        if (this.verificarLicenciaVigente()) {
            this.estado = EstadoConductor.ACTIVO
        }
    }

    registrarMotivoBajaActivo(motivo: string): void {
        this.motivoBaja = motivo
    }

    registrarEstadoAnterior(): void {
        // LogAuditoria registra el estado anterior
    }

    esActivo(): boolean {
        return this.estado === EstadoConductor.ACTIVO
    }

    estaDisponible(): boolean {
        return this.esActivo() && this.verificarLicenciaVigente()
    }

    recibirNotificacion(msg: string): void {
        // NotificacionService.enviarNotificacion(this.conductorID, msg)
        void msg
    }
}
