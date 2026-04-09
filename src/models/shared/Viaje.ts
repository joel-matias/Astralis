/**
 * Clase compartida — Viaje
 * Referenciada en: CU3 (Horarios), CU4 (Ventas), CU5 (Flota),
 *                  CU6 (Conductores), CU7 (Andenes), CU8 (Equipaje)
 *
 * Almacena la información de ruta y horario de un viaje programado.
 * Es el nexo central del sistema que vincula autobus, conductor,
 * pasajeros, andén y equipaje.
 */

export class Viaje {
    private viajeID: string
    private rutaID: string
    private origen: string
    private destino: string
    private fechaHoraSalida: Date
    private duracionEstimada: number     // minutos
    private precioBase: number
    private estado: string               // 'Activo' | 'Programado' | 'Cancelado' | 'Completado'

    constructor(
        viajeID: string,
        rutaID: string,
        origen: string,
        destino: string,
        fechaHoraSalida: Date,
        duracionEstimada: number,
        precioBase: number,
        estado: string = 'Programado'
    ) {
        this.viajeID = viajeID
        this.rutaID = rutaID
        this.origen = origen
        this.destino = destino
        this.fechaHoraSalida = fechaHoraSalida
        this.duracionEstimada = duracionEstimada
        this.precioBase = precioBase
        this.estado = estado
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    getViajeID(): string { return this.viajeID }
    getRutaID(): string { return this.rutaID }
    getOrigen(): string { return this.origen }
    getDestino(): string { return this.destino }
    getFechaHoraSalida(): Date { return this.fechaHoraSalida }
    getDuracionEstimada(): number { return this.duracionEstimada }
    getPrecioBase(): number { return this.precioBase }
    getEstado(): string { return this.estado }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Verifica si hay disponibilidad de asientos para el viaje.
     * Diagrama CU4: + buscarDisponibilidad() : Boolean
     */
    buscarDisponibilidad(): boolean {
        return this.estado === 'Programado' || this.estado === 'Activo'
    }

    /**
     * Calcula el total del viaje para N pasajeros.
     * Diagrama CU4: + calcularTotal(numPasajeros: Integer) : Double
     */
    calcularTotal(numPasajeros: number): number {
        return +(this.precioBase * numPasajeros).toFixed(2)
    }

    /**
     * Retorna la información completa del viaje como mapa de datos.
     * Diagrama CU5/CU6: + obtenerInfoViaje() : Map
     */
    obtenerInfoViaje(): Record<string, unknown> {
        return {
            viajeID: this.viajeID,
            rutaID: this.rutaID,
            origen: this.origen,
            destino: this.destino,
            fechaHoraSalida: this.fechaHoraSalida,
            duracionEstimada: this.duracionEstimada,
            precioBase: this.precioBase,
            estado: this.estado,
        }
    }

    /**
     * Verifica si el viaje está en curso (activo).
     * Diagrama CU5/CU6/CU7/CU8: + estaActivo() : Boolean
     */
    estaActivo(): boolean {
        return this.estado === 'Activo'
    }

    /**
     * Verifica si el viaje está programado pero aún no ha iniciado.
     * Diagrama CU5/CU6/CU7: + estaProgramado() : Boolean
     */
    estaProgramado(): boolean {
        return this.estado === 'Programado' && this.fechaHoraSalida > new Date()
    }

    /**
     * Retorna la lista de IDs de pasajeros registrados en el viaje.
     * Diagrama CU8: + obtenerPasajeros() : List
     * La lista real se consulta al repositorio; aquí se declara la firma.
     */
    obtenerPasajeros(): string[] {
        // Implementación real: RepositorioViajes.getPasajerosByViaje(this.viajeID)
        return []
    }
}
