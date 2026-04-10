export class ParadaIntermedia {
    private paradaID: string
    private rutaID: string
    private nombreParada: string
    private ciudad: string
    private ordenEnRuta: number
    private tiempoDesdeOrigen: number   // horas
    private tiempoEsperaMin: number     // minutos
    private tarifaDesdeOrigen: number

    constructor(
        paradaID: string,
        rutaID: string,
        nombreParada: string,
        ciudad: string,
        ordenEnRuta: number,
        tiempoDesdeOrigen: number,
        tiempoEsperaMin: number,
        tarifaDesdeOrigen: number
    ) {
        this.paradaID = paradaID
        this.rutaID = rutaID
        this.nombreParada = nombreParada
        this.ciudad = ciudad
        this.ordenEnRuta = ordenEnRuta
        this.tiempoDesdeOrigen = tiempoDesdeOrigen
        this.tiempoEsperaMin = tiempoEsperaMin
        this.tarifaDesdeOrigen = tarifaDesdeOrigen
    }

    getParadaID(): string { return this.paradaID }
    getRutaID(): string { return this.rutaID }
    getNombreParada(): string { return this.nombreParada }
    getCiudad(): string { return this.ciudad }
    getOrdenEnRuta(): number { return this.ordenEnRuta }
    getTiempoDesdeOrigen(): number { return this.tiempoDesdeOrigen }
    getTiempoEsperaMin(): number { return this.tiempoEsperaMin }
    getTarifaDesdeOrigen(): number { return this.tarifaDesdeOrigen }

    validar(): boolean {
        return (
            this.nombreParada.trim().length > 0 &&
            this.ciudad.trim().length > 0 &&
            this.ordenEnRuta > 0 &&
            this.tiempoDesdeOrigen >= 0 &&
            this.tiempoEsperaMin >= 0 &&
            this.tarifaDesdeOrigen >= 0
        )
    }

    agregarALista(lista: ParadaIntermedia[]): void {
        if (this.validar()) {
            lista.push(this)
        }
    }

    calcularTarifa(base: number): number {
        if (base <= 0) return 0
        return +(this.tarifaDesdeOrigen || base * 0.5).toFixed(2)
    }

    moverOrden(nuevoOrden: number): void {
        if (nuevoOrden > 0) {
            this.ordenEnRuta = nuevoOrden
        }
    }
}
