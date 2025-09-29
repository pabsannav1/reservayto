# 🏛️ Sistema de Reservas Municipal

Una aplicación web moderna para la gestión de reservas de salas y espacios municipales, desarrollada con Next.js 15, Prisma y PostgreSQL.

## 📖 Descripción

Este sistema permite a los ayuntamientos gestionar de manera eficiente las reservas de sus espacios públicos como salones de plenos, salas de reuniones, gimnasios, auditorios y otros edificios municipales.

### ✨ Características Principales

- **🔐 Autenticación por PIN**: Sistema seguro sin acceso público
- **👥 Gestión de Roles**: Administradores y usuarios normales
- **🏢 Gestión de Edificios**: CRUD completo de edificios municipales
- **🚪 Gestión de Salas**: CRUD completo de salas con capacidad y equipamiento
- **📅 Sistema de Reservas**: Creación, edición y gestión de reservas
- **👤 Gestión de Usuarios**: Administración de usuarios y permisos
- **📊 Dashboard Administrativo**: Vista general de reservas y estadísticas
- **📱 Interfaz Responsive**: Diseño adaptable a dispositivos móviles

### 🔧 Funcionalidades por Rol

#### 🔑 Administradores (PIN: 7788)
- ✅ Gestión completa de usuarios, edificios, salas y reservas
- ✅ Creación y edición de todos los elementos del sistema
- ✅ Acceso al panel de administración completo
- ✅ Asignación de edificios a usuarios

#### 👤 Usuarios Normales (PIN: 5678)
- ✅ Visualización de calendarios de reservas
- ✅ Consulta de disponibilidad de salas
- ✅ Vista de información de edificios y salas

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Base de Datos**: PostgreSQL (Neon), Prisma ORM
- **Componentes**: Lucide Icons, FullCalendar
- **Deployment**: Vercel

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+
- npm/yarn
- Base de datos PostgreSQL

### Configuración Local

1. **Clonar el repositorio**:
```bash
git clone <repository-url>
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

Edita `.env` con tus valores:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/reservas"
NEXTAUTH_SECRET="tu-clave-secreta-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Configurar base de datos**:
```bash
npm run db:push      # Sincronizar schema
npm run db:seed      # Datos iniciales
```

5. **Ejecutar en desarrollo**:
```bash
npm run dev
```

Visita [http://localhost:3000](http://localhost:3000)

## 🔐 Acceso al Sistema

### Usuarios por Defecto:
- **Admin Municipal**: PIN `7788` (Acceso completo)
- **Gestor Deportes**: PIN `5678` (Solo consulta)

## 📦 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `npm run db:seed` - Poblar base de datos
- `npm run db:push` - Sincronizar schema
- `npm run lint` - Verificar código

## 🌐 Deployment en Vercel

Ver guía completa en [DEPLOYMENT.md](./DEPLOYMENT.md)

1. **Crear base de datos en Neon**
2. **Configurar variables de entorno en Vercel**
3. **Hacer push a Git (deployment automático)**

### Variables de Entorno Requeridas:
```bash
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-app.vercel.app
```

## 📁 Estructura del Proyecto

```
├── app/
│   ├── api/              # API Routes
│   ├── admin/            # Panel administrativo
│   ├── auth/             # Autenticación
│   └── components/       # Componentes React
├── prisma/
│   ├── schema.prisma     # Schema de base de datos
│   └── seed.ts          # Datos iniciales
├── types/               # Tipos TypeScript
└── middleware.ts        # Middleware de autenticación
```

## 🎯 Casos de Uso

### Para Ayuntamientos:
- Gestión centralizada de espacios públicos
- Control de reservas de salones de plenos
- Administración de instalaciones deportivas
- Reserva de auditorios para eventos culturales

### Para Ciudadanos (a través de gestores):
- Solicitud de espacios para eventos
- Consulta de disponibilidad
- Información de equipamiento disponible

## 🔒 Seguridad

- ✅ Autenticación obligatoria para todas las rutas
- ✅ Sistema de roles y permisos
- ✅ Middleware de protección de rutas
- ✅ Validación de datos en servidor
- ✅ Sanitización de inputs

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- 📧 Email: soporte@ayuntamiento.es
- 💻 Issues: GitHub Issues
- 📚 Documentación: [DEPLOYMENT.md](./DEPLOYMENT.md)