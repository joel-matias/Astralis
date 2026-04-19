// D2 CU4 — Actor principal del POS; métodos renombrados respecto a D1 (más descriptivos)
export class VendedorTaquilla {
    // D1: id, nombre, turno
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

    // D2: responsabilidades del vendedor — orquestadas por SistemaVentas
    accederModuloPOS(): void {}
    buscarViajesDisponibles(): void {}
    seleccionarViajeYAsientos(): void {}
    solicitarFormaPago(): void {}
    entregarBoletosYComprobante(): void {}
}
