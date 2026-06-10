# next-api-routes — Lab GLAB-S12

Sistema de Biblioteca con Next.js 15, App Router, Prisma ORM y PostgreSQL (Supabase).

## Estructura del proyecto

```
app/
  api/
    authors/
      route.ts                  # GET (listar) / POST (crear)
      [id]/
        route.ts                # GET / PUT / DELETE por ID
        books/route.ts          # GET libros de un autor
        stats/route.ts          # GET estadísticas del autor
    books/
      route.ts                  # GET (listar + filtro genre) / POST (crear)
      [id]/route.ts             # GET / PUT / DELETE por ID
      search/route.ts           # GET con búsqueda, filtros y paginación
  page.tsx                      # Dashboard de autores
  books/page.tsx                # Página de libros con búsqueda
  authors/[id]/page.tsx         # Detalle de autor + estadísticas
lib/
  prisma.ts                     # Singleton de PrismaClient
prisma/
  schema.prisma                 # Modelos Author y Book
```

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar base de datos
cp .env.example .env
# Editar .env con tu URL de Supabase

# 3. Crear tablas en Supabase
npm run db:push

# 4. Correr el proyecto
npm run dev
```

## Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/authors | Listar autores |
| POST | /api/authors | Crear autor |
| GET | /api/authors/:id | Obtener autor |
| PUT | /api/authors/:id | Actualizar autor |
| DELETE | /api/authors/:id | Eliminar autor |
| GET | /api/authors/:id/books | Libros del autor |
| GET | /api/authors/:id/stats | Estadísticas del autor |
| GET | /api/books | Listar libros (opcional: ?genre=) |
| POST | /api/books | Crear libro |
| GET | /api/books/:id | Obtener libro |
| PUT | /api/books/:id | Actualizar libro |
| DELETE | /api/books/:id | Eliminar libro |
| GET | /api/books/search | Búsqueda con paginación y filtros |

## Parámetros de búsqueda (/api/books/search)

- `search` — búsqueda parcial en título (case-insensitive)
- `genre` — filtro por género exacto
- `authorName` — búsqueda parcial en nombre de autor
- `page` — página (default: 1)
- `limit` — resultados por página (default: 10, max: 50)
- `sortBy` — campo de orden: title | publishedYear | createdAt
- `order` — asc | desc
