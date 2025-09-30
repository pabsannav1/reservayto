# Guía de Despliegue en Vercel con Neon PostgreSQL

## 📋 Requisitos Previos

1. **Cuenta en Neon**: Crea una cuenta en [Neon](https://neon.tech)
2. **Cuenta en Vercel**: Crea una cuenta en [Vercel](https://vercel.com)
3. **Repositorio Git**: Proyecto subido a GitHub/GitLab/Bitbucket

## 🗃️ Configurar Base de Datos Neon

1. **Crear proyecto en Neon**:
   - Ve a [Neon Console](https://console.neon.tech)
   - Crea un nuevo proyecto
   - Selecciona región más cercana
   - Anota la **DATABASE_URL** de conexión

2. **URL de ejemplo**:
   ```
   postgresql://usuario:password@ep-host.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

## 🚀 Configurar Vercel

### 1. Importar Proyecto
- Ve a [Vercel Dashboard](https://vercel.com/dashboard)
- Click "New Project"
- Importa tu repositorio Git
- Framework: **Next.js** (auto-detectado)

### 2. Variables de Entorno
En Vercel Dashboard > Settings > Environment Variables, agrega **UNA POR UNA**:

| Variable | Valor | Environments |
|----------|-------|--------------|
| `DATABASE_URL` | `postgresql://tu-usuario:tu-password@tu-host.neon.tech/tu-db?sslmode=require` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `tu-clave-secreta-minimo-32-caracteres` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://tu-app.vercel.app` | Production, Preview |
| `ADMIN_SECRET` | `clave-para-reseed-db` (opcional) | Production, Preview, Development |

**⚠️ IMPORTANTE**:
- Configura las variables **ANTES** del primer deployment
- Usa la URL completa de Neon incluyendo `?sslmode=require`
- Genera NEXTAUTH_SECRET con: `openssl rand -base64 32`

### 3. Generar NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

## 🔧 Scripts de Deployment

El proyecto incluye estos scripts automáticos:

- `vercel-build`: Genera Prisma client, ejecuta migraciones, seed y build
- `postinstall`: Genera Prisma client automáticamente
- `db:push`: Sincroniza schema con base de datos
- `db:seed`: Puebla base de datos con datos iniciales

## 👥 Usuarios por Defecto

Después del deployment, tendrás estos usuarios:

- **Administrador**: PIN `7788`
- **Usuario Normal**: PIN `5678`

## 📁 Estructura del Proyecto

```
├── prisma/
│   ├── schema.prisma     # Schema PostgreSQL
│   └── seed.ts          # Datos iniciales (PIN 7788)
├── .env.example         # Plantilla variables de entorno
├── vercel.json          # Configuración Vercel
└── DEPLOYMENT.md        # Esta guía
```

## 🔄 Process de Deployment

1. **Push código a Git**
2. **Vercel detecta cambios automáticamente**
3. **Se ejecutan automáticamente**:
   - `npm install`
   - `prisma generate`
   - `prisma db push` (sincroniza schema)
   - `npm run db:seed` (datos iniciales)
   - `next build`

## ⚠️ Notas Importantes

- El seed se ejecuta en cada deployment (datos se regeneran)
- PostgreSQL requiere `sslmode=require` en la URL
- Variables de entorno son obligatorias
- PIN de admin por defecto: **7788**

## 🆘 Troubleshooting

### Error: "Environment Variable references Secret which does not exist"
- **Solución**: Configura las variables directamente en Vercel Dashboard
- Ve a Settings > Environment Variables
- NO uses secretos de Vercel, usa variables normales

### Error: "DATABASE_URL not found"
- Verifica que la variable esté configurada en Vercel
- Asegúrate que la URL incluya `?sslmode=require`
- Verifica que esté habilitada para "Production"

### Error: "NEXTAUTH_SECRET not found" o "[next-auth][error][NO_SECRET]"
- **Síntoma**: Error 500 en `/api/auth/error` con mensaje "Please define a `secret` in production"
- **Causa**: Variable `NEXTAUTH_SECRET` no configurada en Vercel
- **Solución**:
  1. Genera una clave secreta: `openssl rand -base64 32`
  2. Ve a Vercel Dashboard > Settings > Environment Variables
  3. Agrega `NEXTAUTH_SECRET` con el valor generado
  4. Selecciona Production, Preview, Development
  5. Redespliega desde Dashboard o con `git push`

### Build falla en "prisma db push"
- Verifica que DATABASE_URL sea correcta
- Confirma que la base de datos Neon esté activa
- Revisa logs completos en Vercel Dashboard

### Base de datos no se inicializa
- Revisa logs de build en Vercel Dashboard
- Verifica que la URL de Neon sea correcta
- Confirma que la base de datos está activa en Neon
- Verifica que el comando de build incluya `prisma db push`

## 🎯 Resultado Final

Después del deployment exitoso:
- ✅ Aplicación accesible en `https://tu-app.vercel.app`
- ✅ Base de datos PostgreSQL configurada
- ✅ Admin con PIN 7788 listo para usar
- ✅ Sistema de reservas completamente funcional