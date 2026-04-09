/**
 * CU6 — Administración de Conductores
 * Clase: Conductor
 *
 * Responsabilidades (diagrama M6CU):
 * - Almacenar información personal y laboral del conductor
 * - Mantener registro de CURP y licencia
 * - Controlar vigencia de licencia
 * - Permitir cambio de estado operativo
 * - Validar unicidad de identificadores
 * - Registrar motivo de baja
 *
 * Colabora con: AsignacionConductorViaje, ValidadorDatos, LogAuditoria
 * También referenciado en: CU3 (Horarios), CU5 (Flota)
 */

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

    // ── Getters ──────────────────────────────────────────────────────────────
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

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Registra los datos del conductor desde el formulario de alta.
     * Diagrama M6CU: + registraDatos(datos: Map) : Boolean
     */
    registraDatos(datos: Map<string, unknown>): boolean {
        return (
            datos.has('nombreCompleto') &&
            datos.has('CURP') &&
            datos.has('numeroLicencia') &&
            datos.has('vigenciaLicencia')
        )
    }

    /**
     * Actualiza los datos laborales del conductor.
     * Diagrama M6CU: + actualizarDatos(datosNuevos: Map) : Boolean
     */
    actualizarDatos(datosNuevos: Map<string, unknown>): boolean {
        if (datosNuevos.has('domicilio')) this.domicilio = datosNuevos.get('domicilio') as string
        if (datosNuevos.has('numeroTelefonico')) this.numeroTelefonico = datosNuevos.get('numeroTelefonico') as string
        if (datosNuevos.has('vigenciaLicencia')) this.vigenciaLicencia = datosNuevos.get('vigenciaLicencia') as Date
        return true
    }

    /**
     * Registra la baja del conductor con un motivo justificado.
     * Diagrama M6CU: + darDeBaja(motivo: String) : Boolean
     * Regla: No puede darse de baja si tiene viaje activo.
     */
    darDeBaja(motivo: string): boolean {
        if (this.estado === EstadoConductor.NO_DISPONIBLE) return false
        this.motivoBaja = motivo
        this.estado = EstadoConductor.INACTIVO
        return true
    }

    /**
     * Cambia el estado operativo del conductor.
     * Diagrama M6CU: + cambiarEstado(nuevoEstado: EstadoConductor) : Boolean
     * Regla: No puede pasar a Inactivo/Baja si tiene viaje activo.
     */
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

    /**
     * Verifica que la licencia de conducir no haya expirado.
     * Diagrama M6CU: + verificarLicenciaVigente() : Boolean
     */
    verificarLicenciaVigente(): boolean {
        return this.vigenciaLicencia > new Date()
    }

    /**
     * Verifica que el conductor esté en estado Activo.
     * Diagrama M6CU: + verificarEstadoActivo() : void
     */
    verificarEstadoActivo(): void {
        // Lanza excepción o señal si no está activo — ver servicio
    }

    /**
     * Establece el estado a Activo (reactivación).
     * Diagrama M6CU: + establecerEstadoActivo() : void
     */
    establecerEstadoActivo(): void {
        if (this.verificarLicenciaVigente()) {
            this.estado = EstadoConductor.ACTIVO
        }
    }

    /**
     * Registra el motivo por el cual el conductor queda activo/reactivado.
     * Diagrama M6CU: + registrarMotivoBajaActivo(motivo: String) : void
     */
    registrarMotivoBajaActivo(motivo: string): void {
        this.motivoBaja = motivo
    }

    /**
     * Guarda el estado anterior para auditoría antes de un cambio.
     * Diagrama M6CU: + registrarEstadoAnterior() : void
     */
    registrarEstadoAnterior(): void {
        // LogAuditoria registra el estado anterior
    }

    /**
     * Retorna true si el conductor está en estado Activo.
     * Diagrama M6CU: + esActivo() : Boolean
     */
    esActivo(): boolean {
        return this.estado === EstadoConductor.ACTIVO
    }

    /**
     * Verifica disponibilidad del conductor para una fecha dada.
     * Diagrama CU3: + estaDisponible(fecha, hora, tiempo) : Boolean
     */
    estaDisponible(): boolean {
        return this.esActivo() && this.verificarLicenciaVigente()
    }

    /**
     * Recibe notificación de asignación a un horario.
     * Diagrama CU3: + recibirNotificacion(msg: String) : void
     */
    recibirNotificacion(msg: string): void {
        // NotificacionService.enviarNotificacion(this.conductorID, msg)
        void msg
    }
}
