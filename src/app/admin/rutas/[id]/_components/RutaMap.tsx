'use client'

import { useRef, useEffect, useState } from 'react'

interface MapInstance { remove(): void }

const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

interface Props {
    origen: string
    destino: string
    paradas: { ciudad: string }[]
}

async function geocodeCity(city: string): Promise<[number, number] | null> {
    const q = encodeURIComponent(`${city}, México`)
    try {
        const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?country=mx&types=place&limit=1&access_token=${token}`
        )
        const data = await res.json()
        const center = data.features?.[0]?.center
        return Array.isArray(center) && center.length === 2
            ? (center as [number, number])
            : null
    } catch {
        return null
    }
}

async function fetchRoute(coords: [number, number][]): Promise<object | null> {
    const coordStr = coords.map(c => c.join(',')).join(';')
    try {
        const res = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}?geometries=geojson&overview=full&access_token=${token}`
        )
        const data = await res.json()
        return data.routes?.[0]?.geometry ?? null
    } catch {
        return null
    }
}

export function RutaMap({ origen, destino, paradas }: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<MapInstance | null>(null)
    const [routeError, setRouteError] = useState(false)

    useEffect(() => {
        if (!containerRef.current || !token) return

        let destroyed = false

        import('mapbox-gl').then(({ default: mapboxgl }) => {
            if (destroyed || !containerRef.current) return

            mapboxgl.accessToken = token

            const map = new mapboxgl.Map({
                container: containerRef.current,
                style: 'mapbox://styles/mapbox/light-v11',
                center: [-99.1332, 19.4326],
                zoom: 5,
                attributionControl: false,
            })

            mapRef.current = map

            map.on('load', async () => {
                if (destroyed) return

                const cities = [origen, ...paradas.map(p => p.ciudad), destino]
                const coords = await Promise.all(cities.map(geocodeCity))

                if (destroyed) return

                if (coords.some(c => c === null)) {
                    setRouteError(true)
                    return
                }

                const validCoords = coords as [number, number][]
                const geometry = await fetchRoute(validCoords)

                if (destroyed) return

                if (!geometry) {
                    setRouteError(true)
                    return
                }

                map.addSource('route', {
                    type: 'geojson',
                    data: { type: 'Feature', properties: {}, geometry } as GeoJSON.Feature,
                })

                map.addLayer({
                    id: 'route',
                    type: 'line',
                    source: 'route',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': '#6750A4', 'line-width': 4, 'line-opacity': 0.8 },
                })

                const bounds = validCoords.reduce(
                    (b, c) => b.extend({ lng: c[0], lat: c[1] }),
                    new mapboxgl.LngLatBounds(
                        { lng: validCoords[0][0], lat: validCoords[0][1] },
                        { lng: validCoords[0][0], lat: validCoords[0][1] }
                    )
                )
                map.fitBounds(bounds, { padding: 40 })

                new mapboxgl.Marker({ color: '#6750A4' }).setLngLat(validCoords[0]).addTo(map)
                new mapboxgl.Marker({ color: '#625B71' }).setLngLat(validCoords[validCoords.length - 1]).addTo(map)
            })
        })

        return () => {
            destroyed = true
            mapRef.current?.remove()
            mapRef.current = null
        }
    }, [origen, destino, paradas])

    if (!token) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-surface-container text-secondary">
                <div className="text-center">
                    <span className="material-symbols-outlined text-4xl block mb-2 text-outline">map</span>
                    <p className="text-sm font-medium">Mapa no disponible</p>
                    <p className="text-xs mt-1 text-outline">Agrega NEXT_PUBLIC_MAPBOX_TOKEN en .env</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div ref={containerRef} className="w-full h-full" />
            {routeError && (
                <div className="absolute inset-0 flex items-center justify-center bg-surface-container/80 backdrop-blur-sm pointer-events-none">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-3xl block mb-1 text-outline">error_outline</span>
                        <p className="text-xs font-medium text-secondary">No se pudo trazar la ruta</p>
                        <p className="text-xs text-outline mt-0.5">{origen} → {destino}</p>
                    </div>
                </div>
            )}
        </>
    )
}
