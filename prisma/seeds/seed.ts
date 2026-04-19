import { PrismaClient, TipoRuta, EstadoRuta, TipoServicio, EstadoConductor, FrecuenciaHorario, VigenciaHorario, EstadoAnden } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Solo son datos de pruebas para comenzar, luego agreagmos mas

async function main() {
    // ── ROL ──────────────────────────────────────────────────────────────────
    const rol = await prisma.rol.upsert({
        where: { nombre: 'ADMIN' },
        update: {},
        create: { nombre: 'ADMIN' },
    })

    // ── USUARIO ───────────────────────────────────────────────────────────────
    const hash = await bcrypt.hash('admin1234', 10)
    const usuario = await prisma.usuario.upsert({
        where: { email: 'admin@astralis.mx' },
        update: {},
        create: {
            nombreCompleto: 'Administrador Principal',
            email: 'admin@astralis.mx',
            contrasenaHash: hash,
            rolID: rol.rolID,
        },
    })

    // ── RUTA ──────────────────────────────────────────────────────────────────
    const ruta = await prisma.ruta.upsert({
        where: { codigoRuta: 'RUT-001' },
        update: {},
        create: {
            codigoRuta: 'RUT-001',
            nombreRuta: 'Ciudad de México - Guadalajara',
            ciudadOrigen: 'Ciudad de México',
            ciudadDestino: 'Guadalajara',
            terminalOrigen: 'TAPO',
            terminalDestino: 'Terminal Central Nueva',
            distanciaKm: 542,
            tiempoEstimadoHrs: 6.5,
            tipoRuta: TipoRuta.DIRECTA,
            tarifaBase: 850,
            estado: EstadoRuta.ACTIVA,
            creadoPorID: usuario.usuarioID,
        },
    })

    // ── AUTOBÚS ───────────────────────────────────────────────────────────────
    const autobus = await prisma.autobus.upsert({
        where: { numeroEconomico: 'AS-2345' },
        update: {},
        create: {
            numeroEconomico: 'AS-2345',
            placas: 'ABC-1234',
            vin: '1HGBH41JXMN109186',
            marca: 'Volvo',
            modelo: '9700',
            anio: 2022,
            capacidadAsientos: 4, // Lo pusimos pequeño para pruebas
            tipoServicio: TipoServicio.EJECUTIVO,
        },
    })

    // ── ASIENTOS ─────────────────
    const asientosExistentes = await prisma.asiento.count({
        where: { autobusID: autobus.autobusID },
    })

    if (asientosExistentes === 0) {
        const asientos = Array.from({ length: autobus.capacidadAsientos }, (_, i) => ({
            autobusID: autobus.autobusID,
            numero: `A${String(i + 1).padStart(2, '0')}`,
        }))
        await prisma.asiento.createMany({ data: asientos })
    }

    // ── CONDUCTOR ─────────────────────────────────────────────────────────────
    const conductor = await prisma.conductor.upsert({
        where: { curp: 'PEGJ900101HDFRZN09' },
        update: {},
        create: {
            nombreCompleto: 'Juan Pérez González',
            curp: 'PEGJ900101HDFRZN09',
            numeroLicencia: 'LIC-98765',
            vigenciaLicencia: new Date('2027-06-30'),
            numeroTelefonico: '5512345678',
            estado: EstadoConductor.ACTIVO,
            disponible: true,
        },
    })

    // ── HORARIO ───────────────────────────────────────────────────────────────
    await prisma.horario.upsert({
        where: { horarioID: 'seed-horario-001' },
        update: {},
        create: {
            horarioID: 'seed-horario-001',
            rutaID: ruta.rutaID,
            autobusID: autobus.autobusID,
            conductorID: conductor.conductorID,
            programadoPorID: usuario.usuarioID,
            fechaInicio: new Date('2026-04-01'),
            horaSalida: new Date('1970-01-01T08:00:00Z'),
            frecuencia: FrecuenciaHorario.DIARIO,
            vigencia: VigenciaHorario.INDEFINIDA,
            precioBase: 850,
        },
    })

    // ── ANDENES ───────────────────────────────────────────────────────────────
    const andenes = [
        {
            numero: 1,
            capacidad: 3,
            estado: EstadoAnden.DISPONIBLE,
            horarioDisponible: '06:00-22:00',
        },
        {
            numero: 2,
            capacidad: 2,
            estado: EstadoAnden.DISPONIBLE,
            horarioDisponible: '06:00-22:00',
        },
        {
            numero: 3,
            capacidad: 4,
            estado: EstadoAnden.OCUPADO,
            horarioDisponible: '06:00-22:00',
        },
        {
            numero: 4,
            capacidad: 3,
            estado: EstadoAnden.RESERVADO,
            horarioDisponible: '08:00-18:00',
        },
        {
            numero: 5,
            capacidad: 2,
            estado: EstadoAnden.DISPONIBLE,
            horarioDisponible: '24/7',
        },
    ]

    for (const andenData of andenes) {
        // Verificar si ya existe
        const existente = await prisma.anden.findFirst({
            where: { numero: andenData.numero }
        })

        if (!existente) {
            await prisma.anden.create({
                data: andenData,
            })
        }
    }

    console.log('Semilla cargada completamente')
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())