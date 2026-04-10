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

    getPasajeroID(): string { return this.pasajeroID }
    getNumero(): string { return this.numero }
    getNombre(): string { return this.nombre }
    getDocumento(): string { return this.documento }

    obtenerInfo(): string {
        return `${this.nombre} — Doc: ${this.documento} — #${this.numero}`
    }
}
