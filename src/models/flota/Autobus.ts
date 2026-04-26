import { TipoServicio, EstadoAutobus } from '@prisma/client'

// D1: TipoAutobus (Ejecutivo | Primera | Económico) → mapeado a TipoServicio de Prisma
export { TipoServicio as TipoAutobus, EstadoAutobus }

// D1, D4, D5 — Clase Autobus
export class Autobus {
    private autobusID: string
    private numeroEconomico: string    // D1: único
    private placas: string             // D1: único
    private vin: string                // D1: único, 17 caracteres
    private marca: string
    private modelo: string
    private anio: number               // D1: int
    private capacidadAsientos: number  // D1: int, > 8
    private tipoAutobus: TipoServicio  // D1: TipoAutobus (Ejecutivo|Primera|Económico)
    private estado: EstadoAutobus      // D6: Disponible|Asignado|EnMantenimiento|FueraDeServicio
    private fechaRegistro: Date

    constructor(
        autobusID: string,
        numeroEconomico: string,
        placas: string,
        vin: string,
        marca: string,
        modelo: string,
        anio: number,
        capacidadAsientos: number,
        tipoAutobus: TipoServicio,
        estado: EstadoAutobus = EstadoAutobus.DISPONIBLE,
        fechaRegistro: Date = new Date()
    ) {
        this.autobusID = autobusID
        this.numeroEconomico = numeroEconomico
        this.placas = placas
        this.vin = vin
        this.marca = marca
        this.modelo = modelo
        this.anio = anio
        this.capacidadAsientos = capacidadAsientos
        this.tipoAutobus = tipoAutobus
        this.estado = estado
        this.fechaRegistro = fechaRegistro
    }

    getAutobusID(): string { return this.autobusID }
    getNumeroEconomico(): string { return this.numeroEconomico }
    getPlacas(): string { return this.placas }
    getVin(): string { return this.vin }
    getMarca(): string { return this.marca }
    getModelo(): string { return this.modelo }
    getAnio(): number { return this.anio }
    getCapacidadAsientos(): number { return this.capacidadAsientos }
    getTipoAutobus(): TipoServicio { return this.tipoAutobus }
    getEstado(): EstadoAutobus { return this.estado }
    getFechaRegistro(): Date { return this.fechaRegistro }

    // D4, D3 — valida que el mapa de datos contenga los campos mínimos requeridos
    registrarse(datos: Map<string, unknown>): boolean {
        return (
            datos.has('numeroEconomico') &&
            datos.has('placas') &&
            datos.has('vin') &&
            datos.has('capacidadAsientos')
        )
    }

    // D4 — actualiza campos modificables del autobús
    actualizarDatosAutobus(datos: Map<string, unknown>): boolean {
        if (datos.has('marca')) this.marca = datos.get('marca') as string
        if (datos.has('modelo')) this.modelo = datos.get('modelo') as string
        if (datos.has('capacidadAsientos')) this.capacidadAsientos = datos.get('capacidadAsientos') as number
        if (datos.has('tipoAutobus')) this.tipoAutobus = datos.get('tipoAutobus') as TipoServicio
        return true
    }

    // D4, D6 — aplica regla: ASIGNADO no puede pasar a EN_MANTENIMIENTO ni FUERA_DE_SERVICIO
    cambiarEstadoNuevoEstado(estado: EstadoAutobus): boolean {
        if (
            this.estado === EstadoAutobus.ASIGNADO &&
            (estado === EstadoAutobus.EN_MANTENIMIENTO || estado === EstadoAutobus.FUERA_DE_SERVICIO)
        ) {
            return false
        }
        this.estado = estado
        return true
    }

    // D4 — retorna true si estado === DISPONIBLE
    verificarEstadoDisponible(): boolean {
        return this.estado === EstadoAutobus.DISPONIBLE
    }

    // D4 — cambia estado a ASIGNADO (true) o DISPONIBLE (false) al asignar/liberar viaje
    establecerEnTransporte(val: boolean): void {
        this.estado = val ? EstadoAutobus.ASIGNADO : EstadoAutobus.DISPONIBLE
    }

    // D4 — da de baja el autobús: estado → FUERA_DE_SERVICIO
    registrarBajaAutobus(): void {
        this.estado = EstadoAutobus.FUERA_DE_SERVICIO
    }

    // D4 — retorna true si estado === ASIGNADO
    estaAsignado(): boolean {
        return this.estado === EstadoAutobus.ASIGNADO
    }

    // Auxiliar usado internamente por AsignacionAutobusViaje y Mantenimiento
    estaDisponible(): boolean {
        return this.estado === EstadoAutobus.DISPONIBLE
    }

    // Auxiliar para regresar a DISPONIBLE (D7: establecerEstadoDisponible)
    establecerDisponible(): void {
        this.estado = EstadoAutobus.DISPONIBLE
    }
}
