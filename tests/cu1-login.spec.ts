import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const ADMIN     = { email: 'admin@astralis.mx', password: 'admin1234' }
const TEST_EMAIL = 'test.cu1@astralis.mx'
const TEST_PASS  = 'TestAstralis1!'

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function resetTestUser() {
    await prisma.usuario.updateMany({
        where: { email: TEST_EMAIL },
        data: { intentosFallidos: 0, estado: 'ACTIVO', bloqueadoHasta: null },
    })
    const user = await prisma.usuario.findUnique({ where: { email: TEST_EMAIL } })
    if (user) {
        await prisma.sesionActiva.deleteMany({ where: { usuarioID: user.usuarioID } })
    }
}

async function getTestUser() {
    return prisma.usuario.findUnique({ where: { email: TEST_EMAIL } })
}

async function llenarLogin(page: import('@playwright/test').Page, email: string, password: string) {
    await page.getByLabel('Correo electrónico').fill(email)
    await page.getByLabel('Contraseña').fill(password)
    await page.getByRole('button', { name: 'Iniciar sesión' }).click()
}

async function esperarBoton(page: import('@playwright/test').Page) {
    await expect(page.getByRole('button', { name: /Iniciar sesión/ }))
        .toBeEnabled({ timeout: 10_000 })
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

test.beforeAll(async () => {
    const hash = await bcrypt.hash(TEST_PASS, 10)
    const rol = await prisma.rol.findFirst({ where: { nombre: 'ADMIN' } })
    if (!rol) throw new Error('Rol ADMIN no encontrado — ejecuta: npx prisma db seed')

    await prisma.usuario.upsert({
        where: { email: TEST_EMAIL },
        update: { contrasenaHash: hash, intentosFallidos: 0, estado: 'ACTIVO', bloqueadoHasta: null },
        create: { email: TEST_EMAIL, nombreCompleto: 'Usuario Test CU1', contrasenaHash: hash, rolID: rol.rolID },
    })
})

test.beforeEach(async () => {
    await resetTestUser()
})

test.afterAll(async () => {
    const user = await getTestUser()
    if (user) {
        await prisma.sesionActiva.deleteMany({ where: { usuarioID: user.usuarioID } })
        await prisma.logAuditoria.deleteMany({ where: { usuarioID: user.usuarioID } })
        await prisma.usuario.delete({ where: { email: TEST_EMAIL } })
    }
    await prisma.$disconnect()
})

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('CU1 — Iniciar Sesión', () => {

    // Diagrama de secuencia: flujo principal — credenciales válidas
    test('login exitoso redirige al dashboard según el rol', async ({ page }) => {
        await page.goto('/login')
        await llenarLogin(page, ADMIN.email, ADMIN.password)
        await expect(page).toHaveURL('/admin/dashboard', { timeout: 12_000 })
    })

    // Diagrama de secuencia: flujo principal — log de acceso exitoso registrado en BD
    test('login exitoso registra log de acceso en BD', async ({ page }) => {
        const antes = new Date()
        await page.goto('/login')
        await llenarLogin(page, TEST_EMAIL, TEST_PASS)
        await expect(page).toHaveURL('/admin/dashboard', { timeout: 12_000 })

        const user = await getTestUser()
        const log = await prisma.logAuditoria.findFirst({
            where: { usuarioID: user!.usuarioID, accion: 'LOGIN', resultado: 'Exito' },
            orderBy: { fechaHora: 'desc' },
        })
        expect(log).not.toBeNull()
        expect(log!.fechaHora.getTime()).toBeGreaterThanOrEqual(antes.getTime())
    })

    // Diagrama de secuencia: flujo principal — sesión creada en BD (RN3: expira en 8h)
    test('login exitoso crea sesion activa en BD con expiracion de 8 horas', async ({ page }) => {
        await page.goto('/login')
        await llenarLogin(page, TEST_EMAIL, TEST_PASS)
        await expect(page).toHaveURL('/admin/dashboard', { timeout: 12_000 })

        const user = await getTestUser()
        const sesion = await prisma.sesionActiva.findFirst({
            where: { usuarioID: user!.usuarioID, activa: true },
        })
        expect(sesion).not.toBeNull()

        const diferenciaHoras = (sesion!.fechaExpiracion.getTime() - Date.now()) / 3_600_000
        expect(diferenciaHoras).toBeGreaterThan(7)
        expect(diferenciaHoras).toBeLessThanOrEqual(8)
    })

    // Diagrama de estados: RN4 — no sesiones simultáneas en múltiples dispositivos
    test('RN4: segundo login invalida la sesion anterior', async ({ browser }) => {
        const ctx1 = await browser.newContext()
        const ctx2 = await browser.newContext()
        const page1 = await ctx1.newPage()
        const page2 = await ctx2.newPage()

        await page1.goto('/login')
        await llenarLogin(page1, TEST_EMAIL, TEST_PASS)
        await expect(page1).toHaveURL('/admin/dashboard', { timeout: 12_000 })

        const user = await getTestUser()
        const sesion1 = await prisma.sesionActiva.findFirst({
            where: { usuarioID: user!.usuarioID, activa: true },
            orderBy: { fechaInicio: 'asc' },
        })

        await page2.goto('/login')
        await llenarLogin(page2, TEST_EMAIL, TEST_PASS)
        await expect(page2).toHaveURL('/admin/dashboard', { timeout: 12_000 })

        // La primera sesión debe haber sido invalidada en BD
        const sesion1Actualizada = await prisma.sesionActiva.findUnique({
            where: { sesionID: sesion1!.sesionID },
        })
        expect(sesion1Actualizada?.activa).toBe(false)

        await ctx1.close()
        await ctx2.close()
    })

    // Diagrama de secuencia: alt — email no registrado
    test('email no registrado muestra error de credenciales', async ({ page }) => {
        await page.goto('/login')
        await llenarLogin(page, 'noexiste@astralis.mx', 'cualquier')
        await expect(page.getByTestId('login-error'))
            .toContainText('Correo o contraseña incorrectos', { timeout: 8_000 })
    })

    // Diagrama de secuencia: alt — contraseña incorrecta, intento 1
    test('contraseña incorrecta incrementa intentosFallidos en 1 sin bloquear', async ({ page }) => {
        await page.goto('/login')
        await llenarLogin(page, TEST_EMAIL, 'INCORRECTA')
        await expect(page.getByTestId('login-error'))
            .toContainText('Correo o contraseña incorrectos', { timeout: 8_000 })

        const user = await getTestUser()
        expect(user?.intentosFallidos).toBe(1)
        expect(user?.estado).toBe('ACTIVO')
    })

    // Diagrama de secuencia: alt — contraseña incorrecta, intento 2
    test('segundo intento fallido lleva intentosFallidos a 2 sin bloquear', async ({ page }) => {
        await page.goto('/login')

        for (let i = 0; i < 2; i++) {
            await llenarLogin(page, TEST_EMAIL, 'INCORRECTA')
            await esperarBoton(page)
        }

        const user = await getTestUser()
        expect(user?.intentosFallidos).toBe(2)
        expect(user?.estado).toBe('ACTIVO')
    })

    // Diagrama de secuencia: alt — 3 intentos → bloqueo + log en BD
    test('3 intentos fallidos bloquean la cuenta y registran log de bloqueo', async ({ page }) => {
        await page.goto('/login')

        for (let i = 0; i < 2; i++) {
            await llenarLogin(page, TEST_EMAIL, 'INCORRECTA')
            await esperarBoton(page)
        }

        await llenarLogin(page, TEST_EMAIL, 'INCORRECTA')
        await expect(page.getByTestId('cuenta-bloqueada'))
            .toContainText('Cuenta bloqueada temporalmente', { timeout: 8_000 })

        const user = await getTestUser()
        expect(user?.estado).toBe('BLOQUEADO')
        expect(user?.intentosFallidos).toBe(3)
        expect(user?.bloqueadoHasta).not.toBeNull()

        const logBloqueo = await prisma.logAuditoria.findFirst({
            where: { usuarioID: user!.usuarioID, accion: 'BLOQUEO_CUENTA' },
        })
        expect(logBloqueo).not.toBeNull()
        expect(logBloqueo?.resultado).toBe('Bloqueado')
    })

    // Diagrama de estados: E4 — cuenta bloqueada impide acceso aunque la contraseña sea correcta
    test('cuenta bloqueada impide acceso con contraseña correcta', async ({ page }) => {
        await prisma.usuario.update({
            where: { email: TEST_EMAIL },
            data: { estado: 'BLOQUEADO', intentosFallidos: 3, bloqueadoHasta: new Date(Date.now() + 15 * 60 * 1000) },
        })

        await page.goto('/login')
        await llenarLogin(page, TEST_EMAIL, TEST_PASS)
        await expect(page.getByTestId('cuenta-bloqueada'))
            .toContainText('Cuenta bloqueada temporalmente', { timeout: 8_000 })

        const user = await getTestUser()
        expect(user?.estado).toBe('BLOQUEADO')
    })

    // Diagrama de estados: bloqueo temporal expirado → auto-desbloqueo → login exitoso
    test('bloqueo expirado permite volver a iniciar sesion', async ({ page }) => {
        await prisma.usuario.update({
            where: { email: TEST_EMAIL },
            data: { estado: 'BLOQUEADO', intentosFallidos: 3, bloqueadoHasta: new Date(Date.now() - 1_000) },
        })

        await page.goto('/login')
        await llenarLogin(page, TEST_EMAIL, TEST_PASS)
        await expect(page).toHaveURL('/admin/dashboard', { timeout: 12_000 })

        const user = await getTestUser()
        expect(user?.estado).toBe('ACTIVO')
        expect(user?.intentosFallidos).toBe(0)
        expect(user?.bloqueadoHasta).toBeNull()
    })

    // Diagrama de estados: S1 — ruta protegida sin sesión redirige a login
    test('ruta protegida sin sesion activa redirige a login', async ({ page }) => {
        await page.goto('/admin/dashboard')
        await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })
    })

})
