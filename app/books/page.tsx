'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Author { id: string; name: string }
interface Book {
  id: string; title: string; description?: string; isbn?: string
  publishedYear?: number; genre?: string; pages?: number
  authorId: string; author: { id: string; name: string }; createdAt: string
}
interface Pagination {
  page: number; limit: number; total: number
  totalPages: number; hasNext: boolean; hasPrev: boolean
}

const GENRES = ['Novela', 'Cuento', 'Poesía', 'Ensayo', 'Periodismo', 'Autobiografía', 'Ciencia ficción', 'Historia', 'Thriller']
const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Fecha de ingreso' },
  { value: 'title', label: 'Título (A-Z)' },
  { value: 'publishedYear', label: 'Año de publicación' },
]
const GENRE_BADGE: Record<string, string> = {
  'Novela': 'badge-purple', 'Cuento': 'badge-blue', 'Poesía': 'badge-pink',
  'Ensayo': 'badge-amber', 'Periodismo': 'badge-green', 'Autobiografía': 'badge-amber',
  'Ciencia ficción': 'badge-blue', 'Historia': 'badge-green', 'Thriller': 'badge-pink',
}

const INITIAL_FORM = { title: '', description: '', isbn: '', publishedYear: '', genre: '', pages: '', authorId: '' }

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [authorFilter, setAuthorFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState('desc')
  const [page, setPage] = useState(1)

  const [showForm, setShowForm] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const fetchAuthors = async () => {
    const res = await fetch('/api/authors')
    const data = await res.json()
    setAuthors(Array.isArray(data) ? data : [])
  }

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    const authorName = authorFilter
      ? (authors.find(a => a.id === authorFilter)?.name || '')
      : ''
    const params = new URLSearchParams({
      page: page.toString(), limit: '10', sortBy, order,
      ...(search && { search }),
      ...(genre && { genre }),
      ...(authorName && { authorName }),
    })
    const res = await fetch(`/api/books/search?${params}`)
    const data = await res.json()
    setBooks(data.data || [])
    setPagination(data.pagination || null)
    setLoading(false)
  }, [page, sortBy, order, search, genre, authorFilter, authors])

  useEffect(() => { fetchAuthors() }, [])
  useEffect(() => {
    const t = setTimeout(() => fetchBooks(), 300)
    return () => clearTimeout(t)
  }, [fetchBooks])

  const openCreate = () => {
    setEditingBook(null)
    setForm(INITIAL_FORM)
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (book: Book) => {
    setEditingBook(book)
    setForm({
      title: book.title, description: book.description || '',
      isbn: book.isbn || '', publishedYear: book.publishedYear?.toString() || '',
      genre: book.genre || '', pages: book.pages?.toString() || '',
      authorId: book.authorId,
    })
    setFormError('')
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.authorId) {
      setFormError('Título y autor son requeridos.')
      return
    }
    setSubmitting(true)
    setFormError('')
    try {
      const url = editingBook ? `/api/books/${editingBook.id}` : '/api/books'
      const method = editingBook ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          publishedYear: form.publishedYear ? parseInt(form.publishedYear) : undefined,
          pages: form.pages ? parseInt(form.pages) : undefined,
        }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setShowForm(false); setEditingBook(null)
      fetchBooks()
    } catch (e: any) { setFormError(e.message) }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este libro?')) return
    await fetch(`/api/books/${id}`, { method: 'DELETE' })
    fetchBooks()
  }

  const pageNumbers = () => {
    if (!pagination) return []
    const total = pagination.totalPages
    const cur = pagination.page
    const pages: (number | '...')[] = []
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      if (cur > 3) pages.push('...')
      for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i)
      if (cur < total - 2) pages.push('...')
      pages.push(total)
    }
    return pages
  }

  return (
    <div className="page-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl border-b border-white/8"
        style={{ background: 'rgba(15,15,26,0.85)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              📚
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">BiblioTech</h1>
              <p className="text-xs text-slate-500">Sistema de Biblioteca</p>
            </div>
          </div>
          <nav className="flex gap-2">
            <Link href="/" className="nav-link">Autores</Link>
            <span className="nav-link-active">Libros</span>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Page title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Catálogo de Libros</h2>
          <p className="text-slate-500 text-sm mt-1">Busca, filtra y gestiona el catálogo completo</p>
        </div>

        {/* Search & Filters Panel */}
        <div className="glass-panel p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div className="md:col-span-2 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Buscar por título..."
                className="input-field pl-9"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <select className="input-field" value={genre} onChange={e => { setGenre(e.target.value); setPage(1) }}>
              <option value="">Todos los géneros</option>
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select className="input-field" value={authorFilter} onChange={e => { setAuthorFilter(e.target.value); setPage(1) }}>
              <option value="">Todos los autores</option>
              {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-3 flex-wrap">
              <select className="input-field w-auto" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className="input-field w-auto" value={order} onChange={e => setOrder(e.target.value)}>
                <option value="desc">↓ Descendente</option>
                <option value="asc">↑ Ascendente</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              {pagination && (
                <span className="text-sm text-slate-400">
                  <span className="text-white font-semibold">{pagination.total}</span> resultado{pagination.total !== 1 ? 's' : ''}
                </span>
              )}
              <button onClick={openCreate} className="btn-primary">
                <span>+</span> Nuevo Libro
              </button>
            </div>
          </div>
        </div>

        {/* Book Form */}
        {showForm && (
          <div className="glass-panel p-6 mb-6">
            <h3 className="font-semibold text-white mb-5">
              {editingBook ? '✏️ Editar Libro' : '➕ Nuevo Libro'}
            </h3>
            {formError && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                {formError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Título *</label>
                <input className="input-field" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Cien años de soledad" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Autor *</label>
                <select className="input-field" value={form.authorId}
                  onChange={e => setForm({ ...form, authorId: e.target.value })}>
                  <option value="">Seleccionar autor</option>
                  {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Género</label>
                <select className="input-field" value={form.genre}
                  onChange={e => setForm({ ...form, genre: e.target.value })}>
                  <option value="">Sin género</option>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">ISBN</label>
                <input className="input-field" value={form.isbn}
                  onChange={e => setForm({ ...form, isbn: e.target.value })}
                  placeholder="978-XX-XXXX-XXX-X" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Año de publicación</label>
                <input type="number" className="input-field" value={form.publishedYear}
                  onChange={e => setForm({ ...form, publishedYear: e.target.value })}
                  placeholder="1967" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Páginas</label>
                <input type="number" className="input-field" value={form.pages}
                  onChange={e => setForm({ ...form, pages: e.target.value })}
                  placeholder="350" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Descripción</label>
                <textarea className="input-field resize-none" rows={3} value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Una breve descripción del libro..." />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                {submitting ? 'Guardando...' : editingBook ? 'Actualizar Libro' : 'Crear Libro'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingBook(null) }} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="skeleton h-48 w-full" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="glass-card p-16 text-center mb-6">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-slate-400 font-medium">No se encontraron libros.</p>
            <p className="text-slate-600 text-sm mt-1">Intenta con otros filtros o crea un nuevo libro.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {books.map(book => (
              <div key={book.id} className="glass-card p-5 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white text-sm leading-tight pr-2">{book.title}</h3>
                  {book.genre && (
                    <span className={`badge ${GENRE_BADGE[book.genre] || 'badge-purple'} shrink-0`}>
                      {book.genre}
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium mb-2" style={{ color: '#a5b4fc' }}>
                  ✍️ {book.author.name}
                </p>
                <div className="flex gap-3 text-xs text-slate-500 mb-3">
                  {book.publishedYear && <span>📅 {book.publishedYear}</span>}
                  {book.pages && <span>📄 {book.pages} págs.</span>}
                  {book.isbn && <span className="truncate">ISBN: {book.isbn}</span>}
                </div>
                {book.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed flex-1">
                    {book.description}
                  </p>
                )}
                <div className="divider pt-3 mt-auto flex gap-2">
                  <button onClick={() => openEdit(book)} className="btn-warning flex-1 justify-center text-xs py-1.5">
                    ✏️ Editar
                  </button>
                  <button onClick={() => handleDelete(book.id)} className="btn-danger flex-1 justify-center text-xs py-1.5">
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              disabled={!pagination.hasPrev}
              onClick={() => setPage(p => p - 1)}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-30">
              ← Anterior
            </button>
            <div className="flex gap-1">
              {pageNumbers().map((p, i) =>
                p === '...' ? (
                  <span key={i} className="px-3 py-2 text-slate-500 text-sm">…</span>
                ) : (
                  <button key={i}
                    onClick={() => setPage(p as number)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      p === pagination.page
                        ? 'btn-primary py-2'
                        : 'btn-secondary py-2'
                    }`}>
                    {p}
                  </button>
                )
              )}
            </div>
            <button
              disabled={!pagination.hasNext}
              onClick={() => setPage(p => p + 1)}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-30">
              Siguiente →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
