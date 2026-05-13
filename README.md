# BM Parfums

E-commerce de perfumería de lujo. Catálogo de fragancias originales y decants, con checkout integrado a Wompi (Colombia), envío de facturas automatizado y panel administrativo para gestión de productos, marcas, categorías, pedidos y campañas de email.

## Stack

- **Next.js 16** (App Router, Turbopack, React 19)
- **TypeScript**
- **Tailwind CSS 4** + componentes UI con [Sileo](https://www.npmjs.com/package/sileo)
- **Supabase** — Auth + Postgres + Storage
  - Sesiones vía cookies HttpOnly (`@supabase/ssr`)
- **Wompi** — pasarela de pagos (tarjeta, PSE, Bancolombia transfer, contra entrega)
- **Resend** — envío transaccional de correos (facturas, promociones)
- **Cloudinary** — hosting de imágenes de productos
- **Vercel** — deploy

## Arquitectura

```
.
├── app/                            # App Router de Next.js
│   ├── page.tsx                    # Home (catálogo público)
│   ├── catalogo/                   # Listado con filtros
│   ├── marcas/  categorias/        # Navegación
│   ├── product/[id]/               # Ficha de producto
│   ├── checkout/                   # Carrito + pago con Wompi
│   ├── order-confirmation/[id]/    # Post-pago, dispara correo de factura
│   ├── dashboard/                  # Área del cliente (requiere sesión)
│   ├── admin/                      # Panel administrativo (requiere role=admin)
│   ├── registrarse/  contacto/
│   ├── actions/                    # Server Actions (uso de service role)
│   └── api/
│       ├── products/create/        # Crear/editar productos (admin)
│       ├── promotions/send/        # Envío masivo de promos (admin)
│       ├── send-invoice/           # Correo de factura post-pago
│       └── wompi/
│           ├── integrity/          # Firma de integridad para el widget
│           ├── webhook/            # Recibe eventos de Wompi
│           ├── check-env/
│           └── check-status/
├── components/                     # UI compartida (Header, Footer, ProductCard…)
├── context/                        # CartContext (estado global del carrito)
├── lib/
│   ├── supabase.ts                 # Cliente browser de Supabase (cookies)
│   └── api-auth.ts                 # Helper requireAdmin / hasInternalSecret
├── proxy.ts                        # "Middleware" de Next 16 — protege /admin, /dashboard
└── next.config.ts                  # Security headers + remotePatterns de imágenes
```

### Flujo de pago (alto nivel)

1. Cliente arma carrito → `/checkout`
2. `app/checkout/page.tsx` solicita firma de integridad a `/api/wompi/integrity`
3. Widget de Wompi procesa el pago
4. Wompi envía evento `transaction.updated` a `/api/wompi/webhook`
5. Webhook actualiza la orden, descuenta stock y llama a `/api/send-invoice` (con header `x-internal-secret`)
6. Resend manda el correo de factura al cliente
7. Cliente aterriza en `/order-confirmation/[id]`

### Seguridad

- **Auth de APIs admin** — `requireAdmin()` valida sesión Supabase + `profiles.role === 'admin'` en servidor
- **Proxy/middleware** ([proxy.ts](proxy.ts)) — protege `/admin/*`, `/dashboard/*`, `/api/admin/*` antes de renderizar
- **Sesiones en cookies HttpOnly** — `@supabase/ssr`, no leíbles desde JS (mitiga XSS)
- **Secret interno** (`INTERNAL_API_SECRET`) — el webhook se autentica con su propia API
- **Headers de seguridad** — HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Service role key** — solo en route handlers y server actions, nunca en componentes cliente

## Variables de entorno

Crea un archivo `.env.local` en la raíz con:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Resend (correos transaccionales)
RESEND_API_KEY=re_xxxxxxxx

# Wompi (pagos)
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_test_xxxxxxxx     # pub_test_ para sandbox, pub_prod_ para producción
WOMPI_INTEGRITY_SECRET=stagtest_integrity_xxxxxx

# URL base del sitio (usada por el webhook de Wompi)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Secret compartido entre el webhook de Wompi y /api/send-invoice
INTERNAL_API_SECRET=<64+ caracteres aleatorios>
```

> Para generar `INTERNAL_API_SECRET` en PowerShell:
> ```powershell
> $b = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); ($b | ForEach-Object { $_.ToString('x2') }) -join ''
> ```

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Comandos disponibles:
- `npm run dev` — servidor de desarrollo (Turbopack)
- `npm run build` — build de producción
- `npm run start` — servir el build
- `npm run lint` — ESLint

## Modelo de datos (Supabase)

Tablas principales:
- `profiles` — perfil de usuario, incluye `role` ('user' | 'admin')
- `products` — catálogo (con `images`, `decants`, `has_original`, `stock`, `is_active`, etc.)
- `brands`, `genders`, `categories` — taxonomías
- `orders` — pedidos (`items` JSON, `status`, `payment_method`, `shipping_info` JSON, `stock_deducted`)
- `hero_slides` — slides del banner principal
- `coupons` — cupones de descuento

> **RLS:** todas las tablas deben tener Row Level Security habilitado. `profiles.role` debe estar protegido para que un usuario no pueda escalar a admin editando su propio perfil.

## Deploy (Vercel)

1. Conecta el repo a Vercel
2. Configura las mismas variables de entorno en **Settings → Environment Variables** (Production, Preview y Development)
3. El dominio principal apunta a `bmparfums.com`
4. Configurar el webhook de Wompi apuntando a `https://<tu-dominio>/api/wompi/webhook`

## Roles y permisos

- **Usuario anónimo** — puede navegar el catálogo y hacer checkout como invitado
- **Usuario registrado** — accede a `/dashboard` para ver sus pedidos
- **Admin** (`profiles.role = 'admin'`) — accede a `/admin` para gestionar productos, marcas, categorías, pedidos, cupones y envío de promociones

Para promover un usuario a admin: en Supabase SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'tu-correo@dominio.com';
```

## Recomendaciones operativas

- Rotar llaves de Supabase / Resend / Wompi si sospechas filtración
- Mantener `WOMPI_INTEGRITY_SECRET` solo en servidor (nunca con prefijo `NEXT_PUBLIC_`)
- Activar 2FA en cuentas de Supabase, Wompi, Resend, GitHub y Vercel
- Revisar logs de Wompi en su panel ante cualquier transacción sospechosa
- Habilitar backups automáticos de Supabase
