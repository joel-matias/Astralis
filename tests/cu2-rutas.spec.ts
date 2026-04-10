import { test, expect } from '@playwright/test'
import { PrismaClient, EstadoRuta, TipoRuta } from '@prisma/client'

const prisma = new PrismaClient()

const ADMIN = { email: 'admin@astralis.mx', password: 'admin1234' }

const CODIGO_BASE = 'RUT-CU2-BASE'
const CODIGO_DUP = 'RUT-CU2-DUP'
const CODIGO_UI_D = 'RUT-CU2-UD'
const CODIGO_UI_P = 'RUT-CU2-UP'

const ORI_BASE = 'Ixtlán de Juárez'
const DES_BASE = 'Miahuatlán de Porfirio'
const ORI_DUP = 'Tlacolula de Matamoros'
const DES_DUP = 'Ocotlán de Morelos'
const ORI_UI_D = 'Etla'
const DES_UI_D = 'Zaachila'
const ORI_UI_P = 'Tlaxiaco'
const DES_UI_P = 'Nochixtlán'

let authCookies: any[] = []

async function llenarFormulario(
    page: import('@playwright/test').Page,
    opts: {
        codigo: string
        origen: string
        destino: string
        terminalO?: string
        terminalD?: string
        distancia?: string
        tiempo?: string
        tarifa?: string
        tipo?: 'DIRECTA' | 'CON ESCALA'
    }
) {
    await page.fill('input[name="codigoRuta"]', opts.codigo)
    if (opts.tipo) await page.selectOption('select[name="tipoRuta"]', { label: opts.tipo })
    if (opts.tarifa !== undefined) await page.fill('input[name="tarifaBase"]', opts.tarifa)
    await page.fill('input[name="ciudadOrigen"]', opts.origen)
    await page.fill('input[name="terminalOrigen"]', opts.terminalO ?? 'Terminal Central')
    await page.fill('input[name="ciudadDestino"]', opts.destino)
    await page.fill('input[name="terminalDestino"]', opts.terminalD ?? 'Terminal Central')
    if (opts.distancia !== undefined) await page.fill('input[name="distanciaKm"]', opts.distancia)
    if (opts.tiempo !== undefined) await page.fill('input[name="tiempoEstimadoHrs"]', opts.tiempo)
}

async function guardar(page: import('@playwright/test').Page, modo: 'crear' | 'editar' = 'crear') {
    const label = modo === 'crear' ? 'Guardar y Finalizar' : 'Guardar Cambios'
    await page.getByRole('button', { name: label }).click()
}

async function limpiarDatosPrueba() {
    const codigos = [CODIGO_BASE, CODIGO_DUP, CODIGO_UI_D, CODIGO_UI_P]
    for (const codigo of codigos) {
        const ruta = await prisma.ruta.findFirst({ where: { codigoRuta: codigo } })
        if (ruta) {
            await prisma.paradaIntermedia.deleteMany({ where: { rutaID: ruta.rutaID } })
            await prisma.ruta.delete({ where: { rutaID: ruta.rutaID } })
        }
    }
    const extras = await prisma.ruta.findMany({
        where: {
            OR: [
                { ciudadOrigen: ORI_UI_D, ciudadDestino: DES_UI_D },
                { ciudadOrigen: ORI_UI_P, ciudadDestino: DES_UI_P },
            ],
        },
    })
    for (const r of extras) {
        await prisma.paradaIntermedia.deleteMany({ where: { rutaID: r.rutaID } })
        await prisma.ruta.delete({ where: { rutaID: r.rutaID } })
    }
}

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

