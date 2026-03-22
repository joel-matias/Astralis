# Astralis

## Setup rapido para probar

### 1. Clonar e instalar

```bash
git clone https://github.com/joel-matias/Astralis.git
cd Astralis
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env
```

Configura en `.env`:

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DB_NAME"
AUTH_SECRET="pega_aqui_tu_secret"
```

Puedes generar `AUTH_SECRET` con:

```bash
npx auth secret
```

### 3. Preparar base de datos

Verifica que MySQL este corriendo y crea la base si aun no existe:

```sql
CREATE DATABASE astralis;
```

Aplica migraciones:

```bash
npm run prisma:migrate
```

Si quieres reiniciar todo desde cero:

```bash
npm run prisma:reset
```

### 4. Cargar datos de prueba

```bash
npm run prisma:seed
```

Credenciales de prueba iniciales:

- Email: `admin@astralis.mx`
- Password: `admin1234`

### 5. Ejecutar la app

```bash
npm run dev
```

Abrir:

```text
http://localhost:3000
```

## Scripts utiles

### Prisma

```bash
npm run prisma:generate
```
Genera Prisma Client.

```bash
npm run prisma:validate
```
Valida el `schema.prisma`.

```bash
npm run prisma:format
```
Formatea el schema.

```bash
npm run prisma:push
```
Sincroniza schema sin migraciones.

```bash
npm run prisma:migrate
```
Crea/aplica migraciones en desarrollo.

```bash
npm run prisma:reset
```
Elimina y recrea la base aplicando migraciones y seed.

```bash
npm run prisma:seed
```
Ejecuta semillas desde `prisma/seeds/seed.ts`.

```bash
npm run prisma:studio
```
Abre Prisma Studio.

### Playwright

```bash
npm run test:e2e
```
Corre pruebas e2e.

```bash
npm run test:e2e:ui
```
Abre UI de Playwright.

```bash
npm run test:e2e:headed
```
Corre pruebas con navegador visible.
