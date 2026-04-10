import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const ADMIN = { email: 'admin@astralis.mx', password: 'admin1234' }

const TEST_EMAIL = 'test.cu1@astralis.mx'
const TEST_PASS  = 'TestAstralis1!'

async function resetTestUser() {
    await prisma.usuario.updateMany({
        where: { email: TEST_EMAIL },
        data: { intentosFallidos: 0, estado: 'ACTIVO', bloqueadoHasta: null },
    })
}

async function getTestUser() {
    return prisma.usuario.findUnique({ where: { email: TEST_EMAIL } })
}

async function intentarLogin(
    page: import('@playwright/test').Page,
    email: string,
    password: string
) {
    await page.getByLabel('Correo electrónico').fill(email)
    await page.getByLabel('Contraseña').fill(password)
    await page.getByRole('button', { name: 'Iniciar sesión' }).click()
}

async function esperarRespuesta(page: import('@playwright/test').Page) {
    await expect(page.getByRole('button', { name: /Iniciar sesión/ }))
        .toBeEnabled({ timeout: 10_000 })
}

test.beforeAll(async () => {
    const hash = await bcrypt.hash(TEST_PASS, 10)
    const rol = await prisma.rol.findFirst({ where: { nombre: 'ADMIN' } })
    if (!rol) throw new Error('Rol ADMIN no encontrado — ejecuta prisma db seed')

    await prisma.usuario.upsert({
        where: { email: TEST_EMAIL },
        update: {
            contrasenaHash: hash,
            intentosFallidos: 0,
            estado: 'ACTIVO',
            bloqueadoHasta: null,
        },
        create: {
            email: TEST_EMAIL,
            nombreCompleto: 'Usuario Test CU1',
            contrasenaHash: hash,
            rolID: rol.rolID,
        },
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

test.describe('CU1 — Autenticación', () => {

    test('login exitoso redirige a la ruta del rol', async ({ page }) => {
        await page.goto('/login')
        await intentarLogin(page, ADMIN.email, ADMIN.password)
        await expect(page).toHaveURL('/admin/dashboard', { timeout: 12_000 })
    })

    test('email no registrado muestra error de credenciales', async ({ page }) => {
        await page.goto('/login')
        await intentarLogin(page, 'noexiste@astralis.mx', 'cualquier')
        await expect(page.getByTestId('login-error'))
            .toContainText('Correo o contraseña incorrectos', { timeout: 8_000 })
    })

    test('contraseña incorrecta incrementa intentos sin bloquear', async ({ page }) => {
        await page.goto('/login')
        await intentarLogin(page, TEST_EMAIL, 'INCORRECTA')
        await expect(page.getByTestId('login-error'))
            .toContainText('Correo o contraseña incorrectos', { timeout: 8_000 })

        const user = await getTestUser()
        expect(user?.intentosFallidos).toBe(1)
        expect(user?.estado).toBe('ACTIVO')
    })

    test('3 intentos fallidos bloquean la cuenta y notifican al admin', async ({ page }) => {
        await page.goto('/login')

        for (let i = 1; i <= 2; i++) {
            await intentarLogin(page, TEST_EMAIL, 'INCORRECTA')
            await expect(page.getByTestId('login-error'))
                .toContainText('Correo o contraseña incorrectos', { timeout: 8_000 })
            await esperarRespuesta(page)
        }

        await intentarLogin(page, TEST_EMAIL, 'INCORRECTA')
        await expect(page.getByTestId('login-error'))
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

    test('cuenta bloqueada impide el acceso con contraseña correcta', async ({ page }) => {
        await prisma.usuario.update({
            where: { email: TEST_EMAIL },
            data: {
                estado: 'BLOQUEADO',
                intentosFallidos: 3,
                bloqueadoHasta: new Date(Date.now() + 15 * 60 * 1000),
            },
        })

        await page.goto('/login')
        await intentarLogin(page, TEST_EMAIL, TEST_PASS)
        await expect(page.getByTestId('login-error'))
            .toContainText('Cuenta bloqueada temporalmente', { timeout: 8_000 })

        const user = await getTestUser()
        expect(user?.estado).toBe('BLOQUEADO')
    })

    test('desbloqueo automatico cuando el tiempo de bloqueo expiro', async ({ page }) => {
        await prisma.usuario.update({
            where: { email: TEST_EMAIL },
            data: {
                estado: 'BLOQUEADO',
                intentosFallidos: 3,
                bloqueadoHasta: new Date(Date.now() - 1_000),
            },
        })

        await page.goto('/login')
        await intentarLogin(page, TEST_EMAIL, TEST_PASS)
        await expect(page).toHaveURL('/admin/dashboard', { timeout: 12_000 })

        const user = await getTestUser()
        expect(user?.estado).toBe('ACTIVO')
        expect(user?.intentosFallidos).toBe(0)
        expect(user?.bloqueadoHasta).toBeNull()
    })

    test('ruta protegida sin sesion redirige a login', async ({ page }) => {
        await page.goto('/admin/dashboard')
        await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })
    })

})
