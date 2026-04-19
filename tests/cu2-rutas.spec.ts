import { test, expect, type Page } from '@playwright/test'
import { PrismaClient, EstadoRuta, TipoRuta } from '@prisma/client'

const prisma = new PrismaClient()
const ADMIN = { email: 'admin@astralis.mx', password: 'admin1234' }

// Fixture routes — created in beforeAll, deleted in afterAll
const CODIGO_BASE = 'RUT-CU2-BASE'
const CODIGO_DUP  = 'RUT-CU2-DUP'

const ORI_BASE = 'Ixtlán de Juárez'
const DES_BASE = 'Miahuatlán de Porfirio'
const ORI_DUP  = 'Tlacolula de Matamoros'
const DES_DUP  = 'Ocotlán de Morelos'

// Wizard-created routes during tests
const ORI_UI_D   = 'Etla'
const DES_UI_D   = 'Zaachila'
const ORI_UI_ACT = 'Loma Bonita'
const DES_UI_ACT = 'Valle Nacional'
const ORI_UI_P   = 'Tlaxiaco'
const DES_UI_P   = 'Nochixtlán'

let authCookies: any[] = []

// --- Helpers ---

async function llenarPaso1(
    page: Page,
    opts: {
        origen: string
        destino: string
        tarifa?: string
        tipo?: 'DIRECTA' | 'CON_PARADAS'
        terminalO?: string
        terminalD?: string
    }
) {
    if (opts.tipo) await page.selectOption('select[name="tipoRuta"]', opts.tipo)
    await page.fill('input[name="tarifaBase"]', opts.tarifa ?? '200')
    await page.fill('input[name="ciudadOrigen"]', opts.origen)
    await page.fill('input[name="terminalOrigen"]', opts.terminalO ?? 'Terminal Central')
    await page.fill('input[name="ciudadDestino"]', opts.destino)
    await page.fill('input[name="terminalDestino"]', opts.terminalD ?? 'Terminal Central')
    await page.getByRole('button', { name: 'Siguiente' }).click()
}

async function llenarPaso3(page: Page, distancia: string, tiempo: string) {
    await expect(page.getByTestId('input-distancia-km')).toBeVisible({ timeout: 8_000 })
    await page.getByTestId('input-distancia-km').fill(distancia)
    await page.getByTestId('input-tiempo-hrs').fill(tiempo)
}

async function agregarParada(page: Page, opts: {
    nombre: string
    ciudad: string
    distancia?: string
    espera?: string
    tarifa?: string
}) {
    await page.getByRole('button', { name: 'Agregar Parada' }).click()
    const filaCaptura = page.locator('tr').filter({ has: page.getByRole('button', { name: 'OK' }) })
    await filaCaptura.getByPlaceholder('Nombre Estación').fill(opts.nombre)
    await filaCaptura.getByPlaceholder('Ciudad, Estado').fill(opts.ciudad)
    const numInputs = filaCaptura.locator('input[type="number"]')
    await numInputs.nth(0).fill(opts.distancia ?? '50')
    await numInputs.nth(1).fill(opts.espera ?? '10')
    await numInputs.nth(2).fill(opts.tarifa ?? '100')
    await page.getByRole('button', { name: 'OK' }).click()
}

async function deleteByOriDes(ori: string, des: string) {
    const rutas = await prisma.ruta.findMany({ where: { ciudadOrigen: ori, ciudadDestino: des } })
    for (const r of rutas) {
        await prisma.paradaIntermedia.deleteMany({ where: { rutaID: r.rutaID } })
        await prisma.ruta.delete({ where: { rutaID: r.rutaID } })
    }
}

async function limpiarDatosPrueba() {
    for (const codigo of [CODIGO_BASE, CODIGO_DUP]) {
        const r = await prisma.ruta.findFirst({ where: { codigoRuta: codigo } })
        if (r) {
            await prisma.paradaIntermedia.deleteMany({ where: { rutaID: r.rutaID } })
            await prisma.ruta.delete({ where: { rutaID: r.rutaID } })
        }
    }
    for (const [ori, des] of [
        [ORI_UI_D, DES_UI_D],
        [ORI_UI_ACT, DES_UI_ACT],
        [ORI_UI_P, DES_UI_P],
        [ORI_DUP, DES_DUP],
    ]) {
        await deleteByOriDes(ori, des)
    }
}

