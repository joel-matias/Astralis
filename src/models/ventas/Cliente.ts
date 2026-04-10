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

    getNombre(): string { return this.nombre }
    getEdad(): number { return this.edad }
    getUsuario(): string { return this.usuario }
    getEmail(): string { return this.email }

    proporcionarDatos(): void {
        // El formulario del POS captura nombre, edad, email del cliente
    }

    seleccionarFormaPago(): void {
        // Delega a ProcesadorPago con el método elegido
    }
}
