import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/books/[id] - Obtener libro por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const book = await prisma.book.findUnique({
      where: { id },
      include: { author: true },
    })
    if (!book) {
      return NextResponse.json({ error: 'Libro no encontrado' }, { status: 404 })
    }
    return NextResponse.json(book)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener libro' }, { status: 500 })
  }
}

// PUT /api/books/[id] - Actualizar libro
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, isbn, publishedYear, genre, pages, authorId } = body

    const book = await prisma.book.update({
      where: { id },
      data: { title, description, isbn, publishedYear, genre, pages, authorId },
      include: { author: { select: { id: true, name: true } } },
    })
    return NextResponse.json(book)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Libro no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Error al actualizar libro' }, { status: 500 })
  }
}

// DELETE /api/books/[id] - Eliminar libro
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.book.delete({ where: { id } })
    return NextResponse.json({ message: 'Libro eliminado correctamente' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Libro no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Error al eliminar libro' }, { status: 500 })
  }
}
