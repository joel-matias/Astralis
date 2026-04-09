/**
 * CU8 — Gestión de Equipaje
 * Clase: EncargadoEquipaje
 *
 * Responsabilidades (diagrama):
 * - Solicitar registro de equipaje
 * - Seleccionar viaje y pasajero
 * - Ingresar datos del equipaje
 * - Confirmar o cancelar el registro
 *
 * Registra: Equipaje (0..*)
 */

export class EncargadoEquipaje {
    private encargadoID: string
    private nombre: string
    private usuario: string

    constructor(encargadoID: string, nombre: string, usuario: string) {
        this.encargadoID = encargadoID
        this.nombre = nombre
        this.usuario = usuario
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    getEncargadoID(): string { return this.encargadoID }
    getNombre(): string { return this.nombre }
    getUsuario(): string { return this.usuario }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Autentica al encargado en el sistema de equipaje.
     * Diagrama: + login() : Boolean
     */
    login(): boolean {
        return this.usuario.length > 0
    }

    /**
     * Inicia el flujo de registro de equipaje.
     * Diagrama: + solicitarRegistro() : void
     */
    solicitarRegistro(): void {
        // ControladorEquipaje.obtenerViajesActivos()
    }

    /**
     * Cancela el registro en curso antes de confirmarlo.
     * Diagrama: + cancelarRegistro() : void
     */
    cancelarRegistro(): void {
        // Equipaje.cancelar() + LogAuditoria.registrarCancelacion()
    }

    /**
     * Confirma y guarda el registro de equipaje.
     * Diagrama: + confirmarRegistro() : void
     */
    confirmarRegistro(): void {
        // Equipaje.guardar() + LogAuditoria.registrarAccion()
    }
}
