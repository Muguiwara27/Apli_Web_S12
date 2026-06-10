'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Author {
  id: string
  name: string
  email: string
  nationality?: string
  birthYear?: number
  bio?: string
  createdAt: string
  _count?: { books: number }
}

const INITIAL_FORM = { name: '', email: '', nationality: '', birthYear: '', bio: '' }

export default function HomePage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const totalBooks = authors.reduce((s, a) => s + (a._count?.books || 0), 0)
  const avgBooks = authors.length > 0 ? (totalBooks / authors.length).toFixed(1) : '0'

  const fetchAuthors = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/authors')
    const data = await res.json()
    setAuthors(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAuthors() }, [fetchAuthors])

  const openCreate = () => {
    setEditingAuthor(null)
    setForm(INITIAL_FORM)
    setError('')
    setShowForm(true)
  }

  const openEdit = (author: Author) => {
    setEditingAuthor(author)
    setForm({
      name: author.name,
      email: author.email,
      nationality: author.nationality || '',
      birthYear: author.birthYear?.toString() || '',
      bio: author.bio || '',
    })
    setError('')
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Nombre y email son requeridos.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const url = editingAuthor ? `/api/authors/${editingAuthor.id}` : '/api/authors'
      const method = editingAuthor ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, birthYear: form.birthYear ? parseInt(form.birthYear) : undefined }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setShowForm(false)
      setEditingAuthor(null)
      fetchAuthors()
    } catch (e: any) { setError(e.message) }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este autor y todos sus libros?')) return
    await fetch(`/api/authors/${id}`, { method: 'DELETE' })
    fetchAuthors()
  }

  const BADGE_COLORS = ['badge-purple', 'badge-green', 'badge-blue', 'badge-amber', 'badge-pink']

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
            <span className="nav-link-active">Autores</span>
            <Link href="/books" className="nav-link">Libros</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total autores', value: loading ? '—' : authors.length, icon: '👤', color: '#6366f1', glow: 'rgba(99,102,241,0.25)' },
            { label: 'Total libros', value: loading ? '—' : totalBooks, icon: '📖', color: '#10b981', glow: 'rgba(16,185,129,0.2)' },
            { label: 'Libros / autor', value: loading ? '—' : avgBooks, icon: '📊', color: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{s.label}</p>
                <span className="text-2xl">{s.icon}</span>
              </div>
              <p className="text-4xl font-bold" style={{ color: s.color, textShadow: `0 0 20px ${s.glow}` }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title">Autores registrados</h2>
            <p className="text-xs text-slate-500">{authors.length} autores en el sistema</p>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <span>+</span> Nuevo Autor
          </button>
        </div>

        {/* Create / Edit Form */}
        {showForm && (
          <div className="glass-panel p-6 mb-8">
            <h3 className="font-semibold text-white mb-5">
              {editingAuthor ? '✏️ Editar Autor' : '➕ Nuevo Autor'}
            </h3>
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Nombre *</label>
                <input className="input-field" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Gabriel García Márquez" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email *</label>
                <input className="input-field" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="autor@ejemplo.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Nacionalidad</label>
                <input className="input-field" value={form.nationality}
                  onChange={e => setForm({ ...form, nationality: e.target.value })}
                  placeholder="Colombia" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Año de nacimiento</label>
                <input type="number" className="input-field" value={form.birthYear}
                  onChange={e => setForm({ ...form, birthYear: e.target.value })}
                  placeholder="1927" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Biografía</label>
                <textarea className="input-field resize-none" rows={3} value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  placeholder="Premio Nobel de Literatura 1982..." />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                {submitting ? 'Guardando...' : editingAuthor ? 'Actualizar' : 'Crear Autor'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingAuthor(null) }} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Authors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-52 w-full" />
            ))}
          </div>
        ) : authors.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <p className="text-5xl mb-4">📚</p>
            <p className="text-slate-400 font-medium">No hay autores registrados aún.</p>
            <p className="text-slate-600 text-sm mt-1">Haz clic en "Nuevo Autor" para comenzar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {authors.map((author, idx) => (
              <div key={author.id} className="glass-card p-5 flex flex-col">
                {/* Top */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, hsl(${idx * 60}, 70%, 45%), hsl(${idx * 60 + 40}, 80%, 55%))` }}>
                      {author.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm leading-tight">{author.name}</h3>
                      <p className="text-xs text-slate-500">{author.email}</p>
                    </div>
                  </div>
                  <span className={`badge ${BADGE_COLORS[idx % BADGE_COLORS.length]} shrink-0 ml-2`}>
                    {author._count?.books || 0} libros
                  </span>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {author.nationality && (
                    <span className="text-xs text-slate-400">🌍 {author.nationality}</span>
                  )}
                  {author.birthYear && (
                    <span className="text-xs text-slate-400">🎂 {author.birthYear}</span>
                  )}
                </div>

                {author.bio && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed flex-1">
                    {author.bio}
                  </p>
                )}

                {/* Actions */}
                <div className="divider pt-3 mt-auto flex gap-2">
                  <Link href={`/authors/${author.id}`}
                    className="btn-success flex-1 justify-center text-xs py-1.5">
                    Ver detalle
                  </Link>
                  <Link href="/books"
                    className="btn-secondary text-xs py-1.5 px-3">
                    📖
                  </Link>
                  <button onClick={() => openEdit(author)} className="btn-warning text-xs py-1.5 px-3">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(author.id)} className="btn-danger text-xs py-1.5 px-3">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
