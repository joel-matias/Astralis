// Parada dentro de una ruta tipo ConParadas — gestionada por GestorParadas y agregada a Ruta
export class ParadaIntermedia {
    private paradaID: string
    private rutaID: string
    private nombreParada: string
    private ciudad: string
    private ordenEnRuta: number
    private distanciaDesdeOrigen: number
    private tiempoDesdeOrigen: number
    private tiempoEsperaMin: number
    private tarifaDesdeOrigen: number

    constructor(
        paradaID: string,
        rutaID: string,
        nombreParada: string,
        ciudad: string,
        ordenEnRuta: number,
        distanciaDesdeOrigen: number,
        tiempoDesdeOrigen: number,
        tiempoEsperaMin: number,
        tarifaDesdeOrigen: number
    ) {
        this.paradaID = paradaID
        this.rutaID = rutaID
        this.nombreParada = nombreParada
        this.ciudad = ciudad
        this.ordenEnRuta = ordenEnRuta
        this.distanciaDesdeOrigen = distanciaDesdeOrigen
        this.tiempoDesdeOrigen = tiempoDesdeOrigen
        this.tiempoEsperaMin = tiempoEsperaMin
        this.tarifaDesdeOrigen = tarifaDesdeOrigen
    }

    getParadaID(): string { return this.paradaID }
    getRutaID(): string { return this.rutaID }
    getNombreParada(): string { return this.nombreParada }
    getCiudad(): string { return this.ciudad }
    getOrdenEnRuta(): number { return this.ordenEnRuta }
    getDistanciaDesdeOrigen(): number { return this.distanciaDesdeOrigen }
    getTiempoDesdeOrigen(): number { return this.tiempoDesdeOrigen }
    getTiempoEsperaMin(): number { return this.tiempoEsperaMin }
    getTarifaDesdeOrigen(): number { return this.tarifaDesdeOrigen }

    // GestorParadas llama validar() para filtrar paradas incompletas antes de agregarlas a Ruta
    validar(): boolean {
        return (
            this.nombreParada.trim().length > 0 &&
            this.ciudad.trim().length > 0 &&
            this.ordenEnRuta > 0 &&
            this.distanciaDesdeOrigen >= 0 &&
            this.tiempoDesdeOrigen >= 0 &&
            this.tiempoEsperaMin >= 0 &&
            this.tarifaDesdeOrigen >= 0
        )
    }

    // La persistencia real la ejecuta RepositorioRutas al guardar la ruta completa
    agregarALista(): void {}

    // Calcula la tarifa parcial desde el origen; si no tiene tarifa propia usa el 50% de la base
    calcularTarifa(base: number): number {
        if (base <= 0) return 0
        return +(this.tarifaDesdeOrigen || base * 0.5).toFixed(2)
    }

    // Permite reubicar la parada en la lista; Ruta.agregarParada() reordena automáticamente después
    moverOrden(nuevo: number): void {
        if (nuevo > 0) this.ordenEnRuta = nuevo
    }
}
