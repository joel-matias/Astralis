import {
    PrismaClient,
    TipoRuta,
    EstadoRuta,
    TipoServicio,
    EstadoConductor,
    FrecuenciaHorario,
    VigenciaHorario,
    EstadoAnden,
    EstadoAutobus,
} from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // ── ROLES ─────────────────────────────────────────────────────────────────
    const rolAdmin = await prisma.rol.upsert({
        where: { nombre: 'ADMIN' },
        update: {},
        create: { nombre: 'ADMIN' },
    })

    const rolGerente = await prisma.rol.upsert({
        where: { nombre: 'GERENTE' },
        update: {},
        create: { nombre: 'GERENTE' },
    })

    const rolVendedor = await prisma.rol.upsert({
        where: { nombre: 'VENDEDOR_TAQUILLA' },
        update: {},
        create: { nombre: 'VENDEDOR_TAQUILLA' },
    })

    const rolSupervisor = await prisma.rol.upsert({
        where: { nombre: 'SUPERVISOR_ANDENES' },
        update: {},
        create: { nombre: 'SUPERVISOR_ANDENES' },
    })

    const rolEquipaje = await prisma.rol.upsert({
        where: { nombre: 'ENCARGADO_EQUIPAJE' },
        update: {},
        create: { nombre: 'ENCARGADO_EQUIPAJE' },
    })

    const rolDespachador = await prisma.rol.upsert({
        where: { nombre: 'DESPACHADOR_UNIDADES' },
        update: {},
        create: { nombre: 'DESPACHADOR_UNIDADES' },
    })

    // ── USUARIOS ──────────────────────────────────────────────────────────────
    const usuarios = [
        {
            nombreCompleto: 'Administrador Principal',
            email: 'admin@astralis.mx',
            contrasena: 'admin1234',
            rolID: rolAdmin.rolID,
        },
        {
            nombreCompleto: 'Gerente de Operaciones',
            email: 'gerente@astralis.mx',
            contrasena: 'gerente1234',
            rolID: rolGerente.rolID,
        },
        {
            nombreCompleto: 'Vendedor Taquilla Norte',
            email: 'vendedor@astralis.mx',
            contrasena: 'vendedor1234',
            rolID: rolVendedor.rolID,
        },
        {
            nombreCompleto: 'Supervisor de Andenes',
            email: 'supervisor@astralis.mx',
            contrasena: 'supervisor1234',
            rolID: rolSupervisor.rolID,
        },
        {
            nombreCompleto: 'Encargado de Equipaje',
            email: 'equipaje@astralis.mx',
            contrasena: 'equipaje1234',
            rolID: rolEquipaje.rolID,
        },
        {
            nombreCompleto: 'Despachador de Unidades',
            email: 'despachador@astralis.mx',
            contrasena: 'despacha1234',
            rolID: rolDespachador.rolID,
        },
    ]

    const usuariosCreados: Record<string, string> = {}

    for (const u of usuarios) {
        const hash = await bcrypt.hash(u.contrasena, 10)
        const creado = await prisma.usuario.upsert({
            where: { email: u.email },
            update: {},
            create: {
                nombreCompleto: u.nombreCompleto,
                email: u.email,
                contrasenaHash: hash,
                rolID: u.rolID,
            },
        })
        usuariosCreados[u.email] = creado.usuarioID
    }

    const adminID = usuariosCreados['admin@astralis.mx']

    // ── RUTAS ─────────────────────────────────────────────────────────────────
    const rutas = [
        {
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
        },
        {
            codigoRuta: 'RUT-002',
            nombreRuta: 'Oaxaca - Ciudad de México',
            ciudadOrigen: 'Oaxaca',
            ciudadDestino: 'Ciudad de México',
            terminalOrigen: 'Terminal Oaxaca',
            terminalDestino: 'TAPO',
            distanciaKm: 463,
            tiempoEstimadoHrs: 6.0,
            tipoRuta: TipoRuta.CON_PARADAS,
            tarifaBase: 720,
            estado: EstadoRuta.ACTIVA,
        },
        {
            codigoRuta: 'RUT-003',
            nombreRuta: 'Puebla - Veracruz',
            ciudadOrigen: 'Puebla',
            ciudadDestino: 'Veracruz',
            terminalOrigen: 'CAPU',
            terminalDestino: 'Terminal Veracruz',
            distanciaKm: 280,
            tiempoEstimadoHrs: 3.5,
            tipoRuta: TipoRuta.DIRECTA,
            tarifaBase: 490,
            estado: EstadoRuta.ACTIVA,
        },
    ]

    const rutasCreadas: Record<string, string> = {}

    for (const r of rutas) {
        const creada = await prisma.ruta.upsert({
            where: { codigoRuta: r.codigoRuta },
            update: {},
            create: { ...r, creadoPorID: adminID },
        })
        rutasCreadas[r.codigoRuta] = creada.rutaID
    }

    // ── AUTOBUSES ─────────────────────────────────────────────────────────────
    const autobuses = [
        {
            numeroEconomico: 'AS-2345',
            placas: 'ABC-1234',
            vin: '1HGBH41JXMN109186',
            marca: 'Volvo',
            modelo: '9700',
            anio: 2022,
            capacidadAsientos: 4, // reducido para pruebas rápidas de POS
            tipoServicio: TipoServicio.EJECUTIVO,
            estadoOperativo: EstadoAutobus.DISPONIBLE,
        },
        {
            numeroEconomico: 'AS-3101',
            placas: 'XYZ-5678',
            vin: '2T1BURHE0JC034236',
            marca: 'Mercedes-Benz',
            modelo: 'Torino 370',
            anio: 2021,
            capacidadAsientos: 6,
            tipoServicio: TipoServicio.LUJO,
            estadoOperativo: EstadoAutobus.DISPONIBLE,
        },
        {
            numeroEconomico: 'AS-4420',
            placas: 'DEF-9012',
            vin: '3VWFE21C04M000001',
            marca: 'Scania',
            modelo: 'K410',
            anio: 2020,
            capacidadAsientos: 8,
            tipoServicio: TipoServicio.ECONOMICO,
            estadoOperativo: EstadoAutobus.DISPONIBLE,
        },
    ]

    const autobusesCreados: Record<string, string> = {}

    for (const a of autobuses) {
        const creado = await prisma.autobus.upsert({
            where: { numeroEconomico: a.numeroEconomico },
            update: {},
            create: a,
        })
        autobusesCreados[a.numeroEconomico] = creado.autobusID

        const existentes = await prisma.asiento.count({
            where: { autobusID: creado.autobusID },
        })

        if (existentes === 0) {
            const asientos = Array.from({ length: a.capacidadAsientos }, (_, i) => ({
                autobusID: creado.autobusID,
                numero: `A${String(i + 1).padStart(2, '0')}`,
            }))
            await prisma.asiento.createMany({ data: asientos })
        }
    }

    // ── CONDUCTORES ───────────────────────────────────────────────────────────
    const conductores = [
        {
            nombreCompleto: 'Juan Pérez González',
            curp: 'PEGJ900101HDFRZN09',
            numeroLicencia: 'LIC-98765',
            vigenciaLicencia: new Date('2027-06-30'),
            domicilio: 'Av. Insurgentes 120, CDMX',
            numeroTelefonico: '5512345678',
            estado: EstadoConductor.ACTIVO,
            disponible: true,
        },
        {
            nombreCompleto: 'María Sofía López Hernández',
            curp: 'LOHM850615MDFPRD07',
            numeroLicencia: 'LIC-11111',
            vigenciaLicencia: new Date('2026-12-31'),
            domicilio: 'Calle Reforma 45, CDMX',
            numeroTelefonico: '5598765432',
            estado: EstadoConductor.ACTIVO,
            disponible: true,
        },
        {
            nombreCompleto: 'Carlos Eduardo Rodríguez Martínez',
            curp: 'ROMC780323HDFDRR08',
            numeroLicencia: 'LIC-22222',
            vigenciaLicencia: new Date('2028-03-15'),
            domicilio: 'Blvd. Juárez 310, Puebla',
            numeroTelefonico: '2221234567',
            estado: EstadoConductor.ACTIVO,
            disponible: true,
        },
        {
            nombreCompleto: 'Ana Gabriela García Sánchez',
            curp: 'GASA920710MDFRNN06',
            numeroLicencia: 'LIC-33333',
            vigenciaLicencia: new Date('2027-09-20'),
            domicilio: 'Calle Hidalgo 88, Oaxaca',
            numeroTelefonico: '9511122334',
            estado: EstadoConductor.NO_DISPONIBLE,
            disponible: false,
        },
        {
            nombreCompleto: 'Roberto Mendoza Flores',
            curp: 'MEFR681115HDFNDB04',
            numeroLicencia: 'LIC-44444',
            vigenciaLicencia: new Date('2025-06-01'), // licencia vencida
            domicilio: 'Av. Universidad 900, CDMX',
            numeroTelefonico: '5587654321',
            estado: EstadoConductor.INACTIVO,
            disponible: false,
            motivoBaja: 'Licencia vencida — pendiente de renovación',
        },
        {
            nombreCompleto: 'Luis Alfonso Torres Vargas',
            curp: 'TOLV950320HDFRVS02',
            numeroLicencia: 'LIC-55555',
            vigenciaLicencia: new Date('2029-01-10'),
            domicilio: 'Calle Morelos 22, Veracruz',
            numeroTelefonico: '2291239876',
            estado: EstadoConductor.ACTIVO,
            disponible: true,
        },
    ]

    const conductoresCreados: string[] = []

    for (const c of conductores) {
        const creado = await prisma.conductor.upsert({
            where: { curp: c.curp },
            update: {},
            create: c,
        })
        conductoresCreados.push(creado.conductorID)
    }

    // ── HORARIOS ──────────────────────────────────────────────────────────────
    // Horario principal: ruta CDMX-GDL, diario, bus AS-2345, conductor Juan Pérez
    await prisma.horario.upsert({
        where: { horarioID: 'seed-horario-001' },
        update: {},
        create: {
            horarioID: 'seed-horario-001',
            rutaID: rutasCreadas['RUT-001'],
            autobusID: autobusesCreados['AS-2345'],
            conductorID: conductoresCreados[0],
            programadoPorID: adminID,
            fechaInicio: new Date('2026-04-01'),
            horaSalida: new Date('1970-01-01T08:00:00Z'),
            frecuencia: FrecuenciaHorario.DIARIO,
            vigencia: VigenciaHorario.INDEFINIDA,
            precioBase: 850,
        },
    })

    // Horario secundario: ruta Oaxaca-CDMX, bus AS-3101, conductor María López
    await prisma.horario.upsert({
        where: { horarioID: 'seed-horario-002' },
        update: {},
        create: {
            horarioID: 'seed-horario-002',
            rutaID: rutasCreadas['RUT-002'],
            autobusID: autobusesCreados['AS-3101'],
            conductorID: conductoresCreados[1],
            programadoPorID: adminID,
            fechaInicio: new Date('2026-04-01'),
            horaSalida: new Date('1970-01-01T10:30:00Z'),
            frecuencia: FrecuenciaHorario.DIARIO,
            vigencia: VigenciaHorario.INDEFINIDA,
            precioBase: 720,
        },
    })

    // Horario terciario: ruta Puebla-Veracruz, bus AS-4420, conductor Carlos Rodríguez
    await prisma.horario.upsert({
        where: { horarioID: 'seed-horario-003' },
        update: {},
        create: {
            horarioID: 'seed-horario-003',
            rutaID: rutasCreadas['RUT-003'],
            autobusID: autobusesCreados['AS-4420'],
            conductorID: conductoresCreados[2],
            programadoPorID: adminID,
            fechaInicio: new Date('2026-04-01'),
            horaSalida: new Date('1970-01-01T07:00:00Z'),
            frecuencia: FrecuenciaHorario.DIARIO,
            vigencia: VigenciaHorario.INDEFINIDA,
            precioBase: 490,
        },
    })

    // ── ANDENES ───────────────────────────────────────────────────────────────
    const andenes = [
        { numero: 1, capacidad: 3, estado: EstadoAnden.DISPONIBLE, horarioDisponible: '06:00-22:00' },
        { numero: 2, capacidad: 2, estado: EstadoAnden.DISPONIBLE, horarioDisponible: '06:00-22:00' },
        { numero: 3, capacidad: 4, estado: EstadoAnden.OCUPADO,    horarioDisponible: '06:00-22:00' },
        { numero: 4, capacidad: 3, estado: EstadoAnden.RESERVADO,  horarioDisponible: '08:00-18:00' },
        { numero: 5, capacidad: 2, estado: EstadoAnden.DISPONIBLE, horarioDisponible: '24/7' },
    ]

    for (const a of andenes) {
        const existente = await prisma.anden.findFirst({ where: { numero: a.numero } })
        if (!existente) {
            await prisma.anden.create({ data: a })
        }
    }

    console.log('Semilla cargada correctamente')
    console.log('')
    console.log('Usuarios de prueba:')
    console.log('  admin@astralis.mx        / admin1234      → /admin/dashboard')
    console.log('  gerente@astralis.mx      / gerente1234    → /operaciones/dashboard')
    console.log('  vendedor@astralis.mx     / vendedor1234   → /pos')
    console.log('  supervisor@astralis.mx   / supervisor1234 → /andenes')
    console.log('  equipaje@astralis.mx     / equipaje1234   → /equipaje')
    console.log('  despachador@astralis.mx  / despacha1234   → /admin/conductores')
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
