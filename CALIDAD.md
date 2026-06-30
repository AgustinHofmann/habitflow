# CALIDAD.md

Documento de calidad de **HabitFlow**. Explica, con nuestras palabras, las decisiones que
tomamos para asegurar que cada cambio que llega a producción esté verificado.

## Estrategia general

HabitFlow ya estaba funcional y desplegada (TP2). El paso de este TP fue **asegurar** ese
despliegue: que nada llegue a producción sin pasar una verificación automática. Atacamos dos
frentes:

1. **La lógica de negocio.** El cálculo de rachas y de porcentaje de cumplimiento vivía dentro
   del componente de estadísticas, mezclado con el render y con llamadas a Supabase, por lo que
   no se podía testear. Lo **extrajimos a funciones puras** (`src/lib/stats.ts`) sin cambiar el
   comportamiento, y lo cubrimos con tests unitarios.
2. **La protección de datos privados.** Lo más sensible de la app es que un usuario sin sesión
   no pueda entrar a las rutas privadas. Eso no lo garantiza un unit test (involucra router,
   contexto de auth y navegador), así que lo cubrimos con un test E2E.

Regla del pipeline: **el deploy solo ocurre si lint + tests + build pasan.** Preferimos no
desplegar antes que desplegar algo roto.

## Herramientas seleccionadas

- **Vitest (unit):** la app ya usa Vite, así que comparte configuración y no suma un toolchain
  aparte. Evaluamos Jest, pero pedía configuración extra para ESM/TypeScript sin dar nada a
  cambio.
- **Playwright (E2E):** maneja un navegador real con una API estable (`getByRole`, esperas
  automáticas) y se instala en CI con un solo comando. Evaluamos Cypress; Playwright nos resultó
  más simple de correr headless en GitHub Actions.
- **oxlint (lint):** rapidísimo y sin configuración para arrancar; corta errores estáticos antes
  de los tests.
- **GitHub Actions (CI/CD):** integrado al repo, sin servidor aparte.
- **Vercel (hosting):** ya era el deploy del TP2, así que mantenerlo evitó migrar.

## Tests desarrollados

**Unitarios (`src/lib/stats.test.ts`):**

- **`completionRate` — redondeo del porcentaje:** 3 de 7 días → 43 %, 7/7 → 100 %, 0/7 → 0 %.
- **`completionRate` — sin días considerados:** devuelve 0 (evita dividir por cero).
- **`currentStreak` — racha consecutiva:** 3 días seguidos completados hacia atrás → 3.
- **`currentStreak` — corte de racha:** si falta un día en el medio, la racha se corta y cuenta
  solo los días seguidos desde hoy.
- **`currentStreak` — hoy sin completar:** si hoy no está completado, la racha es 0.
- **`getLast7Days` — ventana de 7 días:** devuelve 7 fechas consecutivas terminando hoy.

**E2E (`e2e/auth-redirect.spec.ts`):**

- **Usuario no autenticado es redirigido al login.** Al entrar a `/` (dashboard protegido) sin
  sesión, `ProtectedRoute` redirige a `/login`. Es el flujo que protege todos los datos privados.

## Casos de uso críticos

Priorizamos proteger, en este orden:

1. **El control de acceso (auth).** Si un usuario sin sesión pudiera ver datos privados, sería el
   peor fallo posible (privacidad). Por eso el E2E ataca justamente la redirección al login.
2. **La correctitud de rachas y porcentajes.** Son el valor central de un tracker de hábitos: si
   una racha o un porcentaje miente, la app deja de tener sentido. Por eso son lo más cubierto a
   nivel unitario, incluyendo los casos borde (racha cortada, día de hoy sin completar).

Dejamos fuera de los tests automáticos el CRUD de hábitos que depende de Supabase real (ver
limitaciones): su rotura es más visible y testearlo requería infraestructura que no justificaba
el costo en este TP.

## Pipeline de CI/CD

Definido en `.github/workflows/ci.yml`. Se dispara en cada **push** y **pull request** a `main`
y ejecuta, en orden:

`lint → tests unitarios → tests E2E → build → deploy a Vercel`

1. **`npm ci`** — entorno reproducible con las versiones del `package-lock.json`.
2. **Lint** — corta temprano por errores estáticos (paso más barato, va primero).
3. **Tests unitarios** — la lógica de estadísticas.
4. **Tests E2E** — se instala Chromium y se corre el flujo de protección de rutas. Para que la
   app arranque sin Supabase real se usan variables dummy: `getSession()` lee la sesión local
   (sin red), así el usuario queda sin autenticar y se dispara la redirección que queremos probar.
5. **Build** — solo se llega si lint y tests pasaron.
6. **Deploy a Vercel** — corre **solo en push a `main`**, **solo si todo lo anterior pasó** y
   **solo si están los secrets de Vercel** (`if: ... && env.VERCEL_TOKEN != ''`); si no, se omite
   sin fallar.

**Decisiones de diseño:**

- **¿Por qué el deploy solo si los tests pasan?** Es el objetivo del TP: no subir nada sin
  verificar. Al ser un job con pasos secuenciales, si un paso falla el job se corta y el deploy
  nunca se ejecuta.
- **¿Qué pasa si falla el lint?** El pipeline se detiene en ese paso; no corren tests, build ni
  deploy, y la PR queda en rojo.
- **¿Por qué el deploy no corre en PRs?** Para que producción solo se actualice con lo ya
  revisado y mergeado a `main`. Las PRs igual corren lint + tests + build.

## Limitaciones y deuda técnica

- **CRUD de hábitos sin E2E:** crear/editar/borrar hábitos depende de Supabase real (usuario
  autenticado + datos sembrados). Lo dejamos como riesgo consciente; el E2E cubre el control de
  acceso, que es lo más crítico y no necesita backend.
- **Un solo navegador en E2E:** corremos Chromium. Firefox/WebKit quedaron afuera por tiempo y
  costo de CI.
- **Sin medición de cobertura:** sabemos qué cubrimos (la lógica de estadísticas y la protección
  de rutas) pero no tenemos el número exacto. Sería la primera mejora con más tiempo.
- **Lógica de fechas dependiente de zona horaria:** las funciones de fecha usan la TZ del entorno;
  los tests fijan la fecha al mediodía para ser deterministas, pero un cambio de TZ en producción
  podría correr el límite de un día. Aceptado como riesgo menor.
