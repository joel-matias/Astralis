/**
 * CU4 — Venta de Boletos (POS)
 * Clase: Cliente
 *
 * Responsabilidades (diagrama):
 * - Proporcionar datos personales para el boleto
 * - Seleccionar forma de pago
 *
 * Adquiere: Boleto (0..*)
 */

export class Cliente {
    private nombre: string
    private edad: number
    private usuario: string
    private email: string

    constructor(nombre: string, edad: number, usuario: string, email: string) {
        this.nombre = nombre
        this.edad = edad
        this.usuario = usuario
        this.email = email
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    getNombre(): string { return this.nombre }
    getEdad(): number { return this.edad }
    getUsuario(): string { return this.usuario }
    getEmail(): string { return this.email }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Proporciona los datos del cliente para el registro del boleto.
     * Diagrama: + proporcionarDatos() : void
     */
    proporcionarDatos(): void {
        // El formulario del POS captura nombre, edad, email del cliente
    }

    /**
     * El cliente selecciona la forma de pago (TPV o efectivo).
     * Diagrama: + seleccionarFormaPago() : void
     */
    seleccionarFormaPago(): void {
        // Delega a ProcesadorPago con el método elegido
    }
}
