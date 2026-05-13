'use client'

// D7, D6 CU6 — lógica de estado del flujo de asignación extraída de UIAsig
import { useState, useTransition, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { asignarConductorAction, obtenerConductoresParaViajeAction, registrarAbandonoAction } from '@/app/admin/conductores/actions'
import { EstadoConductor } from '@prisma/client'

export interface Viaje {
    horarioID: string
    ruta: {
        nombreRuta: string
        ciudadOrigen: string
        ciudadDestino: string
        tiempoEstimadoHrs: number
    }
    conductor: { nombreCompleto: string } | null
    asignacionActiva: boolean
    fechaInicio: Date
    horaSalida: Date
}

export interface ConductorFiltrado {
    conductorID: string
    nombreCompleto: string
    curp: string
    vigenciaLicencia: Date
    estado: EstadoConductor
}

export function useAsignacion(viajes: Viaje[]) {
    const router = useRouter()
    const [viajeSeleccionado, setViajeSeleccionado] = useState<string | null>(null)
    const [conductoresDisponibles, setConductoresDisponibles] = useState<ConductorFiltrado[]>([])
    const [cargandoConductores, setCargandoConductores] = useState(false)
    const [conductorSeleccionado, setConductorSeleccionado] = useState<string | null>(null)
    const [observaciones, setObservaciones] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [exito, setExito] = useState(false)
    const [confirmarCancelar, setConfirmarCancelar] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [isPending, startTransition] = useTransition()

    const viajesFiltrados = useMemo(() => {
        if (busqueda.trim() === '') return viajes
        const q = busqueda.toLowerCase()
        return viajes.filter(v =>
            v.ruta.ciudadOrigen.toLowerCase().includes(q) ||
            v.ruta.ciudadDestino.toLowerCase().includes(q) ||
            v.ruta.nombreRuta.toLowerCase().includes(q)
        )
    }, [viajes, busqueda])

    const viajeActual = useMemo(
        () => viajes.find(v => v.horarioID === viajeSeleccionado),
        [viajes, viajeSeleccionado]
    )

    // D7 paso 3: seleccionar viaje → cargar conductores candidatos filtrados (paso 5)
    const seleccionarViaje = useCallback(async (horarioID: string) => {
        setViajeSeleccionado(horarioID)
        setConductorSeleccionado(null)
        setError(null)
        setCargandoConductores(true)
        try {
            const conductores = await obtenerConductoresParaViajeAction(horarioID)
            setConductoresDisponibles(conductores)
        } catch {
            setError('Error al cargar conductores disponibles')
        } finally {
            setCargandoConductores(false)
        }
    }, [])

    const confirmarAsignacion = useCallback(() => {
        if (!viajeSeleccionado || !conductorSeleccionado) {
            setError('Selecciona un viaje y un conductor')
            return
        }
        startTransition(async () => {
            const res = await asignarConductorAction(conductorSeleccionado, viajeSeleccionado, observaciones)
            if (res.ok) {
                setExito(true)
            } else {
                setError(res.error ?? 'Error al asignar')
                // E1.1: viaje ya no existe → regresar al paso 2
                if (res.error === 'Viaje no encontrado') {
                    setViajeSeleccionado(null)
                    setConductorSeleccionado(null)
                    setConductoresDisponibles([])
                }
            }
        })
    }, [viajeSeleccionado, conductorSeleccionado, observaciones])

    // S1.2: registrar abandono y navegar fuera
    const ejecutarCancelar = useCallback(async () => {
        await registrarAbandonoAction()
        router.push('/admin/conductores')
    }, [router])

    const resetear = useCallback(() => {
        setExito(false)
        setViajeSeleccionado(null)
        setConductorSeleccionado(null)
        setObservaciones('')
        setConductoresDisponibles([])
    }, [])

    return {
        viajeSeleccionado,
        conductoresDisponibles,
        cargandoConductores,
        conductorSeleccionado,
        setConductorSeleccionado,
        observaciones,
        setObservaciones,
        error,
        exito,
        confirmarCancelar,
        setConfirmarCancelar,
        busqueda,
        setBusqueda,
        isPending,
        viajesFiltrados,
        viajeActual,
        seleccionarViaje,
        confirmarAsignacion,
        ejecutarCancelar,
        resetear,
    }
}
