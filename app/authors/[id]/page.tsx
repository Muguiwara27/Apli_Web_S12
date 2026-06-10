'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

interface Author {
  id: string; name: string; email: string
  nationality?: string; birthYear?: number; bio?: string
}
interface Book {
  id: string; title: string; genre?: string
  publishedYear?: number; pages?: number; description?: string
}
interface Stats {
  authorId: string; authorName: string; totalBooks: number
  firstBook: { title: string; year: number } | null
  latestBook: { title: string; year: number } | null
  averagePages: number; genres: string[]
  longestBook: { title: string; pages: number } | null
  shortestBook: { title: string; pages: number } | null
}

const GENRES = ['Novela', 'Cuento', 'Poesía', 'Ensayo', 'Periodismo', 'Autobiografía', 'Ciencia ficción', 'Historia', 'Thriller']

const GENRE_BADGE: Record<string, string> = {
  'Novela': 'badge-purple', 'Cuento': 'badge-blue', 'Poesía': 'badge-pink',
  'Ensayo': 'badge-amber', 'Periodismo': 'badge-green', 'Autobiografía': 'badge-amber',
  'Ciencia ficción': 'badge-blue', 'Historia': 'badge-green', 'Thriller': 'badge-pink',
}

export default function AuthorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [author, setAuthor] = useState<Author | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const [editForm, setEditForm] = useState({ name: '', email: '', nationality: '', birthYear: '', bio: '' })
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const [showBookForm, setShowBookForm] = useState(false)
  const [bookForm, setBookForm] = useState({ title: '', description: '', isbn: '', publishedYear: '', genre: '', pages: '' })
  const [savingBook, setSavingBook] = useState(false)
  const [bookError, setBookError] = useState('')

  const fetchAll = async () => {
    setLoading(true)
    const [authorRes, booksRes, statsRes] = await Promise.all([
      fetch(`/api/authors/${id}`),
      fetch(`/api/authors/${id}/books`),
      fetch(`/api/authors/${id}/stats`),
    ])
    if (!authorRes.ok) { router.push('/'); return }
    const [authorData, booksData, statsData] = await Promise.all([
      authorRes.json(), booksRes.json(), statsRes.json()
    ])
    setAuthor(authorData)
    setBooks(Array.isArray(booksData) ? booksData : [])
    setStats(statsData)
    setEditForm({
      name: authorData.name, email: authorData.email,
      nationality: authorData.nationality || '',
      birthYear: authorData.birthYear?.toString() || '',
      bio: authorData.bio || ''
    })
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [id])

  const handleSaveAuthor = async () => {
    setSaving(true); setEditError('')
    try {
      const res = await fetch(`/api/authors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, birthYear: editForm.birthYear ? parseInt(editForm.birthYear) : undefined }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setEditMode(false)
      fetchAll()
    } catch (e: any) { setEditError(e.message) }
    setSaving(false)
  }

  const handleAddBook = async () => {
    setSavingBook(true); setBookError('')
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookForm, authorId: id,
          publishedYear: bookForm.publishedYear ? parseInt(bookForm.publishedYear) : undefined,
          pages: bookForm.pages ? parseInt(bookForm.pages) : undefined,
        }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setBookForm({ title: '', description: '', isbn: '', publishedYear: '', genre: '', pages: '' })
      setShowBookForm(false)
      fetchAll()
    } catch (e: any) { setBookError(e.message) }
    setSavingBook(false)
  }

  if (loading) {
    return (
      <div className="page-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-spin">⚙️</div>
          <p className="text-slate-400">Cargando información del autor...</p>
        </div>
      </div>
    )
  }
  if (!author) return null

  const initials = author.name.split(' ').map(w => w[0]).slice(0, 2).join('')

  return (
    <div className="page-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl border-b border-white/8"
        style={{ background: 'rgba(15,15,26,0.85)' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors text-sm flex items-center gap-1.5">
            ← Autores
          </Link>
          <span className="text-slate-700">/</span>
          <h1 className="text-base font-semibold text-white">{author.name}</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">

        {/* Author Hero Card */}
        <div className="glass-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-white">{author.name}</h2>
                  <p className="text-slate-400 text-sm mt-0.5">{author.email}</p>
                </div>
                <button
                  onClick={() => { setEditMode(!editMode); setEditError('') }}
                  className={editMode ? 'btn-secondary' : 'btn-warning'}>
                  {editMode ? '✕ Cancelar' : '✏️ Editar'}
                </button>
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-400">
                {author.nationality && <span>🌍 {author.nationality}</span>}
                {author.birthYear && <span>🎂 Nacido en {author.birthYear}</span>}
                {stats && <span className="badge badge-purple">{stats.totalBooks} libros</span>}
              </div>
              {author.bio && (
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">{author.bio}</p>
              )}
            </div>
          </div>

          {/* Edit Form */}
          {editMode && (
            <div className="mt-6 pt-6 divider">
              {editError && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                  {editError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Nombre</label>
                  <input className="input-field" value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                  <input className="input-field" value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Nacionalidad</label>
                  <input className="input-field" value={editForm.nationality}
                    onChange={e => setEditForm({ ...editForm, nationality: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Año nacimiento</label>
                  <input type="number" className="input-field" value={editForm.birthYear}
                    onChange={e => setEditForm({ ...editForm, birthYear: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Biografía</label>
                  <textarea className="input-field resize-none" rows={3} value={editForm.bio}
                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleSaveAuthor} disabled={saving} className="btn-primary">
                  {saving ? 'Guardando...' : '💾 Guardar cambios'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        {stats && stats.totalBooks > 0 && (
          <div className="glass-card p-6">
            <h3 className="section-title mb-5">📊 Estadísticas del Autor</h3>

            {/* Main stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total libros', value: stats.totalBooks, icon: '📚', color: '#6366f1', glow: 'rgba(99,102,241,0.3)' },
                { label: 'Promedio páginas', value: stats.averagePages, icon: '📄', color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
                { label: 'Primer libro', value: stats.firstBook?.year || '—', icon: '🌱', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
                { label: 'Último libro', value: stats.latestBook?.year || '—', icon: '🏆', color: '#8b5cf6', glow: 'rgba(139,92,246,0.3)' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-4 text-center"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-2xl mb-1">{s.icon}</p>
                  <p className="text-2xl font-bold" style={{ color: s.color, textShadow: `0 0 16px ${s.glow}` }}>
                    {s.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* First/Latest book detail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {stats.firstBook && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <p className="text-xs text-amber-400 font-semibold mb-1">🌱 Primer libro</p>
                  <p className="text-sm font-medium text-white">{stats.firstBook.title}</p>
                  <p className="text-xs text-slate-500">{stats.firstBook.year}</p>
                </div>
              )}
              {stats.latestBook && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
                  <p className="text-xs text-violet-400 font-semibold mb-1">🏆 Último libro</p>
                  <p className="text-sm font-medium text-white">{stats.latestBook.title}</p>
                  <p className="text-xs text-slate-500">{stats.latestBook.year}</p>
                </div>
              )}
            </div>

            {/* Longest/Shortest */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {stats.longestBook && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <p className="text-xs text-emerald-400 font-semibold mb-1">📚 Libro más largo</p>
                  <p className="text-sm font-medium text-white">{stats.longestBook.title}</p>
                  <p className="text-xs text-slate-500">{stats.longestBook.pages} páginas</p>
                </div>
              )}
              {stats.shortestBook && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                  <p className="text-xs text-blue-400 font-semibold mb-1">📄 Libro más corto</p>
                  <p className="text-sm font-medium text-white">{stats.shortestBook.title}</p>
                  <p className="text-xs text-slate-500">{stats.shortestBook.pages} páginas</p>
                </div>
              )}
            </div>

            {/* Genres */}
            {stats.genres.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2 font-medium">Géneros que ha escrito:</p>
                <div className="flex flex-wrap gap-2">
                  {stats.genres.map(g => (
                    <span key={g} className={`badge ${GENRE_BADGE[g] || 'badge-purple'}`}>{g}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Books List */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="section-title">Libros ({books.length})</h3>
              <p className="text-xs text-slate-500">Catálogo completo de este autor</p>
            </div>
            <button onClick={() => { setShowBookForm(!showBookForm); setBookError('') }} className="btn-primary">
              {showBookForm ? '✕ Cancelar' : '+ Agregar libro'}
            </button>
          </div>

          {/* Add Book Form */}
          {showBookForm && (
            <div className="mb-5 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h4 className="text-sm font-semibold text-white mb-4">Nuevo libro de {author.name}</h4>
              {bookError && (
                <div className="mb-3 px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                  {bookError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Título *</label>
                  <input className="input-field" value={bookForm.title}
                    onChange={e => setBookForm({ ...bookForm, title: e.target.value })}
                    placeholder="Título del libro" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Género</label>
                  <select className="input-field" value={bookForm.genre}
                    onChange={e => setBookForm({ ...bookForm, genre: e.target.value })}>
                    <option value="">Sin género</option>
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Año publicación</label>
                  <input type="number" className="input-field" value={bookForm.publishedYear}
                    onChange={e => setBookForm({ ...bookForm, publishedYear: e.target.value })}
                    placeholder="2024" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Páginas</label>
                  <input type="number" className="input-field" value={bookForm.pages}
                    onChange={e => setBookForm({ ...bookForm, pages: e.target.value })}
                    placeholder="320" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">ISBN</label>
                  <input className="input-field" value={bookForm.isbn}
                    onChange={e => setBookForm({ ...bookForm, isbn: e.target.value })}
                    placeholder="978-XX-XXXX-XXX-X" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Descripción</label>
                  <input className="input-field" value={bookForm.description}
                    onChange={e => setBookForm({ ...bookForm, description: e.target.value })}
                    placeholder="Breve descripción..." />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleAddBook} disabled={savingBook} className="btn-primary">
                  {savingBook ? 'Guardando...' : '➕ Agregar libro'}
                </button>
              </div>
            </div>
          )}

          {/* Books List */}
          {books.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-slate-400 text-sm">Este autor no tiene libros registrados.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {books.map((book, idx) => (
                <div key={book.id}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}>
                  <span className="text-slate-600 text-xs w-5 text-right shrink-0">{idx + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{book.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {[book.publishedYear && `📅 ${book.publishedYear}`, book.pages && `📄 ${book.pages} págs.`]
                        .filter(Boolean).join('  ·  ')}
                    </p>
                  </div>
                  {book.genre && (
                    <span className={`badge ${GENRE_BADGE[book.genre] || 'badge-purple'} shrink-0`}>
                      {book.genre}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
