import { test, expect } from '@playwright/test'
import {
    PrismaClient,
    EstadoHorario, FrecuenciaHorario, VigenciaHorario,
    TipoRuta, EstadoRuta, TipoServicio, EstadoAutobus, EstadoConductor,
    EstadoVenta, EstadoBoleto,
} from '@prisma/client'

const prisma = new PrismaClient()
const ADMIN = { email: 'admin@astralis.mx', password: 'admin1234' }

let rutaID      = ''
let autobusID   = ''
let conductorID = ''
let horarioID   = ''
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let authCookies: any[] = []

function hoy(): string {
    return new Date().toISOString().split('T')[0]
}

// ── Limpieza ────────────────────────────────────────────────────────────────

async function limpiarDatosPrueba() {
    const [bus, cond, ruta] = await Promise.all([
        prisma.autobus.findFirst({ where: { numeroEconomico: 'AUTO-CU4-01' } }),
        prisma.conductor.findFirst({ where: { numeroLicencia: 'LIC-CU4-TEST' } }),
        prisma.ruta.findFirst({ where: { codigoRuta: 'RUT-CU4-TEST' } }),
    ])

    const orFiltros: { rutaID?: string; autobusID?: string; conductorID?: string }[] = []
    if (ruta) orFiltros.push({ rutaID: ruta.rutaID })
    if (bus)  orFiltros.push({ autobusID: bus.autobusID })
    if (cond) orFiltros.push({ conductorID: cond.conductorID })

    if (orFiltros.length > 0) {
        const horarios = await prisma.horario.findMany({ where: { OR: orFiltros } })
        const horarioIDs = horarios.map(h => h.horarioID)

        if (horarioIDs.length > 0) {
            const boletos = await prisma.boleto.findMany({ where: { horarioID: { in: horarioIDs } } })
            const ventaIDs = [...new Set(boletos.flatMap(b => b.ventaID ? [b.ventaID] : []))]
            const clienteIDs = [...new Set(boletos.map(b => b.clienteID))]

            if (ventaIDs.length > 0) {
                await prisma.comprobanteFiscal.deleteMany({ where: { ventaID: { in: ventaIDs } } })
            }
            await prisma.boleto.deleteMany({ where: { horarioID: { in: horarioIDs } } })
            if (ventaIDs.length > 0) {
                await prisma.venta.deleteMany({ where: { ventaID: { in: ventaIDs } } })
            }
            if (clienteIDs.length > 0) {
                await prisma.cliente.deleteMany({ where: { clienteID: { in: clienteIDs } } })
            }
            await prisma.horario.deleteMany({ where: { OR: orFiltros } })
        }
    }

    if (bus) {
        await prisma.asiento.deleteMany({ where: { autobusID: bus.autobusID } })
        await prisma.autobus.delete({ where: { autobusID: bus.autobusID } }).catch(() => {})
    }
    if (cond) {
        await prisma.conductor.delete({ where: { conductorID: cond.conductorID } }).catch(() => {})
    }
    if (ruta) {
        await prisma.paradaIntermedia.deleteMany({ where: { rutaID: ruta.rutaID } })
        await prisma.ruta.delete({ where: { rutaID: ruta.rutaID } }).catch(() => {})
    }
    // Ruta sin horarios (test de sin resultados)
    const rutaEmpty = await prisma.ruta.findFirst({ where: { codigoRuta: 'RUT-CU4-EMPTY' } })
    if (rutaEmpty) {
        await prisma.ruta.delete({ where: { rutaID: rutaEmpty.rutaID } }).catch(() => {})
    }
}

// ── Setup ───────────────────────────────────────────────────────────────────

