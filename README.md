# Astralis



## Como arrancar el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/joel-matias/Astralis.git
cd astralis
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