// --- Setup ---

test.beforeAll(async ({ browser }) => {
    await limpiarDatosPrueba()

    const adminUser = await prisma.usuario.findUnique({ where: { email: ADMIN.email } })
    if (!adminUser) throw new Error('Seed no aplicado: usuario admin no encontrado')

    await prisma.ruta.create({
        data: {
            codigoRuta: CODIGO_BASE,
            nombreRuta: `${ORI_BASE} - ${DES_BASE}`,
            ciudadOrigen: ORI_BASE,
            ciudadDestino: DES_BASE,
            terminalOrigen: 'Terminal Norte',
            terminalDestino: 'Terminal Sur',
            distanciaKm: 250,
            tiempoEstimadoHrs: 4,
            tipoRuta: TipoRuta.DIRECTA,
            tarifaBase: 420,
            estado: EstadoRuta.INACTIVA,
            creadoPorID: adminUser.usuarioID,
        },
    })

    await prisma.ruta.create({
        data: {
            codigoRuta: CODIGO_DUP,
            nombreRuta: `${ORI_DUP} - ${DES_DUP}`,
            ciudadOrigen: ORI_DUP,
            ciudadDestino: DES_DUP,
            terminalOrigen: 'Terminal Central',
            terminalDestino: 'Terminal Central',
            distanciaKm: 120,
            tiempoEstimadoHrs: 2,
            tipoRuta: TipoRuta.DIRECTA,
            tarifaBase: 200,
            estado: EstadoRuta.ACTIVA,
            creadoPorID: adminUser.usuarioID,
        },
    })

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

// --- Tests ---

test.describe('CU2 — Administración de Rutas', () => {

    test('lista muestra encabezados y la ruta pre-creada', async ({ page }) => {
        await page.goto('/admin/rutas')
        await expect(page.getByRole('columnheader', { name: /Código/i })).toBeVisible()
        await expect(page.getByRole('columnheader', { name: /Trayecto/i })).toBeVisible()
        await expect(page.getByRole('columnheader', { name: /Tipo/i })).toBeVisible()
        await expect(page.getByRole('columnheader', { name: /Estado/i })).toBeVisible()
        await expect(page.getByRole('columnheader', { name: /Tarifa/i })).toBeVisible()
        await expect(page.getByText(CODIGO_BASE)).toBeVisible()
        await expect(page.getByText(ORI_BASE)).toBeVisible()
    })

    test('búsqueda por código filtra la lista correctamente', async ({ page }) => {
        await page.goto('/admin/rutas')
        await page.getByPlaceholder(/Buscar por código/).fill(CODIGO_BASE)
        await page.waitForURL(/q=RUT-CU2-BASE/, { timeout: 6_000 })
        await expect(page.getByText(CODIGO_BASE)).toBeVisible()
        await expect(page.getByText(CODIGO_DUP)).not.toBeVisible()
    })

    test('filtro por estado INACTIVA muestra solo rutas inactivas', async ({ page }) => {
        await page.goto('/admin/rutas')
        await page.locator('select:has(option[value="INACTIVA"])').selectOption('INACTIVA')
        await page.waitForURL(/estado=INACTIVA/, { timeout: 6_000 })
        await expect(page.getByText(CODIGO_BASE)).toBeVisible()
        await expect(page.getByText(CODIGO_DUP)).not.toBeVisible()
    })

    // --- Paso 1 validation (D6: E1, E2, E3) ---

    test('E1: campos obligatorios vacíos muestran error en paso 1', async ({ page }) => {
        await page.goto('/admin/rutas/nueva')
        // codigoRuta está pre-relleno; basta con no rellenar origen/destino/terminales
        await page.getByRole('button', { name: 'Siguiente' }).click()
        await expect(page.getByTestId('error-campos-vacios'))
            .toContainText('Completa todos los campos obligatorios', { timeout: 8_000 })
        await expect(page.getByRole('button', { name: 'Siguiente' })).toBeVisible()
    })

    test('E2: ciudad origen igual a destino muestra error en paso 1', async ({ page }) => {
        await page.goto('/admin/rutas/nueva')
        await page.fill('input[name="tarifaBase"]', '200')
        await page.fill('input[name="ciudadOrigen"]', 'Oaxaca')
        await page.fill('input[name="terminalOrigen"]', 'Terminal Central')
        await page.fill('input[name="ciudadDestino"]', 'Oaxaca')
        await page.fill('input[name="terminalDestino"]', 'Terminal Central')
        await page.getByRole('button', { name: 'Siguiente' }).click()
        await expect(page.getByTestId('error-origen-destino'))
            .toContainText('origen y destino no pueden ser iguales', { timeout: 8_000 })
    })

    test('E3: tarifa base igual a 0 muestra error en paso 1', async ({ page }) => {
        await page.goto('/admin/rutas/nueva')
        await page.fill('input[name="tarifaBase"]', '0')
        await page.fill('input[name="ciudadOrigen"]', 'Oaxaca')
        await page.fill('input[name="terminalOrigen"]', 'Terminal Central')
        await page.fill('input[name="ciudadDestino"]', 'Tuxtepec')
        await page.fill('input[name="terminalDestino"]', 'Terminal Central')
        await page.getByRole('button', { name: 'Siguiente' }).click()
        await expect(page.getByTestId('error-valores-numericos'))
            .toContainText('tarifa base debe ser mayor a 0', { timeout: 8_000 })
    })

    // --- Paso 3 validation ---

    test('guardar sin distancia ni tiempo muestra error en paso 3', async ({ page }) => {
        await page.goto('/admin/rutas/nueva')
        await llenarPaso1(page, { origen: 'Etla', destino: 'Ejutla de Crespo', tarifa: '150' })
        // paso 3 aparece — no rellenar distancia/tiempo
        await expect(page.getByTestId('input-distancia-km')).toBeVisible({ timeout: 8_000 })
        await page.getByRole('button', { name: 'Guardar Ruta' }).click()
        await expect(page.getByTestId('ruta-form-error'))
            .toContainText('Ingresa la distancia y el tiempo estimado', { timeout: 8_000 })
    })

    // --- Happy paths ---

    test('crear ruta DIRECTA → no activar → queda INACTIVA + log CREAR_RUTA', async ({ page }) => {
        await page.goto('/admin/rutas/nueva')
        await llenarPaso1(page, { origen: ORI_UI_D, destino: DES_UI_D, tarifa: '320' })
        await llenarPaso3(page, '180', '2.5')
        await page.getByRole('button', { name: 'Guardar Ruta' }).click()

        await expect(page.getByRole('button', { name: 'No activar por ahora' })).toBeVisible({ timeout: 10_000 })
        await page.getByRole('button', { name: 'No activar por ahora' }).click()
        await expect(page).toHaveURL('/admin/rutas', { timeout: 12_000 })

        const ruta = await prisma.ruta.findFirst({ where: { ciudadOrigen: ORI_UI_D, ciudadDestino: DES_UI_D } })
        expect(ruta).not.toBeNull()
        expect(ruta?.estado).toBe(EstadoRuta.INACTIVA)
        expect(ruta?.nombreRuta).toBe(`${ORI_UI_D} - ${DES_UI_D}`)

        const log = await prisma.logAuditoria.findFirst({
            where: { accion: 'CREAR_RUTA', detalles: { contains: ruta!.codigoRuta } },
            orderBy: { fechaHora: 'desc' },
        })
        expect(log).not.toBeNull()
        expect(log?.resultado).toBe('Exito')
    })

    test('crear ruta DIRECTA → Activar Ahora → queda ACTIVA + log ACTIVAR_RUTA', async ({ page }) => {
        await page.goto('/admin/rutas/nueva')
        await llenarPaso1(page, { origen: ORI_UI_ACT, destino: DES_UI_ACT, tarifa: '280' })
        await llenarPaso3(page, '150', '2')
        await page.getByRole('button', { name: 'Guardar Ruta' }).click()

        await expect(page.getByRole('button', { name: 'Activar Ahora' })).toBeVisible({ timeout: 10_000 })
        await page.getByRole('button', { name: 'Activar Ahora' }).click()
        await expect(page).toHaveURL('/admin/rutas', { timeout: 12_000 })

        const ruta = await prisma.ruta.findFirst({ where: { ciudadOrigen: ORI_UI_ACT, ciudadDestino: DES_UI_ACT } })
        expect(ruta).not.toBeNull()
        expect(ruta?.estado).toBe(EstadoRuta.ACTIVA)

        const logCrear = await prisma.logAuditoria.findFirst({
            where: { accion: 'CREAR_RUTA', detalles: { contains: ruta!.codigoRuta } },
            orderBy: { fechaHora: 'desc' },
        })
        expect(logCrear).not.toBeNull()

        const logActivar = await prisma.logAuditoria.findFirst({
            where: { accion: 'ACTIVAR_RUTA', detalles: { contains: ruta!.codigoRuta } },
            orderBy: { fechaHora: 'desc' },
        })
        expect(logActivar).not.toBeNull()
        expect(logActivar?.resultado).toBe('Exito')
    })

    // --- E4: Duplicado (D6) ---

    test('E4: mismo origen-destino muestra advertencia de duplicado', async ({ page }) => {
        await page.goto('/admin/rutas/nueva')
        await llenarPaso1(page, { origen: ORI_DUP, destino: DES_DUP, tarifa: '220' })
        await llenarPaso3(page, '130', '2')
        await page.getByRole('button', { name: 'Guardar Ruta' }).click()

        const warning = page.getByTestId('ruta-form-warning')
        await expect(warning).toContainText('Ya existe la ruta', { timeout: 10_000 })
        await expect(warning).toContainText(CODIGO_DUP)

        // Cancelar — usuario decide no guardar
        await page.getByRole('button', { name: 'Cancelar' }).click()
        await expect(page.getByTestId('ruta-form-warning')).not.toBeVisible()
    })

    // --- CON_PARADAS (D6: paso 2) ---

    test('E5: parada con ciudad duplicada muestra error', async ({ page }) => {
        await page.goto('/admin/rutas/nueva')
        await llenarPaso1(page, { origen: 'Juxtlahuaca', destino: 'Putla Villa', tarifa: '200', tipo: 'CON_PARADAS' })

        await expect(page.getByRole('button', { name: 'Agregar Parada' })).toBeVisible({ timeout: 8_000 })
        await agregarParada(page, { nombre: 'Estación Mixteca', ciudad: 'Huautla de Jiménez' })
        await expect(page.getByText('Estación Mixteca')).toBeVisible({ timeout: 8_000 })

        // Intentar agregar segunda parada con la misma ciudad
        await agregarParada(page, { nombre: 'Parada Dos', ciudad: 'Huautla de Jiménez' })
        await expect(page.getByTestId('error-parada-invalida'))
            .toContainText('Ya existe una parada en Huautla de Jiménez', { timeout: 8_000 })
    })

    test('crear ruta CON_PARADAS con parada → exitoso', async ({ page }) => {
        await page.goto('/admin/rutas/nueva')
        await llenarPaso1(page, { origen: ORI_UI_P, destino: DES_UI_P, tarifa: '380', tipo: 'CON_PARADAS' })

        await expect(page.getByRole('button', { name: 'Agregar Parada' })).toBeVisible({ timeout: 8_000 })
        await agregarParada(page, { nombre: 'Estación Mixteca', ciudad: 'Teposcolula', distancia: '80', espera: '15', tarifa: '150' })
        await expect(page.getByText('Estación Mixteca')).toBeVisible({ timeout: 8_000 })

        await page.getByRole('button', { name: 'Finalizar Paradas' }).click()
        await llenarPaso3(page, '220', '3.5')
        await page.getByRole('button', { name: 'Guardar Ruta' }).click()

        await expect(page.getByRole('button', { name: 'No activar por ahora' })).toBeVisible({ timeout: 10_000 })
        await page.getByRole('button', { name: 'No activar por ahora' }).click()
        await expect(page).toHaveURL('/admin/rutas', { timeout: 12_000 })

        const ruta = await prisma.ruta.findFirst({
            where: { ciudadOrigen: ORI_UI_P, ciudadDestino: DES_UI_P },
            include: { paradas: true },
        })
        expect(ruta).not.toBeNull()
        expect(ruta?.tipoRuta).toBe(TipoRuta.CON_PARADAS)
        expect(ruta?.paradas).toHaveLength(1)
        expect(ruta?.paradas[0].nombreParada).toBe('Estación Mixteca')
        expect(ruta?.paradas[0].ordenEnRuta).toBe(1)
    })

    // --- Detail and edit ---

    test('ver detalle muestra datos correctos de la ruta', async ({ page }) => {
        await page.goto('/admin/rutas')
        const fila = page.locator('tr', { has: page.getByText(CODIGO_BASE) })
        await fila.getByTitle('Ver detalle').click()
        await expect(page).toHaveURL(/\/admin\/rutas\/.+$/, { timeout: 8_000 })
        await expect(page.getByText(CODIGO_BASE).first()).toBeVisible()
        await expect(page.getByText(ORI_BASE).first()).toBeVisible()
        await expect(page.getByText(DES_BASE).first()).toBeVisible()
    })

    test('editar ruta precarga datos y guarda cambios exitosamente', async ({ page }) => {
        const ruta = await prisma.ruta.findFirst({ where: { codigoRuta: CODIGO_BASE } })
        if (!ruta) throw new Error(`Ruta ${CODIGO_BASE} no encontrada en BD`)

        await page.goto(`/admin/rutas/${ruta.rutaID}/editar`)
        await expect(page.getByRole('heading', { name: 'Editar Ruta' })).toBeVisible()
        await expect(page.locator('input[name="codigoRuta"]')).toHaveValue(CODIGO_BASE)
        await expect(page.locator('input[name="ciudadOrigen"]')).toHaveValue(ORI_BASE)

        await page.fill('input[name="tarifaBase"]', '500')
        await page.getByRole('button', { name: 'Guardar Cambios' }).click()
        await expect(page).toHaveURL('/admin/rutas', { timeout: 12_000 })

        const actualizada = await prisma.ruta.findFirst({ where: { codigoRuta: CODIGO_BASE } })
        expect(Number(actualizada?.tarifaBase)).toBe(500)

        await prisma.ruta.update({ where: { rutaID: ruta.rutaID }, data: { tarifaBase: 420 } })
    })

    // --- Toggle (D7: log con codigoRuta) ---

    test('toggle INACTIVA → ACTIVA registra log ACTIVAR_RUTA en BD', async ({ page }) => {
        const ruta = await prisma.ruta.findFirst({ where: { codigoRuta: CODIGO_BASE } })
        if (!ruta) throw new Error(`Ruta ${CODIGO_BASE} no encontrada`)
        await prisma.ruta.update({ where: { rutaID: ruta.rutaID }, data: { estado: EstadoRuta.INACTIVA } })

        await page.goto('/admin/rutas')
        const fila = page.locator('tr', { has: page.getByText(CODIGO_BASE) })
        await fila.getByTitle('Activar').click()
        await expect(fila.getByTitle('Desactivar')).toBeVisible({ timeout: 8_000 })

        const actualizada = await prisma.ruta.findFirst({ where: { rutaID: ruta.rutaID } })
        expect(actualizada?.estado).toBe(EstadoRuta.ACTIVA)

        const log = await prisma.logAuditoria.findFirst({
            where: { accion: 'ACTIVAR_RUTA', detalles: { contains: ruta.codigoRuta } },
            orderBy: { fechaHora: 'desc' },
        })
        expect(log).not.toBeNull()
        expect(log?.resultado).toBe('Exito')
    })

    test('toggle ACTIVA → INACTIVA registra log DESACTIVAR_RUTA en BD', async ({ page }) => {
        const ruta = await prisma.ruta.findFirst({ where: { codigoRuta: CODIGO_DUP } })
        if (!ruta) throw new Error(`Ruta ${CODIGO_DUP} no encontrada`)
        await prisma.ruta.update({ where: { rutaID: ruta.rutaID }, data: { estado: EstadoRuta.ACTIVA } })

        await page.goto('/admin/rutas')
        const fila = page.locator('tr', { has: page.getByText(CODIGO_DUP) })
        await fila.getByTitle('Desactivar').click()
        await expect(fila.getByTitle('Activar')).toBeVisible({ timeout: 8_000 })

        const actualizada = await prisma.ruta.findFirst({ where: { rutaID: ruta.rutaID } })
        expect(actualizada?.estado).toBe(EstadoRuta.INACTIVA)

        const log = await prisma.logAuditoria.findFirst({
            where: { accion: 'DESACTIVAR_RUTA', detalles: { contains: ruta.codigoRuta } },
            orderBy: { fechaHora: 'desc' },
        })
        expect(log).not.toBeNull()
        expect(log?.resultado).toBe('Exito')
    })

    // --- Auth ---

    test('sin sesión activa /admin/rutas redirige a /login', async ({ browser }) => {
        const ctx = await browser.newContext()
        const page = await ctx.newPage()
        await page.goto('/admin/rutas')
        await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })
        await ctx.close()
    })
})
