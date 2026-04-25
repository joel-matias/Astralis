import { test, expect } from '@playwright/test'
import {
    PrismaClient,
    EstadoHorario, FrecuenciaHorario, VigenciaHorario,
    TipoRuta, EstadoRuta, TipoServicio, EstadoAutobus, EstadoConductor,
} from '@prisma/client'

const prisma = new PrismaClient()
const ADMIN = { email: 'admin@astralis.mx', password: 'admin1234' }

// IDs de fixtures — asignados en beforeAll
let rutaID       = ''
let autobusID    = ''
let conductorID  = ''
let horarioFixtureID = ''
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let authCookies: any[] = []

function manana(): string {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
}

function enUnMes(): string {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    return d.toISOString().split('T')[0]
}

// ── Limpieza ────────────────────────────────────────────────────────────────

async function limpiarDatosPrueba() {
    const bus  = await prisma.autobus.findFirst({ where: { numeroEconomico: 'AUTO-CU3-01' } })
    const cond = await prisma.conductor.findFirst({ where: { numeroLicencia: 'LIC-CU3-TEST' } })
    const ruta = await prisma.ruta.findFirst({ where: { codigoRuta: 'RUT-CU3-BASE' } })

    // Eliminar horarios primero (FK)
    const orFiltros: { autobusID?: string; conductorID?: string; rutaID?: string }[] = []
    if (bus)  orFiltros.push({ autobusID: bus.autobusID })
    if (cond) orFiltros.push({ conductorID: cond.conductorID })
    if (ruta) orFiltros.push({ rutaID: ruta.rutaID })
    if (orFiltros.length > 0) await prisma.horario.deleteMany({ where: { OR: orFiltros } })

    if (bus)  await prisma.autobus.delete({ where: { autobusID: bus.autobusID } }).catch(() => {})
    if (cond) await prisma.conductor.delete({ where: { conductorID: cond.conductorID } }).catch(() => {})
    if (ruta) {
        await prisma.paradaIntermedia.deleteMany({ where: { rutaID: ruta.rutaID } })
        await prisma.ruta.delete({ where: { rutaID: ruta.rutaID } }).catch(() => {})
    }
}

// ── Setup ───────────────────────────────────────────────────────────────────