test.beforeAll(async ({ browser }) => {
    await limpiarDatosPrueba()

    const admin = await prisma.usuario.findUnique({ where: { email: ADMIN.email } })
    if (!admin) throw new Error('Seed no aplicado: usuario admin no encontrado')

    const ruta = await prisma.ruta.create({
        data: {
            codigoRuta:       'RUT-CU4-TEST',
            nombreRuta:       'TestOriginCU4 - TestDestinoCU4',
            ciudadOrigen:     'TestOriginCU4',
            ciudadDestino:    'TestDestinoCU4',
            terminalOrigen:   'Terminal CU4',
            terminalDestino:  'Terminal CU4 Destino',
            distanciaKm:      100,
            tiempoEstimadoHrs: 2.5,
            tipoRuta:         TipoRuta.DIRECTA,
            tarifaBase:       200,
            estado:           EstadoRuta.ACTIVA,
            creadoPorID:      admin.usuarioID,
        },
    })
    rutaID = ruta.rutaID

    const autobus = await prisma.autobus.create({
        data: {
            numeroEconomico:   'AUTO-CU4-01',
            placas:            'CU4-001',
            vin:               'CU4VIN0000000001',
            marca:             'Mercedes',
            modelo:            'Sprinter',
            anio:              2022,
            capacidadAsientos: 8,
            tipoServicio:      TipoServicio.EJECUTIVO,
            estadoOperativo:   EstadoAutobus.DISPONIBLE,
        },
    })
    autobusID = autobus.autobusID

    // 8 asientos: 1A 1B 1C 1D 2A 2B 2C 2D
    await prisma.asiento.createMany({
        data: ['1A', '1B', '1C', '1D', '2A', '2B', '2C', '2D'].map(numero => ({
            autobusID: autobus.autobusID,
            numero,
        })),
    })

    const conductor = await prisma.conductor.create({
        data: {
            nombreCompleto:   'Pedro Pérez CU4',
            curp:             'PEPP900101HOCRNN09',
            numeroLicencia:   'LIC-CU4-TEST',
            vigenciaLicencia: new Date('2027-12-31'),
            disponible:       true,
            estado:           EstadoConductor.ACTIVO,
        },
    })
    conductorID = conductor.conductorID

    // Ruta sin horarios → para el test de "sin resultados"
    await prisma.ruta.create({
        data: {
            codigoRuta:       'RUT-CU4-EMPTY',
            nombreRuta:       'OrigenVacioCU4 - DestinoVacioCU4',
            ciudadOrigen:     'OrigenVacioCU4',
            ciudadDestino:    'DestinoVacioCU4',
            terminalOrigen:   'Terminal CU4 Empty',
            terminalDestino:  'Terminal CU4 Empty Dest',
            distanciaKm:      50,
            tiempoEstimadoHrs: 1,
            tipoRuta:         TipoRuta.DIRECTA,
            tarifaBase:       100,
            estado:           EstadoRuta.ACTIVA,
            creadoPorID:      admin.usuarioID,
        },
    })

    // DIARIO + INDEFINIDA, comenzó ayer → aparece siempre al buscar por hoy
    const ayer = new Date()
    ayer.setDate(ayer.getDate() - 1)
    ayer.setHours(0, 0, 0, 0)

    const horario = await prisma.horario.create({
        data: {
            rutaID,
            autobusID,
            conductorID,
            programadoPorID: admin.usuarioID,
            fechaInicio:  ayer,
            horaSalida:   new Date('1970-01-01T10:00:00.000Z'),
            frecuencia:   FrecuenciaHorario.DIARIO,
            vigencia:     VigenciaHorario.INDEFINIDA,
            precioBase:   200,
            estado:       EstadoHorario.ACTIVO,
        },
    })
    horarioID = horario.horarioID

    // Login una vez — reutiliza cookies en todos los tests
    const ctx = await browser.newContext()
    const loginPage = await ctx.newPage()
    await loginPage.goto('/login')
    await loginPage.getByLabel('Correo electrónico').fill(ADMIN.email)
    await loginPage.getByLabel('Contraseña').fill(ADMIN.password)
    await loginPage.getByRole('button', { name: 'Iniciar sesión' }).click()
    await loginPage.waitForURL('/admin/dashboard', { timeout: 12_000 })
    authCookies = await ctx.cookies()
    await ctx.close()
})

