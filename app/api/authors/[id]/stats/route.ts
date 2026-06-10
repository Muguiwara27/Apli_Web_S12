import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/authors/[id]/stats - Estadísticas del autor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        books: {
          orderBy: { publishedYear: 'asc' },
        },
      },
    })

    if (!author) {
      return NextResponse.json({ error: 'Autor no encontrado' }, { status: 404 })
    }

    const books = author.books
    const totalBooks = books.length

    if (totalBooks === 0) {
      return NextResponse.json({
        authorId: author.id,
        authorName: author.name,
        totalBooks: 0,
        firstBook: null,
        latestBook: null,
        averagePages: 0,
        genres: [],
        longestBook: null,
        shortestBook: null,
      })
    }

    const booksWithYear = books.filter((b) => b.publishedYear !== null)
    const firstBook = booksWithYear[0]
      ? { title: booksWithYear[0].title, year: booksWithYear[0].publishedYear }
      : null
    const latestBook = booksWithYear[booksWithYear.length - 1]
      ? { title: booksWithYear[booksWithYear.length - 1].title, year: booksWithYear[booksWithYear.length - 1].publishedYear }
      : null

    const booksWithPages = books.filter((b) => b.pages !== null)
    const averagePages =
      booksWithPages.length > 0
        ? Math.round(booksWithPages.reduce((sum, b) => sum + (b.pages || 0), 0) / booksWithPages.length)
        : 0

    const genres = [...new Set(books.map((b) => b.genre).filter(Boolean))] as string[]

    const longestBook = booksWithPages.reduce(
      (max, b) => (!max || (b.pages || 0) > (max.pages || 0) ? b : max),
      null as typeof books[0] | null
    )
    const shortestBook = booksWithPages.reduce(
      (min, b) => (!min || (b.pages || 0) < (min.pages || 0) ? b : min),
      null as typeof books[0] | null
    )

    return NextResponse.json({
      authorId: author.id,
      authorName: author.name,
      totalBooks,
      firstBook,
      latestBook,
      averagePages,
      genres,
      longestBook: longestBook ? { title: longestBook.title, pages: longestBook.pages } : null,
      shortestBook: shortestBook ? { title: shortestBook.title, pages: shortestBook.pages } : null,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}
