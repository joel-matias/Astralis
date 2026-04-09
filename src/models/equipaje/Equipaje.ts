/**
 * CU8 — Gestión de Equipaje
 * Clase: Equipaje
 *
 * Responsabilidades (diagrama):
 * - Almacenar datos del equipaje del pasajero
 * - Asociarse a un único pasajero y viaje
 * - Validar que los datos estén completos
 * - Permitir su cancelación antes de guardar
 *
 * Pertenece a: Pasajero (0..*)
 * Genera: LogAuditoria (1)
 */

export class Equipaje {
    private equipajeID: string
    private cantidadPiezas: number
    private nombre: string              // descripción del equipaje
    private tipoEquipaje: string        // 'Maleta' | 'Mochila' | 'Caja' | etc.
    private pesoAproximado: number      // kg
    private observaciones: string

    constructor(
        equipajeID: string,
        cantidadPiezas: number,
        nombre: string,
        tipoEquipaje: string,
        pesoAproximado: number,
        observaciones: string = ''
    ) {
        this.equipajeID = equipajeID
        this.cantidadPiezas = cantidadPiezas
        this.nombre = nombre
        this.tipoEquipaje = tipoEquipaje
        this.pesoAproximado = pesoAproximado
        this.observaciones = observaciones
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    getEquipajeID(): string { return this.equipajeID }
    getCantidadPiezas(): number { return this.cantidadPiezas }
    getNombre(): string { return this.nombre }
    getTipoEquipaje(): string { return this.tipoEquipaje }
    getPesoAproximado(): number { return this.pesoAproximado }
    getObservaciones(): string { return this.observaciones }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Persiste el registro de equipaje en la base de datos.
     * Diagrama: + guardar() : void
     */
    guardar(): void {
        // RepositorioEquipaje.persistirEquipaje(this)
    }

    /**
     * Cancela el registro de equipaje antes de ser persistido.
     * Diagrama: + cancelar() : void
     */
    cancelar(): void {
        // LogAuditoria.registrarCancelacion(this.equipajeID)
    }

    /**
     * Valida que los datos del equipaje sean completos y coherentes.
     * Diagrama: + validarDatos() : Boolean
     */
    validarDatos(): boolean {
        return (
            this.cantidadPiezas > 0 &&
            this.nombre.trim().length > 0 &&
            this.tipoEquipaje.trim().length > 0 &&
            this.pesoAproximado > 0
        )
    }
}
