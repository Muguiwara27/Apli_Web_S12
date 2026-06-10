import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/books - Listar libros (con filtro por género opcional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const genre = searchParams.get('genre')

    const books = await prisma.book.findMany({
      where: genre ? { genre } : undefined,
      include: {
        author: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(books)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener libros' }, { status: 500 })
  }
}

// POST /api/books - Crear libro
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, isbn, publishedYear, genre, pages, authorId } = body

    if (!title || !authorId) {
      return NextResponse.json({ error: 'Título y authorId son requeridos' }, { status: 400 })
    }

    const authorExists = await prisma.author.findUnique({ where: { id: authorId } })
    if (!authorExists) {
      return NextResponse.json({ error: 'Autor no encontrado' }, { status: 404 })
    }

    const book = await prisma.book.create({
      data: { title, description, isbn, publishedYear, genre, pages, authorId },
      include: { author: { select: { id: true, name: true } } },
    })
    return NextResponse.json(book, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'El ISBN ya está registrado' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error al crear libro' }, { status: 500 })
  }
}
