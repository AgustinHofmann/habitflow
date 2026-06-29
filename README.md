# HabitFlow

Aplicación web para tracking de hábitos diarios. Permite registrar hábitos, marcarlos como completados cada día y visualizar el progreso.

## Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Estilos:** Tailwind CSS
- **Backend/Auth/DB:** Supabase (serverless)
- **Deploy:** Vercel

## Setup

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/habitflow.git
cd habitflow
npm install
```

### 2. Configurar Supabase

Crear un proyecto en [supabase.com](https://supabase.com) y ejecutar el siguiente SQL en el editor:

```sql
-- Tabla de hábitos
create table habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  color text default 'green',
  created_at timestamptz default now()
);

-- Tabla de completions (un registro por hábito por día)
create table habit_completions (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  completed_date date default current_date,
  unique(habit_id, completed_date)
);

-- Row Level Security
alter table habits enable row level security;
alter table habit_completions enable row level security;

create policy "usuarios ven sus habitos" on habits
  for all using (auth.uid() = user_id);

create policy "usuarios ven sus completions" on habit_completions
  for all using (auth.uid() = user_id);
```

### 3. Variables de entorno

Copiar `.env.example` a `.env` y completar con las claves de Supabase:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 4. Correr en desarrollo

```bash
npm run dev
```

## Funcionalidades

- Registro e inicio de sesión con email/contraseña (Supabase Auth)
- Crear, editar y eliminar hábitos con nombre, descripción y color
- Marcar hábitos como completados para el día de hoy
- Barra de progreso diario
- Cierre de sesión

## Calidad y CI/CD

Cada cambio se valida automáticamente con un pipeline de GitHub Actions
([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) que en cada push y pull request a
`main` ejecuta: **lint → tests unitarios → tests E2E → build → deploy a Vercel**. El deploy a
producción solo ocurre si todos los pasos anteriores pasan. Las decisiones de calidad están
documentadas en [`CALIDAD.md`](CALIDAD.md).

**URL de producción:** https://habitflow-ten-gamma.vercel.app

### Tests

```bash
npm test          # tests unitarios (Vitest) — lógica de estadísticas (rachas y %)
npm run test:e2e  # test E2E (Playwright) — protección de rutas (no autenticado → login)
npm run lint      # linter (oxlint)
```

La primera vez, para el E2E: `npx playwright install chromium`.

## Flujo de trabajo y ramas

Ningún cambio se mergea directo a `main`: todo entra por un Pull Request que referencia su issue
(`closes #N`) y es revisado y aprobado por el otro integrante antes de mergear.

| Prefijo | Para qué | Ejemplo |
|---|---|---|
| `feature/` | nueva funcionalidad | `feature/ci-cd-y-tests` |
| `fix/` | corrección de un bug | `fix/racha-zona-horaria` |
| `chore/` | mantenimiento / configuración | `chore/configurar-actions` |
| `docs/` | documentación | `docs/calidad-md` |
