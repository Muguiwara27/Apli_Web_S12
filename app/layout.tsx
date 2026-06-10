import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BiblioTech – Sistema de Biblioteca Avanzado',
  description: 'Gestión de autores y libros con búsqueda avanzada, filtros y estadísticas.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  )
}
