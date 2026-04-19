// D1 CU4 — Pasajero que adquiere uno o más boletos
export class Cliente {
    // D1: nombre, edad (Integer→number), email
    private nombre: string
    private edad: number
    private email: string

    constructor(nombre: string, edad: number, email: string) {
        this.nombre = nombre
        this.edad = edad
        this.email = email
    }

    getNombre(): string { return this.nombre }
    getEdad(): number { return this.edad }
    getEmail(): string { return this.email }

    // D1: stubs — interacción capturada por la UI del POS
    proporcionarDatos(): void {}
    seleccionarFormaPago(): void {}
}