test.beforeAll(async ({ browser }) => {
    await limpiarDatosPrueba()

    const admin = await prisma.usuario.findUnique({ where: { email: ADMIN.email } })
    if (!admin) throw new Error('Seed no aplicado: usuario admin no encontrado')

    const ruta = await prisma.ruta.create({
        data: {
            codigoRuta:      'RUT-CU3-BASE',
            nombreRuta:      'Ciudad de Oaxaca - Puerto Escondido',
            ciudadOrigen:    'Ciudad de Oaxaca',
            ciudadDestino:   'Puerto Escondido',
            terminalOrigen:  'Terminal Norte',
            terminalDestino: 'Terminal Costera',
            distanciaKm:     247,
            tiempoEstimadoHrs: 5.5,
            tipoRuta:    TipoRuta.DIRECTA,
            tarifaBase:  320,
            estado:      EstadoRuta.ACTIVA,
            creadoPorID: admin.usuarioID,
        },
    })
    rutaID = ruta.rutaID

    const autobus = await prisma.autobus.create({
        data: {
            numeroEconomico:  'AUTO-CU3-01',
            placas:           'CU3-001',
            vin:              'CU3VIN0000000001',
            marca:            'Mercedes',
            modelo:           'Sprinter',
            anio:             2022,
            capacidadAsientos: 40,
            tipoServicio:     TipoServicio.EJECUTIVO,
            estadoOperativo:  EstadoAutobus.DISPONIBLE,
        },
    })
    autobusID = autobus.autobusID

    const conductor = await prisma.conductor.create({
        data: {
            nombreCompleto:  'Juan Pérez CU3',
            curp:            'PECJ900101HOCRNN09',
            numeroLicencia:  'LIC-CU3-TEST',
            vigenciaLicencia: new Date('2027-12-31'),
            disponible:      true,
            estado:          EstadoConductor.ACTIVO,
        },
    })
    conductorID = conductor.conductorID

    // Horario fixture para tests de lectura y cancelación
    const horario = await prisma.horario.create({
        data: {
            rutaID,
            autobusID,
            conductorID,
            programadoPorID: admin.usuarioID,
            fechaInicio:  new Date('2026-06-01'),
            horaSalida:   new Date('1970-01-01T08:00:00.000Z'),
            frecuencia:   FrecuenciaHorario.DIARIO,
            vigencia:     VigenciaHorario.INDEFINIDA,
            precioBase:   320,
            estado:       EstadoHorario.ACTIVO,
        },
    })
    horarioFixtureID = horario.horarioID

    // Login — guarda cookies para todos los tests
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

test.describe('CU3 — Programar Horario de Viaje', () => {

    // ── Auth guard ──────────────────────────────────────────────────────────

    test('sin sesión activa /admin/horarios redirige a /login', async ({ browser }) => {
        const ctx  = await browser.newContext()
        const page = await ctx.newPage()
        await page.goto('/admin/horarios')
        await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })
        await ctx.close()
    })

    // ── Lista ───────────────────────────────────────────────────────────────

    test('lista muestra los encabezados correctos de la tabla', async ({ page }) => {
        await page.goto('/admin/horarios')
        await expect(page.getByRole('columnheader', { name: /Ruta/i })).toBeVisible()
        await expect(page.getByRole('columnheader', { name: /Autobús/i })).toBeVisible()
        await expect(page.getByRole('columnheader', { name: /Conductor/i })).toBeVisible()
        await expect(page.getByRole('columnheader', { name: /Frecuencia/i })).toBeVisible()
        await expect(page.getByRole('columnheader', { name: /Estado/i })).toBeVisible()
    })

    test('lista muestra el horario fixture con código de ruta y conductor', async ({ page }) => {
        await page.goto('/admin/horarios')
        await expect(page.getByText('RUT-CU3-BASE')).toBeVisible({ timeout: 8_000 })
        await expect(page.getByText('Ciudad de Oaxaca')).toBeVisible()
        await expect(page.getByText('AUTO-CU3-01')).toBeVisible()
        await expect(page.getByText('Juan Pérez CU3')).toBeVisible()
    })

    test('búsqueda por conductor filtra; término inexistente muestra vacío', async ({ page }) => {
        await page.goto('/admin/horarios?q=Juan+P%C3%A9rez+CU3')
        await expect(page.getByText('RUT-CU3-BASE')).toBeVisible({ timeout: 8_000 })

        await page.goto('/admin/horarios?q=ZZZ-NO-EXISTE')
        await expect(page.getByText('No se encontraron horarios')).toBeVisible({ timeout: 8_000 })
    })

    test('filtro frecuencia SEMANAL oculta el horario fixture que es DIARIO', async ({ page }) => {
        await page.goto('/admin/horarios?frecuencia=SEMANAL')
        await expect(page.getByText('RUT-CU3-BASE')).not.toBeVisible({ timeout: 8_000 })
        await expect(page.getByText('No se encontraron horarios')).toBeVisible()
    })

    test('filtro estado ACTIVO muestra el horario fixture', async ({ page }) => {
        await page.goto('/admin/horarios?estado=ACTIVO')
        await expect(page.getByText('RUT-CU3-BASE')).toBeVisible({ timeout: 8_000 })
    })

    // ── Formulario nueva ────────────────────────────────────────────────────

    test('campos obligatorios vacíos impiden enviar el formulario', async ({ page }) => {
        await page.goto('/admin/horarios/nueva')
        await page.getByRole('button', { name: 'Programar horario' }).click()
        // HTML5 validation retiene al usuario en la misma página
        await expect(page).toHaveURL('/admin/horarios/nueva')
    })

    test('seleccionar ruta pre-llena el precio base con su tarifaBase', async ({ page }) => {
        await page.goto('/admin/horarios/nueva')
        await page.selectOption('select[name="rutaID"]', rutaID)
        await expect(page.locator('input[name="precioBase"]')).toHaveValue('320', { timeout: 4_000 })
    })

    test('vigencia DEFINIDA muestra campo fecha fin; INDEFINIDA lo oculta', async ({ page }) => {
        await page.goto('/admin/horarios/nueva')
        await expect(page.locator('input[name="fechaFin"]')).not.toBeVisible()
        await page.selectOption('select[name="vigencia"]', 'DEFINIDA')
        await expect(page.locator('input[name="fechaFin"]')).toBeVisible({ timeout: 4_000 })
        await page.selectOption('select[name="vigencia"]', 'INDEFINIDA')
        await expect(page.locator('input[name="fechaFin"]')).not.toBeVisible()
    })

    // ── Creación — happy path (D7 Paso 1-17) ───────────────────────────────

    test('crear horario UNICO + INDEFINIDA → redirige al detalle y queda ACTIVO en BD', async ({ page }) => {
        await page.goto('/admin/horarios/nueva')
        await page.selectOption('select[name="rutaID"]', rutaID)
        await page.selectOption('select[name="autobusID"]', autobusID)
        await page.selectOption('select[name="conductorID"]', conductorID)
        await page.fill('input[name="fechaInicio"]', manana())
        await page.fill('input[name="horaSalida"]', '09:00')
        await page.selectOption('select[name="frecuencia"]', 'UNICO')
        await page.selectOption('select[name="vigencia"]', 'INDEFINIDA')
        // precio ya auto-llenado
        await page.getByRole('button', { name: 'Programar horario' }).click()
        await page.waitForURL(/\/admin\/horarios\/[0-9a-f-]{36}$/, { timeout: 14_000 })

        const id = page.url().split('/').pop()!
        const h  = await prisma.horario.findUnique({ where: { horarioID: id } })
        expect(h).not.toBeNull()
        expect(h!.frecuencia).toBe(FrecuenciaHorario.UNICO)
        expect(h!.vigencia).toBe(VigenciaHorario.INDEFINIDA)
        expect(h!.estado).toBe(EstadoHorario.ACTIVO)
    })

    test('crear horario DIARIO + DEFINIDA → crea con fechaFin en BD', async ({ page }) => {
        await page.goto('/admin/horarios/nueva')
        await page.selectOption('select[name="rutaID"]', rutaID)
        await page.selectOption('select[name="autobusID"]', autobusID)
        await page.selectOption('select[name="conductorID"]', conductorID)
        await page.fill('input[name="fechaInicio"]', manana())
        await page.fill('input[name="horaSalida"]', '14:30')
        await page.selectOption('select[name="frecuencia"]', 'DIARIO')
        await page.selectOption('select[name="vigencia"]', 'DEFINIDA')
        await page.fill('input[name="fechaFin"]', enUnMes())
        await page.fill('input[name="precioBase"]', '350')
        await page.getByRole('button', { name: 'Programar horario' }).click()
        await page.waitForURL(/\/admin\/horarios\/[0-9a-f-]{36}$/, { timeout: 14_000 })

        const id = page.url().split('/').pop()!
        const h  = await prisma.horario.findUnique({ where: { horarioID: id } })
        expect(h).not.toBeNull()
        expect(h!.frecuencia).toBe(FrecuenciaHorario.DIARIO)
        expect(h!.vigencia).toBe(VigenciaHorario.DEFINIDA)
        expect(h!.fechaFin).not.toBeNull()
        expect(Number(h!.precioBase)).toBe(320) // precio viene de ruta.getTarifaBase(), no del input del form
    })

    // ── Detalle ─────────────────────────────────────────────────────────────

    test('detalle muestra ruta, autobús, conductor y precio del horario fixture', async ({ page }) => {
        await page.goto(`/admin/horarios/${horarioFixtureID}`)
        await expect(page.locator('p.font-mono', { hasText: 'RUT-CU3-BASE' })).toBeVisible({ timeout: 8_000 })
        await expect(page.getByText('Ciudad de Oaxaca').first()).toBeVisible()
        await expect(page.getByText('Puerto Escondido').first()).toBeVisible()
        await expect(page.getByText('AUTO-CU3-01')).toBeVisible()
        await expect(page.getByText('Juan Pérez CU3').first()).toBeVisible()
        await expect(page.getByText('LIC-CU3-TEST')).toBeVisible()
        await expect(page.getByText('$320.00 MXN')).toBeVisible()
    })

    test('detalle de horario ACTIVO muestra el botón cancelar', async ({ page }) => {
        await page.goto(`/admin/horarios/${horarioFixtureID}`)
        await expect(page.getByRole('button', { name: /Cancelar horario/i })).toBeVisible({ timeout: 6_000 })
    })

    // ── Cancelación (D4 cancelar + D7 Paso 15-17) ──────────────────────────

    test('cancelar desde detalle → redirige a lista con horario en estado CANCELADO', async ({ page }) => {
        await page.goto(`/admin/horarios/${horarioFixtureID}`)
        await page.getByRole('button', { name: /Cancelar horario/i }).click()
        await page.waitForURL('/admin/horarios', { timeout: 12_000 })

        // Badge CANCELADO visible en la lista
        const fila = page.locator('tr').filter({ hasText: 'RUT-CU3-BASE' }).first()
        await expect(fila.getByText('CANCELADO')).toBeVisible({ timeout: 6_000 })

        // Estado correcto en BD
        const h = await prisma.horario.findUnique({ where: { horarioID: horarioFixtureID } })
        expect(h!.estado).toBe(EstadoHorario.CANCELADO)
    })

    test('horario cancelado no muestra el botón cancelar en el detalle', async ({ page }) => {
        await page.goto(`/admin/horarios/${horarioFixtureID}`)
        // El fixture fue cancelado en el test anterior
        await expect(page.getByRole('button', { name: /Cancelar horario/i })).not.toBeVisible({ timeout: 6_000 })
        await expect(page.getByText('CANCELADO')).toBeVisible()
    })

})
