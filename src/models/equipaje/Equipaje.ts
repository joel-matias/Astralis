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

    getEquipajeID(): string { return this.equipajeID }
    getCantidadPiezas(): number { return this.cantidadPiezas }
    getNombre(): string { return this.nombre }
    getTipoEquipaje(): string { return this.tipoEquipaje }
    getPesoAproximado(): number { return this.pesoAproximado }
    getObservaciones(): string { return this.observaciones }

    guardar(): void {
        // RepositorioEquipaje.persistirEquipaje(this)
    }

    cancelar(): void {
        // LogAuditoria.registrarCancelacion(this.equipajeID)
    }

    validarDatos(): boolean {
        return (
            this.cantidadPiezas > 0 &&
            this.nombre.trim().length > 0 &&
            this.tipoEquipaje.trim().length > 0 &&
            this.pesoAproximado > 0
        )
    }
}
