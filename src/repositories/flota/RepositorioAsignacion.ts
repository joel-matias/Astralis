import { prisma } from '@/lib/prisma'

// D8: RepoAsig — Repositorio Asignación Autobús-Viaje
export class RepositorioAsignacion {

    async findByAutobus(autobusID: string) {
        return prisma.asignacionAutobusViaje.findMany({
            where: { autobusID },
            include: { horario: { include: { ruta: true } }, conductor: true },
            orderBy: { fechaAsignacion: 'desc' },
        })
    }

    async findActiva(autobusID: string) {
        return prisma.asignacionAutobusViaje.findFirst({
            where: { autobusID, liberado: false },
            include: { horario: { include: { ruta: true } }, conductor: true },
        })
    }

    async findByHorario(horarioID: string) {
        return prisma.asignacionAutobusViaje.findUnique({
            where: { horarioID },
            include: { autobus: true, conductor: true },
        })
    }

    async findByID(asignacionID: string) {
        return prisma.asignacionAutobusViaje.findUnique({
            where: { asignacionID },
            include: { autobus: true, horario: true, conductor: true },
        })
    }
}
