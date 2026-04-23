<div align="center">

# 🎬 Watchly

**Tu lista personal de películas y series**

Buscá, guardá y organizá todo el contenido que querés ver — en un solo lugar.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![TMDB](https://img.shields.io/badge/TMDB-API-01D277?style=flat-square&logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/)

[Ver demo](https://watchly-lime.vercel.app)

</div>

---

## ✨ Características

- 🔐 **Autenticación** — Registro e inicio de sesión con JWT
- 🔥 **Tendencias** — Películas y series más populares de la semana en tiempo real
- 🔍 **Búsqueda** — Encontrá cualquier título al instante usando la base de datos de TMDB
- 🎭 **Detalle completo** — Sinopsis, reparto, calificación, trailer y títulos similares
- 📋 **Watchlist personal** — Guardá títulos y organizalos en tres estados:
  - *Quiero ver*
  - *Viendo*
  - *Visto*

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router), React 18 |
| Backend | Node.js, Express 5 |
| Base de datos | PostgreSQL 15 |
| Autenticación | JWT + bcryptjs |
| API externa | TMDB (The Movie Database) |
| Infraestructura | Docker Compose |

---

## 🚀 Correr el proyecto localmente

### Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Una API key de [TMDB](https://www.themoviedb.org/settings/api) (gratis)

### Pasos

**1. Cloná el repositorio**

```bash
git clone https://github.com/joakol119/Watchly.git
cd Watchly
```

**2. Configurá las variables de entorno**

```bash
cp .env.example .env
```

Editá el `.env` con tus valores:

```env
POSTGRES_USER=watchly
POSTGRES_PASSWORD=tu_password
POSTGRES_DB=watchly
JWT_SECRET=una_clave_secreta_larga
TMDB_API_KEY=tu_api_key_de_tmdb
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:4001
```

**3. Levantá los contenedores**

```bash
docker compose up --build
```

**4. Abrí la app**

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3001 |
| Backend | http://localhost:4001 |

---

## 📁 Estructura del proyecto

```
watchly/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js          # Entry point + configuración Express
│       ├── db.js             # Conexión y setup de PostgreSQL
│       ├── middleware/
│       │   └── auth.js       # Middleware de autenticación JWT
│       └── routes/
│           ├── auth.js       # POST /auth/register, POST /auth/login
│           ├── watchlist.js  # CRUD /watchlist
│           └── tmdb.js       # Proxy hacia TMDB API
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── lib/
    │   └── api.js            # Cliente HTTP centralizado
    ├── components/
    │   ├── Navbar.js
    │   └── MediaCard.js
    └── app/
        ├── page.js           # Landing page
        ├── home/             # Tendencias
        ├── login/            # Login y registro
        ├── search/           # Búsqueda
        ├── watchlist/        # Lista personal
        ├── movie/[id]/       # Detalle de película
        └── tv/[id]/          # Detalle de serie
```

---

## 🔌 API Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Crear cuenta |
| POST | `/auth/login` | Iniciar sesión |

### Watchlist *(requiere token)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/watchlist` | Obtener lista del usuario |
| POST | `/watchlist` | Agregar título |
| PATCH | `/watchlist/:id` | Actualizar estado |
| DELETE | `/watchlist/:id` | Eliminar título |

### TMDB *(requiere token)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/tmdb/trending` | Tendencias de la semana |
| GET | `/tmdb/search?q=` | Buscar títulos |
| GET | `/tmdb/movie/:id` | Detalle de película |
| GET | `/tmdb/tv/:id` | Detalle de serie |

---

## 👤 Autor

**Joaquín**

[![GitHub](https://img.shields.io/badge/GitHub-joakol119-181717?style=flat-square&logo=github)](https://github.com/joakol119)

---

<div align="center">

*Hecho por Joaquin usando Next.js, Node.js y la API de TMDB*

</div>
