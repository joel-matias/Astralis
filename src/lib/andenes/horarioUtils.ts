export function getEtiquetaHorario(horario: string | null): string {
    if (!horario) return '-'
    if (horario === '24/7') return '24 Horas'

    const horaInicio = parseInt(horario.split(':')[0])
    if (isNaN(horaInicio)) return horario

    if (horaInicio >= 5 && horaInicio < 12) return 'Mañana'
    if (horaInicio >= 12 && horaInicio < 18) return 'Tarde'
    return 'Noche'
}

export function getHorarioWhere(horario: string) {
    if (horario === 'all' || !horario) return {}
    if (horario === '24/7') return { horarioDisponible: '24/7' }

    const rangos: Record<string, number[]> = {
        'mañana': [5, 6, 7, 8, 9, 10, 11],
        'tarde':  [12, 13, 14, 15, 16, 17],
        'noche':  [18, 19, 20, 21, 22, 23],
    }

    const horas = rangos[horario]
    if (!horas) return {}

    return {
        OR: horas.map(h => ({
            horarioDisponible: {
                startsWith: h.toString().padStart(2, '0')
            }
        }))
    }
}