test.describe('CU2 — Administración de Rutas', () => {

    test('lista muestra encabezados y la ruta pre-creada', async ({ page }) => {
        await page.goto('/admin/rutas')
        await expect(page).toHaveURL('/admin/rutas')

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

    test('crear ruta DIRECTA exitosamente — queda INACTIVA y registra log', async ({ page }) => {
        await page.goto('/admin/rutas/nueva')
        await expect(page.getByRole('heading', { name: 'Nueva Ruta' })).toBeVisible()

        await llenarFormulario(page, {
            codigo: CODIGO_UI_D,
            origen: ORI_UI_D,
            destino: DES_UI_D,
            distancia: '180',
            tiempo: '2.5',
            tarifa: '320',
        })

        await guardar(page)

        await expect(page).toHaveURL('/admin/rutas', { timeout: 12_000 })
        await expect(page.getByText(CODIGO_UI_D)).toBeVisible()

        const ruta = await prisma.ruta.findFirst({ where: { codigoRuta: CODIGO_UI_D } })
        expect(ruta).not.toBeNull()
        expect(ruta?.estado).toBe(EstadoRuta.INACTIVA)
        expect(ruta?.nombreRuta).toBe(`${ORI_UI_D} - ${DES_UI_D}`)

        const log = await prisma.logAuditoria.findFirst({
            where: { accion: 'CREAR_RUTA', detalles: { contains: CODIGO_UI_D } },
        })
        expect(log).not.toBeNull()
        expect(log?.resultado).toBe('Exito')
    })

    test('E1: campos obligatorios vacíos muestran error de validación', async ({ page }) => {
        await page.goto('/admin/rutas/nueva')

        // Los inputs tienen `required` HTML5 que bloquea el onSubmit antes del server action;
        // se elimina para alcanzar la validación del lado del servidor.
        await page.evaluate(() => {
            document.querySelectorAll('input[required], select[required]')
                .forEach(el => el.removeAttribute('required'))
        })

        await guardar(page)

        await expect(page.getByTestId('ruta-form-error'))
            .toContainText('Completa todos los campos obligatorios', { timeout: 8_000 })

        await expect(page).toHaveURL('/admin/rutas/nueva')
    })

    test('E2: ciudad origen igual a destino muestra error', async ({ page }) => {
        await page.goto('/admin/rutas/nueva')

        await llenarFormulario(page, {
            codigo: 'RUT-TEMP',
            origen: 'Oaxaca',
            destino: 'Oaxaca',
            distancia: '100',
            tarifa: '150',
        })
        await guardar(page)

        await expect(page.getByTestId('ruta-form-error'))
            .toContainText('La ciudad de origen y destino no pueden ser iguales', { timeout: 8_000 })
    })

    test('E3: distancia igual a 0 muestra error de valor inválido', async ({ page }) => {
        await page.goto('/admin/rutas/nueva')

        await llenarFormulario(page, {
            codigo: 'RUT-TEMP',
            origen: 'Loma Bonita',
            destino: 'Valle Nacional',
            distancia: '0',
            tarifa: '150',
        })
        await guardar(page)

        await expect(page.getByTestId('ruta-form-error'))
            .toContainText('La distancia debe ser mayor a 0 km', { timeout: 8_000 })
    })

    test('E3: tarifa base igual a 0 muestra error de valor inválido', async ({ page }) => {
        await page.goto('/admin/rutas/nueva')

        await llenarFormulario(page, {
            codigo: 'RUT-TEMP',
            origen: 'Loma Bonita',
            destino: 'Valle Nacional',
            distancia: '120',
            tarifa: '0',
        })
        await guardar(page)

        await expect(page.getByTestId('ruta-form-error'))
            .toContainText('La tarifa base debe ser mayor a $0', { timeout: 8_000 })
    })

    test('E6: mismo origen-destino muestra error con código de ruta existente', async ({ page }) => {
        await page.goto('/admin/rutas/nueva')

        await llenarFormulario(page, {
            codigo: 'RUT-NUEVO-X',
            origen: ORI_DUP,
            destino: DES_DUP,
            distancia: '130',
            tarifa: '200',
        })
        await guardar(page)

        const error = page.getByTestId('ruta-form-error')
        await expect(error).toContainText('Ya existe una ruta de', { timeout: 8_000 })
        await expect(error).toContainText(CODIGO_DUP)
    })

    test('código de ruta duplicado muestra error de unicidad', async ({ page }) => {
        await page.goto('/admin/rutas/nueva')

        await llenarFormulario(page, {
            codigo: CODIGO_DUP,
            origen: 'Putla Villa de Guerrero',
            destino: 'Tlapa de Comonfort',
            distancia: '95',
            tarifa: '160',
        })
        await guardar(page)

        await expect(page.getByTestId('ruta-form-error'))
            .toContainText('El código de ruta ya existe', { timeout: 8_000 })
    })

    test('CON_PARADAS sin paradas muestra error de validación', async ({ page }) => {
        await page.goto('/admin/rutas/nueva')

        await llenarFormulario(page, {
            codigo: 'RUT-TEMP-P',
            tipo: 'CON ESCALA',
            origen: 'Zimatlán de Álvarez',
            destino: 'Ejutla de Crespo',
            distancia: '75',
            tarifa: '130',
        })

        await guardar(page)

        await expect(page.getByTestId('ruta-form-error'))
            .toContainText('Una ruta CON PARADAS debe tener al menos una parada', { timeout: 8_000 })
    })

    test('crear ruta CON_PARADAS con parada completa — exitoso', async ({ page }) => {
        await page.goto('/admin/rutas/nueva')

        await llenarFormulario(page, {
            codigo: CODIGO_UI_P,
            tipo: 'CON ESCALA',
            origen: ORI_UI_P,
            destino: DES_UI_P,
            distancia: '220',
            tiempo: '3.5',
            tarifa: '380',
        })

        await page.getByRole('button', { name: 'Agregar Parada' }).click()

        await page.getByPlaceholder('Nombre Estación').fill('Estación Mixteca')
        await page.getByPlaceholder('Ciudad, Estado').fill('Huautla de Jiménez, Oax.')

        const numericInputs = page.locator('tr:has(button:has-text("OK")) input[type="number"]')
        await numericInputs.nth(0).fill('90')
        await numericInputs.nth(1).fill('15')
        await numericInputs.nth(2).fill('180')

        await page.getByRole('button', { name: 'OK' }).click()

        await expect(page.getByText('Estación Mixteca')).toBeVisible()

        await guardar(page)
        await expect(page).toHaveURL('/admin/rutas', { timeout: 12_000 })
        await expect(page.getByText(CODIGO_UI_P)).toBeVisible()

        const ruta = await prisma.ruta.findFirst({
            where: { codigoRuta: CODIGO_UI_P },
            include: { paradas: true },
        })
        expect(ruta).not.toBeNull()
        expect(ruta?.tipoRuta).toBe(TipoRuta.CON_PARADAS)
        expect(ruta?.paradas).toHaveLength(1)
        expect(ruta?.paradas[0].nombreParada).toBe('Estación Mixteca')
        expect(ruta?.paradas[0].ordenEnRuta).toBe(1)
    })

    test('cancelar formulario regresa a la lista sin crear ruta', async ({ page }) => {
        await page.goto('/admin/rutas/nueva')

        await llenarFormulario(page, {
            codigo: 'RUT-CANCELADA',
            origen: 'Yetla',
            destino: 'Tepelmeme',
        })

        await page.getByRole('button', { name: 'Cancelar Cambios' }).click()

        await expect(page).toHaveURL('/admin/rutas', { timeout: 8_000 })

        const rutaCancelada = await prisma.ruta.findFirst({ where: { codigoRuta: 'RUT-CANCELADA' } })
        expect(rutaCancelada).toBeNull()
    })

    test('ver detalle muestra datos correctos de la ruta', async ({ page }) => {
        await page.goto('/admin/rutas')

        const fila = page.locator('tr', { has: page.getByText(CODIGO_BASE) })
        await fila.getByTitle('Ver detalle').click()

        await expect(page).toHaveURL(/\/admin\/rutas\/.+$/, { timeout: 8_000 })

        // Usar first() porque el texto de ciudad se repite en distintos elementos del bento grid
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

        await guardar(page, 'editar')
        await expect(page).toHaveURL('/admin/rutas', { timeout: 12_000 })

        const actualizada = await prisma.ruta.findFirst({ where: { codigoRuta: CODIGO_BASE } })
        expect(Number(actualizada?.tarifaBase)).toBe(500)

        await prisma.ruta.update({
            where: { rutaID: ruta.rutaID },
            data: { tarifaBase: 420 },
        })
    })

    test('toggle INACTIVA → ACTIVA registra log ACTIVAR_RUTA en BD', async ({ page }) => {
        const ruta = await prisma.ruta.findFirst({ where: { codigoRuta: CODIGO_BASE } })
        if (!ruta) throw new Error(`Ruta ${CODIGO_BASE} no encontrada`)
        await prisma.ruta.update({
            where: { rutaID: ruta.rutaID },
            data: { estado: EstadoRuta.INACTIVA },
        })

        await page.goto('/admin/rutas')

        const fila = page.locator('tr', { has: page.getByText(CODIGO_BASE) })
        await fila.getByTitle('Activar').click()

        await expect(fila.getByTitle('Desactivar')).toBeVisible({ timeout: 8_000 })

        const actualizada = await prisma.ruta.findFirst({ where: { rutaID: ruta.rutaID } })
        expect(actualizada?.estado).toBe(EstadoRuta.ACTIVA)

        const log = await prisma.logAuditoria.findFirst({
            where: { accion: 'ACTIVAR_RUTA', detalles: { contains: ruta.rutaID } },
            orderBy: { fechaHora: 'desc' },
        })
        expect(log).not.toBeNull()
        expect(log?.resultado).toBe('Exito')
    })

    test('toggle ACTIVA → INACTIVA registra log DESACTIVAR_RUTA en BD', async ({ page }) => {
        const ruta = await prisma.ruta.findFirst({ where: { codigoRuta: CODIGO_DUP } })
        if (!ruta) throw new Error(`Ruta ${CODIGO_DUP} no encontrada`)
        await prisma.ruta.update({
            where: { rutaID: ruta.rutaID },
            data: { estado: EstadoRuta.ACTIVA },
        })

        await page.goto('/admin/rutas')

        const fila = page.locator('tr', { has: page.getByText(CODIGO_DUP) })
        await fila.getByTitle('Desactivar').click()

        await expect(fila.getByTitle('Activar')).toBeVisible({ timeout: 8_000 })

        const actualizada = await prisma.ruta.findFirst({ where: { rutaID: ruta.rutaID } })
        expect(actualizada?.estado).toBe(EstadoRuta.INACTIVA)

        const log = await prisma.logAuditoria.findFirst({
            where: { accion: 'DESACTIVAR_RUTA', detalles: { contains: ruta.rutaID } },
            orderBy: { fechaHora: 'desc' },
        })
        expect(log).not.toBeNull()
        expect(log?.resultado).toBe('Exito')
    })

    test('sin sesión activa /admin/rutas redirige a /login', async ({ browser }) => {
        const ctx = await browser.newContext()
        const page = await ctx.newPage()
        await page.goto('/admin/rutas')
        await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })
        await ctx.close()
    })

})
