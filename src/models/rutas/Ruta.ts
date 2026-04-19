import type { RutaDTO } from './RutaDTO'
import type { ParadaIntermedia } from './ParadaIntermedia'

export type TipoRuta = 'Directa' | 'ConParadas'
export type EstadoRuta = 'Activa' | 'Inactiva'

// Entidad principal del caso de uso Crear Ruta — almacena la configuración completa del trayecto
export class Ruta {
    private rutaID: string
    private codigoRuta: string
    private nombreRuta: string
    private ciudadOrigen: string
    private terminalOrigen: string
    private ciudadDestino: string
    private terminalDestino: string
    private distanciaKm: number
    private tiempoEstimadoHrs: number
    private tipoRuta: TipoRuta
    private tarifaBase: number
    private estado: EstadoRuta
    private fechaCreacion: Date
    private paradas: ParadaIntermedia[] // lista ordenada gestionada por agregarParada()

    constructor(
        rutaID: string,
        codigoRuta: string,
        nombreRuta: string,
        ciudadOrigen: string,
        terminalOrigen: string,
        ciudadDestino: string,
        terminalDestino: string,
        distanciaKm: number,
        tiempoEstimadoHrs: number,
        tipoRuta: TipoRuta,
        tarifaBase: number,
        estado: EstadoRuta,
        fechaCreacion: Date = new Date(),
        paradas: ParadaIntermedia[] = []
    ) {
        this.rutaID = rutaID
        this.codigoRuta = codigoRuta
        this.nombreRuta = nombreRuta
        this.ciudadOrigen = ciudadOrigen
        this.terminalOrigen = terminalOrigen
        this.ciudadDestino = ciudadDestino
        this.terminalDestino = terminalDestino
        this.distanciaKm = distanciaKm
        this.tiempoEstimadoHrs = tiempoEstimadoHrs
        this.tipoRuta = tipoRuta
        this.tarifaBase = tarifaBase
        this.estado = estado
        this.fechaCreacion = fechaCreacion
        this.paradas = paradas
    }

    getRutaID(): string { return this.rutaID }
    getCodigoRuta(): string { return this.codigoRuta }
    getNombreRuta(): string { return this.nombreRuta }
    getCiudadOrigen(): string { return this.ciudadOrigen }
    getTerminalOrigen(): string { return this.terminalOrigen }
    getCiudadDestino(): string { return this.ciudadDestino }
    getTerminalDestino(): string { return this.terminalDestino }
    getDistanciaKm(): number { return this.distanciaKm }
    getTiempoEstimadoHrs(): number { return this.tiempoEstimadoHrs }
    getTipoRuta(): TipoRuta { return this.tipoRuta }
    getTarifaBase(): number { return this.tarifaBase }
    getEstado(): EstadoRuta { return this.estado }
    getFechaCreacion(): Date { return this.fechaCreacion }

    // Valida que los datos mínimos del formulario sean suficientes para crear la ruta
    crear(datos: RutaDTO): boolean {
        return (
            datos.ciudadOrigen.trim().length > 0 &&
            datos.ciudadDestino.trim().length > 0 &&
            datos.distanciaKm > 0 &&
            datos.tarifaBase > 0
        )
    }

    // Valida la integridad completa de la instancia antes de persistir
    validarDatos(): boolean {
        return (
            this.codigoRuta.trim().length > 0 &&
            this.nombreRuta.trim().length > 0 &&
            this.ciudadOrigen.trim().length > 0 &&
            this.ciudadDestino.trim().length > 0 &&
            this.ciudadOrigen !== this.ciudadDestino &&
            this.distanciaKm > 0 &&
            this.tarifaBase > 0
        )
    }

    // Compara origen y destino contra esta instancia para detectar si ya existe una ruta igual
    verificarDuplicado(origen: string, destino: string): boolean {
        return (
            this.ciudadOrigen.toLowerCase() === origen.trim().toLowerCase() &&
            this.ciudadDestino.toLowerCase() === destino.trim().toLowerCase()
        )
    }

    // Retorna la distancia almacenada; si APIMapas calculó un valor mayor, ControladorRutas lo reemplaza antes
    calcularDistancia(): number {
        return this.distanciaKm
    }

    // Agrega una parada validada y reordena la lista por ordenEnRuta
    agregarParada(p: ParadaIntermedia): void {
        if (p.validar()) {
            this.paradas.push(p)
            this.paradas.sort((a, b) => a.getOrdenEnRuta() - b.getOrdenEnRuta())
        }
    }

    // Cambia el estado de la ruta; activar() habilita que pueda asignársele horarios
    activar(): void { this.estado = 'Activa' }
    desactivar(): void { this.estado = 'Inactiva' }

    // Retorna copia de la lista para que ControladorRutas arme los datosCompletos antes de guardar
    getParadas(): ParadaIntermedia[] { return [...this.paradas] }
}
