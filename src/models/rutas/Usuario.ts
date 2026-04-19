import { Ruta } from './Ruta'

export class Usuario {
    private usuarioID: string
    private nombreCompleto: string
    private rolID: string

    constructor(usuarioID: string, nombreCompleto: string, rolID: string) {
        this.usuarioID = usuarioID
        this.nombreCompleto = nombreCompleto
        this.rolID = rolID
    }

    getUsuarioID(): string { return this.usuarioID }
    getNombreCompleto(): string { return this.nombreCompleto }
    getRolID(): string { return this.rolID }

    crearRuta(datos: Record<string, unknown>): Ruta {
        return new Ruta(
            datos.rutaID as string,
            datos.codigoRuta as string,
            datos.nombreRuta as string,
            datos.ciudadOrigen as string,
            datos.terminalOrigen as string,
            datos.ciudadDestino as string,
            datos.terminalDestino as string,
            datos.distanciaKm as number,
            datos.tiempoEstimadoHrs as number,
            datos.tipoRuta as 'Directa' | 'ConParadas',
            datos.tarifaBase as number,
            datos.estado as 'Activa' | 'Inactiva',
            datos.fechaCreacion as Date ?? new Date()
        )
    }
}
