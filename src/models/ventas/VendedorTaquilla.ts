export class VendedorTaquilla {
    private id: string
    private nombre: string
    private turno: string

    constructor(id: string, nombre: string, turno: string) {
        this.id = id
        this.nombre = nombre
        this.turno = turno
    }

    getId(): string { return this.id }
    getNombre(): string { return this.nombre }
    getTurno(): string { return this.turno }

    iniciarSesion(): boolean {
        return this.id.length > 0 && this.turno.length > 0
    }

    seleccionarViaje(): void {
        // Delega a ModuloPOS.mostrarBuscador()
    }

    procesarVenta(): void {
        // Delega a ModuloPOS.confirmarVenta()
    }

    entregarBoleto(): void {
        // Delega a EmisorBoletos y GestorFiscal
    }
}
