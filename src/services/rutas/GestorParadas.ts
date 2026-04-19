// Procesa y ordena las paradas intermedias cuando el tipo de ruta es ConParadas
import { ParadaIntermedia } from '@/models/rutas/ParadaIntermedia'

export interface DatosParada {
    nombreParada: string
    ciudad: string
    ordenEnRuta: number
    distanciaDesdeOrigenKm: number
    tiempoDesdeOrigen: number
    tiempoEsperaMin: number
    tarifaDesdeOrigen: number
}

export class GestorParadas {

    // Convierte los datos crudos del formulario en instancias validadas y ordenadas de ParadaIntermedia
    procesarParadas(listaParadas: DatosParada[]): ParadaIntermedia[] {
        const paradas = listaParadas.map(p =>
            new ParadaIntermedia(
                crypto.randomUUID(),
                '',
                p.nombreParada,
                p.ciudad,
                p.ordenEnRuta,
                p.distanciaDesdeOrigenKm,
                p.tiempoDesdeOrigen,
                p.tiempoEsperaMin,
                p.tarifaDesdeOrigen
            )
        )

        const validas = paradas.filter(p => p.validar())
        validas.sort((a, b) => a.getOrdenEnRuta() - b.getOrdenEnRuta())
        return validas
    }

    // D9: ParadaService.validarOrden — verifica que el orden sea único y consecutivo en la lista
    validarOrden(nuevaParada: DatosParada, paradasExistentes: DatosParada[]): boolean {
        const ordenesExistentes = paradasExistentes.map(p => p.ordenEnRuta)
        if (ordenesExistentes.includes(nuevaParada.ordenEnRuta)) return false
        const ordenEsperado = paradasExistentes.length + 1
        return nuevaParada.ordenEnRuta === ordenEsperado
    }
}
