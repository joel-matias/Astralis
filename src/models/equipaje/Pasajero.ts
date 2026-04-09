/**
 * CU8 — Gestión de Equipaje
 * Clase: Pasajero
 *
 * Responsabilidades (diagrama):
 * - Estar registrado en el sistema con boleto válido
 * - Contar con un boleto para asociarse al equipaje
 * - Asociarse al equipaje registrado
 *
 * Posee: Boleto (1..*)
 * Pertenece a: Equipaje (0..*)
 */

export class Pasajero {
    private pasajeroID: string
    private numero: string       // número de pasajero en el viaje
    private nombre: string
    private documento: string    // identificación oficial

    constructor(
        pasajeroID: string,
        numero: string,
        nombre: string,
        documento: string
    ) {
        this.pasajeroID = pasajeroID
        this.numero = numero
        this.nombre = nombre
        this.documento = documento
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    getPasajeroID(): string { return this.pasajeroID }
    getNumero(): string { return this.numero }
    getNombre(): string { return this.nombre }
    getDocumento(): string { return this.documento }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Retorna los datos del pasajero como cadena legible para mostrar en pantalla.
     * Diagrama: + obtenerInfo() : String
     */
    obtenerInfo(): string {
        return `${this.nombre} — Doc: ${this.documento} — #${this.numero}`
    }
}
