# Sistema de Reservas Municipal

Sistema web para gestión de reservas de edificios y salas municipales.

## Características

- **Vista Pública**: Calendario con filtros por edificio y sala
- **Sistema de Autenticación**: Login para administradores
- **Dashboard Admin**: CRUD de edificios, salas y reservas
- **Relaciones N:N**: Usuarios pueden gestionar múltiples edificios
- **Filtros Inteligentes**: Vista de reservas por edificio o sala específica

## Tecnologías

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: SQLite con Prisma ORM
- **Autenticación**: NextAuth.js
- **Calendario**: FullCalendar.js
- **Icons**: Lucide React

## Instalación

1. **Clonar el repositorio**:
```bash
git clone https://github.com/pabsannav1/reservayto.git
cd reservayto
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
```bash
cp .env.example .env
```
Editar `.env` con tus configuraciones.

4. **Configurar la base de datos**:
```bash
# Para desarrollo (SQLite)
npx prisma migrate dev

# Poblar con datos de prueba
npm run db:seed
```

5. **Ejecutar en desarrollo**:
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Usuarios de Prueba

Después de ejecutar el seed:

- **Admin Principal**: admin@ayuntamiento.es / admin123
- **Gestor Deportes**: deportes@ayuntamiento.es / admin123

## Estructura del Proyecto

```
app/
├── api/                 # API endpoints
│   ├── auth/           # Autenticación NextAuth
│   ├── edificios/      # CRUD edificios
│   ├── salas/         # CRUD salas
│   ├── reservas/      # CRUD reservas
│   └── admin/         # Endpoints privados
├── auth/              # Páginas de autenticación
├── admin/             # Dashboard administrativo
└── components/        # Componentes React

prisma/
├── schema.prisma      # Esquema de base de datos
├── seed.ts           # Datos de prueba
└── migrations/       # Migraciones
```

## Funcionalidades

### Vista Pública
- Calendario interactivo (día/semana/mes)
- Filtros por edificio y sala
- Visualización de reservas confirmadas
- Botón de acceso para administradores

### Dashboard Admin
- Panel de estadísticas
- Gestión de edificios y salas
- Creación y gestión de reservas
- Acceso limitado a edificios asignados

### Base de Datos
- **Usuarios**: Administradores del sistema
- **Edificios**: Locaciones municipales
- **Salas**: Espacios dentro de edificios
- **Reservas**: Bookings con estado y horarios
- **Horarios**: Disponibilidad de salas por día

## Scripts Disponibles

```bash
npm run dev         # Desarrollo
npm run build       # Build producción
npm run start       # Servidor producción
npm run lint        # Linter
npm run db:seed     # Poblar base de datos
```

## Deployment en Producción

### Vercel + Neon PostgreSQL

1. **Crear base de datos en Neon**:
   - Registrarse en [Neon](https://neon.tech)
   - Crear nueva base de datos PostgreSQL
   - Copiar la connection string

2. **Configurar variables de entorno en Vercel**:
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_URL=https://tu-dominio.vercel.app
   NEXTAUTH_SECRET=secreto-super-seguro-produccion
   ```

3. **Deploy**:
   ```bash
   # Push a GitHub
   git push origin main

   # Deploy automático en Vercel
   # O manual: vercel --prod
   ```

4. **Ejecutar migraciones en producción**:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Configuración Base de Datos

- **Desarrollo**: SQLite (`file:./dev.db`)
- **Producción**: PostgreSQL (Neon, Supabase, etc.)

El esquema está configurado para PostgreSQL por defecto. Para desarrollo local con SQLite, cambiar en `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"  // Cambiar a sqlite para desarrollo
  url      = env("DATABASE_URL")
}
```

## Seguridad

- Autenticación requerida para rutas admin
- Usuarios solo ven/gestionan sus edificios asignados
- Passwords hasheados con bcrypt
- Middleware de protección de rutas

## Licencia

MIT
