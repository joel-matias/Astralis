// Servicio externo de mapas — usa Mapbox Geocoding + Directions API
// Token tomado de NEXT_PUBLIC_MAPBOX_TOKEN (mismo que usa RutaMap.tsx)

export interface ResultadoCalculo {
    distanciaKm: number
    tiempoHoras: number
}

const BASE_GEO = 'https://api.mapbox.com/geocoding/v5/mapbox.places'
const BASE_DIR = 'https://api.mapbox.com/directions/v5/mapbox/driving'

async function geocodificarCiudad(ciudad: string, token: string): Promise<[number, number] | null> {
    const q = encodeURIComponent(`${ciudad}, México`)
    try {
        const res = await fetch(`${BASE_GEO}/${q}.json?country=mx&types=place&limit=1&access_token=${token}`)
        const data = await res.json() as { features?: { center?: [number, number] }[] }
        const center = data.features?.[0]?.center
        return Array.isArray(center) && center.length === 2 ? center : null
    } catch {
        return null
    }
}

export class APIMapas {

    // Calcula distancia real (km) y tiempo estimado (hrs) entre origen y destino vía Mapbox Directions.
    // Si el token no está configurado o la API falla, retorna 0 (flujo alternativo S2).
    async calcularDistanciaYTiempo(
        origen: string,
        destino: string,
        paradas: string[] = []
    ): Promise<ResultadoCalculo> {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        if (!token) return { distanciaKm: 0, tiempoHoras: 0 }

        const ciudades = [origen, ...paradas, destino]
        const coords = await Promise.all(ciudades.map(c => geocodificarCiudad(c, token)))

        if (coords.some(c => c === null)) return { distanciaKm: 0, tiempoHoras: 0 }

        const coordStr = (coords as [number, number][]).map(c => c.join(',')).join(';')
        try {
            const res = await fetch(`${BASE_DIR}/${coordStr}?geometries=geojson&overview=false&access_token=${token}`)
            const data = await res.json() as { routes?: { distance: number; duration: number }[] }
            const ruta = data.routes?.[0]
            if (!ruta) return { distanciaKm: 0, tiempoHoras: 0 }
            return {
                distanciaKm: Math.round(ruta.distance / 1000 * 10) / 10,
                tiempoHoras: Math.round(ruta.duration / 3600 * 10) / 10,
            }
        } catch {
            return { distanciaKm: 0, tiempoHoras: 0 }
        }
    }

    // Convierte una lista de nombres de ciudad en coordenadas [lng, lat] para trazado en el mapa.
    // Retorna arreglo vacío si el token no está o alguna ciudad no puede geocodificarse.
    async trazarParadas(puntos: string[]): Promise<[number, number][]> {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        if (!token) return []

        const coords = await Promise.all(puntos.map(p => geocodificarCiudad(p, token)))
        if (coords.some(c => c === null)) return []
        return coords as [number, number][]
    }
}
