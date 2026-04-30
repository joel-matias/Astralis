// D1, D2, D3 CU6 — Entidad principal del caso de uso Administración de Conductores
import { EstadoConductor } from '@prisma/client'

export class Conductor {
    // D3: idConductor: int → String (UUID) en código
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

    // D3: registrarDatos — valida presencia de campos obligatorios en la instancia
    registrarDatos(): boolean {
        return !!(this.nombreCompleto && this.CURP && this.numeroLicencia && this.vigenciaLicencia)
    }

    // D3: actualizarDatosNuevos(Map): boolean
    actualizarDatosNuevos(datosNuevos: Map<string, unknown>): boolean {
        if (datosNuevos.has('domicilio')) this.domicilio = datosNuevos.get('domicilio') as string
        if (datosNuevos.has('numeroTelefonico')) this.numeroTelefonico = datosNuevos.get('numeroTelefonico') as string
        if (datosNuevos.has('vigenciaLicencia')) this.vigenciaLicencia = datosNuevos.get('vigenciaLicencia') as Date
        return true
    }

    // D3: darDeBajaMotivo(String): boolean — D5: bloquea si está AsignadoAViaje; permite desde Temporal
    darDeBajaMotivo(motivo: string): boolean {
        if (this.estado === EstadoConductor.NO_DISPONIBLE && this.motivoBaja === 'ASIGNADO_A_VIAJE') return false
        this.motivoBaja = motivo
        this.estado = EstadoConductor.INACTIVO
        return true
    }

    // D3, D5: cambiarEstado — respeta las reglas del diagrama de estados
    cambiarEstado(nuevoEstado: EstadoConductor): boolean {
        // D5: No puede pasar a Inactivo si está NO_DISPONIBLE (tiene viaje activo)
        if (this.estado === EstadoConductor.NO_DISPONIBLE && nuevoEstado === EstadoConductor.INACTIVO) {
            return false
        }
        // D5: No se permite reactivar si la licencia está vencida
        if (nuevoEstado === EstadoConductor.ACTIVO && !this.verificarLicenciaVigente()) {
            return false
        }
        this.estado = nuevoEstado
        return true
    }

    // D3: verificarLicenciaVigente(): boolean
    verificarLicenciaVigente(): boolean {
        return this.vigenciaLicencia > new Date()
    }

    // D3: verificarEstadoActivo(): boolean
    verificarEstadoActivo(): boolean {
        return this.estado === EstadoConductor.ACTIVO
    }

    // D3, D5: establecerEstadoActivo(): void — solo si licencia vigente
    establecerEstadoActivo(): void {
        if (this.verificarLicenciaVigente()) {
            this.estado = EstadoConductor.ACTIVO
        }
    }

    // D3: registrarMotivoDeBajaAnterior(String): void
    registrarMotivoDeBajaAnterior(motivo: string | null): void {
        this.motivoBaja = motivo
    }

    // D3: registrarEstadoAnterior(): void — NegAud registra el estado anterior en log
    registrarEstadoAnterior(): void {}

    // D3: esActivo(): boolean
    esActivo(): boolean {
        return this.estado === EstadoConductor.ACTIVO
    }
}
