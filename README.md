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

## Ramas

- `main` — versión estable y deployada
- `develop` — rama de integración
- `agustin` — rama de desarrollo de Agustín Hofmann
- `aaron` — rama de desarrollo de Aaron Wuler