test.beforeEach(async ({ page }) => {
    await page.context().addCookies(authCookies)
})

test.afterAll(async () => {
    await limpiarDatosPrueba()
    await prisma.$disconnect()
})

// ── Tests ───────────────────────────────────────────────────────────────────

test.describe('CU4 — Venta de Boletos (POS)', () => {

    // ── Auth guard ──────────────────────────────────────────────────────────

    test('sin sesión /pos redirige a /login', async ({ browser }) => {
        const ctx  = await browser.newContext()
        const page = await ctx.newPage()
        await page.goto('/pos')
        await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })
        await ctx.close()
    })

    // ── Página principal ────────────────────────────────────────────────────

    test('página POS muestra formulario de búsqueda y título', async ({ page }) => {
        await page.goto('/pos')
        await expect(page.getByRole('heading', { name: 'Punto de Venta' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Buscar viajes disponibles' })).toBeVisible()
    })

    // ── Búsqueda ─────────────────────────────────────────────────────────────

    test('búsqueda sin resultados muestra mensaje vacío', async ({ page }) => {
        await page.goto('/pos')
        const form    = page.locator('form')
        const selects = form.locator('select')

        // Ruta sin horarios: OrigenVacioCU4 → DestinoVacioCU4
        await selects.nth(0).selectOption('OrigenVacioCU4')
        await expect(selects.nth(1)).not.toBeDisabled({ timeout: 6_000 })
        await selects.nth(1).selectOption('DestinoVacioCU4')

        await page.fill('input[type="date"]', hoy())
        await page.getByRole('button', { name: 'Buscar viajes disponibles' }).click()

        await expect(page.getByText('No hay viajes disponibles')).toBeVisible({ timeout: 8_000 })
    })

    test('búsqueda por origen/destino fixture muestra el horario', async ({ page }) => {
        await page.goto('/pos')
        const form    = page.locator('form')
        const selects = form.locator('select')

        // Seleccionar origen del fixture
        await selects.nth(0).selectOption('TestOriginCU4')
        // Esperar que el destino se habilite con la opción del fixture
        await expect(selects.nth(1)).not.toBeDisabled({ timeout: 6_000 })
        await selects.nth(1).selectOption('TestDestinoCU4')

        await page.fill('input[type="date"]', hoy())
        await page.getByRole('button', { name: 'Buscar viajes disponibles' }).click()

        await expect(page.getByText('TestOriginCU4 → TestDestinoCU4')).toBeVisible({ timeout: 8_000 })
        await expect(page.getByText('10:00')).toBeVisible()
        await expect(page.getByText('Ejecutivo')).toBeVisible()
        await expect(page.getByText('$200.00')).toBeVisible()
    })

    // ── Flujo de venta — efectivo ─────────────────────────────────────────

    test('compra completa en efectivo → venta guardada en BD con boleto VENDIDO', async ({ page }) => {
        await page.goto('/pos')
        const form    = page.locator('form')
        const selects = form.locator('select')

        // Paso 1: buscar viaje
        await selects.nth(0).selectOption('TestOriginCU4')
        await expect(selects.nth(1)).not.toBeDisabled({ timeout: 6_000 })
        await selects.nth(1).selectOption('TestDestinoCU4')
        await page.fill('input[type="date"]', hoy())
        await page.getByRole('button', { name: 'Buscar viajes disponibles' }).click()
        await expect(page.getByText('TestOriginCU4 → TestDestinoCU4')).toBeVisible({ timeout: 8_000 })

        // Paso 2: seleccionar viaje
        await page.getByText('TestOriginCU4 → TestDestinoCU4').click()

        // Paso 3: seleccionar asiento 1A
        await expect(page.getByRole('button', { name: '1A' })).toBeVisible({ timeout: 8_000 })
        await page.getByRole('button', { name: '1A' }).click()
        await page.getByRole('button', { name: 'Confirmar' }).click()

        // Paso 4: datos del cliente y pago en efectivo
        await expect(page.getByPlaceholder('Ej. María García López')).toBeVisible({ timeout: 6_000 })
        await page.getByPlaceholder('Ej. María García López').fill('Juan Test CU4')

        // Seleccionar efectivo
        await page.getByRole('button', { name: 'Efectivo' }).click()
        await expect(page.locator('input[type="number"]')).toBeVisible({ timeout: 4_000 })
        await page.locator('input[type="number"]').fill('300')

        // Procesar pago
        await page.getByRole('button', { name: 'Cobrar' }).click()

        // Paso 5: verificar ¡Pago aprobado!
        await expect(page.getByText('¡Pago aprobado!')).toBeVisible({ timeout: 15_000 })
        await expect(page.getByText('Asiento 1A')).toBeVisible()

        // Verificar en BD
        const ventas = await prisma.venta.findMany({
            where: { boletos: { some: { horarioID } } },
            include: { boletos: true },
            orderBy: { fechaHora: 'desc' },
            take: 1,
        })
        expect(ventas).toHaveLength(1)
        expect(ventas[0].estado).toBe(EstadoVenta.COMPLETADA)
        expect(Number(ventas[0].montoTotal)).toBe(200)
        expect(ventas[0].boletos).toHaveLength(1)
        expect(ventas[0].boletos[0].estado).toBe(EstadoBoleto.VENDIDO)
        expect(ventas[0].boletos[0].codigoQR).toMatch(/^QR-/)
    })

    test('flujo completo en TPV → venta guardada con 2 boletos', async ({ page }) => {
        await page.goto('/pos')
        const form    = page.locator('form')
        const selects = form.locator('select')

        // Buscar
        await selects.nth(0).selectOption('TestOriginCU4')
        await expect(selects.nth(1)).not.toBeDisabled({ timeout: 6_000 })
        await selects.nth(1).selectOption('TestDestinoCU4')
        await page.fill('input[type="date"]', hoy())

        // 2 pasajeros
        await page.getByRole('button', { name: '+' }).click()

        await page.getByRole('button', { name: 'Buscar viajes disponibles' }).click()
        await expect(page.getByText('TestOriginCU4 → TestDestinoCU4')).toBeVisible({ timeout: 8_000 })

        // Seleccionar viaje
        await page.getByText('TestOriginCU4 → TestDestinoCU4').click()

        // Seleccionar 2 asientos libres (no 1A que fue ocupado en el test anterior)
        await expect(page.getByRole('button', { name: '1B' })).toBeVisible({ timeout: 8_000 })
        await page.getByRole('button', { name: '1B' }).click()
        await page.getByRole('button', { name: '1C' }).click()
        await page.getByRole('button', { name: 'Confirmar' }).click()

        // Datos y pago TPV (por defecto seleccionado)
        await expect(page.getByPlaceholder('Ej. María García López')).toBeVisible({ timeout: 6_000 })
        await page.getByPlaceholder('Ej. María García López').fill('Ana Test CU4')

        // TPV ya es el default — no cambiar
        await page.getByRole('button', { name: 'Cobrar' }).click()

        await expect(page.getByText('¡Pago aprobado!')).toBeVisible({ timeout: 15_000 })

        // 2 boletos creados
        const boletos = await prisma.boleto.findMany({
            where: { horarioID, estado: EstadoBoleto.VENDIDO },
            orderBy: { creadoEn: 'desc' },
            take: 2,
        })
        expect(boletos.length).toBeGreaterThanOrEqual(2)
    })

    // ── Generación de comprobante ────────────────────────────────────────────

    test('botón Generar comprobante avanza a VentaFinalizada', async ({ page }) => {
        await page.goto('/pos')
        const form    = page.locator('form')
        const selects = form.locator('select')

        await selects.nth(0).selectOption('TestOriginCU4')
        await expect(selects.nth(1)).not.toBeDisabled({ timeout: 6_000 })
        await selects.nth(1).selectOption('TestDestinoCU4')
        await page.fill('input[type="date"]', hoy())
        await page.getByRole('button', { name: 'Buscar viajes disponibles' }).click()
        await expect(page.getByText('TestOriginCU4 → TestDestinoCU4')).toBeVisible({ timeout: 8_000 })
        await page.getByText('TestOriginCU4 → TestDestinoCU4').click()

        await expect(page.getByRole('button', { name: '1D' })).toBeVisible({ timeout: 8_000 })
        await page.getByRole('button', { name: '1D' }).click()
        await page.getByRole('button', { name: 'Confirmar' }).click()

        await expect(page.getByPlaceholder('Ej. María García López')).toBeVisible({ timeout: 6_000 })
        await page.getByPlaceholder('Ej. María García López').fill('Pedro Test CU4')
        await page.getByRole('button', { name: 'Efectivo' }).click()
        await page.locator('input[type="number"]').fill('200')
        await page.getByRole('button', { name: 'Cobrar' }).click()

        await expect(page.getByText('¡Pago aprobado!')).toBeVisible({ timeout: 15_000 })
        await page.getByRole('button', { name: 'Generar comprobante' }).click()

        await expect(page.getByText('Venta finalizada')).toBeVisible({ timeout: 6_000 })
        await expect(page.getByRole('button', { name: 'Nueva venta' })).toBeVisible()
    })

    // ── Asiento ocupado tras venta ──────────────────────────────────────────

    test('asiento 1A aparece ocupado en el mapa tras la venta', async ({ page }) => {
        await page.goto('/pos')
        const form    = page.locator('form')
        const selects = form.locator('select')

        await selects.nth(0).selectOption('TestOriginCU4')
        await expect(selects.nth(1)).not.toBeDisabled({ timeout: 6_000 })
        await selects.nth(1).selectOption('TestDestinoCU4')
        await page.fill('input[type="date"]', hoy())
        await page.getByRole('button', { name: 'Buscar viajes disponibles' }).click()
        await expect(page.getByText('TestOriginCU4 → TestDestinoCU4')).toBeVisible({ timeout: 8_000 })
        await page.getByText('TestOriginCU4 → TestDestinoCU4').click()

        await expect(page.getByRole('button', { name: '1A' })).toBeVisible({ timeout: 8_000 })
        // El botón 1A debe estar deshabilitado (ocupado por el test de efectivo)
        await expect(page.getByRole('button', { name: '1A' })).toBeDisabled()
    })

    // ── Validación de formulario ─────────────────────────────────────────────

    test('campo nombre obligatorio impide completar el pago', async ({ page }) => {
        await page.goto('/pos')
        const form    = page.locator('form')
        const selects = form.locator('select')

        await selects.nth(0).selectOption('TestOriginCU4')
        await expect(selects.nth(1)).not.toBeDisabled({ timeout: 6_000 })
        await selects.nth(1).selectOption('TestDestinoCU4')
        await page.fill('input[type="date"]', hoy())
        await page.getByRole('button', { name: 'Buscar viajes disponibles' }).click()
        await expect(page.getByText('TestOriginCU4 → TestDestinoCU4')).toBeVisible({ timeout: 8_000 })
        await page.getByText('TestOriginCU4 → TestDestinoCU4').click()

        await expect(page.getByRole('button', { name: '2A' })).toBeVisible({ timeout: 8_000 })
        await page.getByRole('button', { name: '2A' }).click()
        await page.getByRole('button', { name: 'Confirmar' }).click()

        // Nombre en blanco → HTML5 required impide submit
        await page.getByRole('button', { name: 'Cobrar' }).click()
        // El estado no avanza (seguimos en la misma pantalla)
        await expect(page.getByPlaceholder('Ej. María García López')).toBeVisible()
        await expect(page.getByText('¡Pago aprobado!')).not.toBeVisible()
    })

})
