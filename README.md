# Astralis



## Como arrancar el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/joel-matias/Astralis.git
cd Astralis
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar las variables de entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Despues, abre el archivo `.env` y configura tu conexion a MySQL:

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DB_NAME"
```

Ejemplo:

```env
DATABASE_URL="mysql://root:root@localhost:3306/astralis"
```

### 4. Asegurarte de tener MySQL corriendo

Antes de levantar la app, verifica que tu servidor MySQL este encendido y que la base de datos exista.

Si todavia no creaste la base de datos, puedes hacerlo con:

```sql
CREATE DATABASE astralis;
```

### 5. Generar el cliente de Prisma

```bash
npx prisma generate
```

### 6. Arrancar la aplicacion en desarrollo

```bash
npm run dev
```

Luego abre en tu navegador:

```text
http://localhost:3000
```

## Scripts de Prisma

```bash
npm run prisma:generate
```

Genera el cliente de Prisma.

```bash
npm run prisma:validate
```

Valida que el archivo `schema.prisma` no tenga errores.

```bash
npm run prisma:format
```

Ordena y formatea el archivo `schema.prisma`.

```bash
npm run prisma:push
```

Sincroniza los cambios del schema con la base de datos.

```bash
npm run prisma:migrate
```

Para crear y aplicar las migraciones.

```bash
npm run prisma:studio
```

Para ver y editar datos de manera visual

## Pruebas E2E con Playwright

Para ejecutar las pruebas end-to-end:

```bash
npm run test:e2e
```

Para abrir la interfaz visual de Playwright:

```bash
npm run test:e2e:ui
```

Para correr las pruebas viendo el navegador (la configure con firefox porque es el que mas utilizo pero pueden cambiarlo si quieren):

```bash
npm run test:e2e:headed
```
