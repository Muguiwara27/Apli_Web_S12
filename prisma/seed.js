const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Limpiar datos existentes
  await prisma.book.deleteMany()
  await prisma.author.deleteMany()

  // Crear autores
  const garcia = await prisma.author.create({
    data: {
      name: 'Gabriel García Márquez',
      email: 'gabo@ficcion.com',
      nationality: 'Colombia',
      birthYear: 1927,
      bio: 'Premio Nobel de Literatura 1982. Máximo exponente del realismo mágico latinoamericano.',
    },
  })

  const allende = await prisma.author.create({
    data: {
      name: 'Isabel Allende',
      email: 'isabel@allende.com',
      nationality: 'Chile',
      birthYear: 1942,
      bio: 'Una de las escritoras más leídas en lengua española. Autora de La casa de los espíritus.',
    },
  })

  const cortazar = await prisma.author.create({
    data: {
      name: 'Julio Cortázar',
      email: 'julio@cortazar.com',
      nationality: 'Argentina',
      birthYear: 1914,
      bio: 'Maestro del cuento fantástico latinoamericano. Autor de Rayuela y Bestiario.',
    },
  })

  const vargas = await prisma.author.create({
    data: {
      name: 'Mario Vargas Llosa',
      email: 'mario@vargas.com',
      nationality: 'Perú',
      birthYear: 1936,
      bio: 'Premio Nobel de Literatura 2010. Exponente del boom latinoamericano.',
    },
  })

  const neruda = await prisma.author.create({
    data: {
      name: 'Pablo Neruda',
      email: 'pablo@neruda.com',
      nationality: 'Chile',
      birthYear: 1904,
      bio: 'Premio Nobel de Literatura 1971. El más influyente poeta latinoamericano del siglo XX.',
    },
  })

  // Libros de García Márquez
  await prisma.book.createMany({
    data: [
      { title: 'Cien años de soledad', description: 'La saga de la familia Buendía en Macondo.', isbn: '978-84-397-0495-7', publishedYear: 1967, genre: 'Novela', pages: 417, authorId: garcia.id },
      { title: 'El amor en los tiempos del cólera', description: 'Historia de amor que dura más de 50 años.', isbn: '978-84-397-0535-0', publishedYear: 1985, genre: 'Novela', pages: 348, authorId: garcia.id },
      { title: 'La hojarasca', description: 'Primera novela de García Márquez ambientada en Macondo.', isbn: '978-84-397-0101-7', publishedYear: 1955, genre: 'Novela', pages: 124, authorId: garcia.id },
      { title: 'Crónica de una muerte anunciada', description: 'Un pueblo entero sabía que iban a matar a Santiago Nasar.', isbn: '978-84-397-0444-5', publishedYear: 1981, genre: 'Novela', pages: 152, authorId: garcia.id },
      { title: 'El coronel no tiene quien le escriba', description: 'Un viejo coronel espera su pensión durante años.', isbn: '978-84-397-0210-6', publishedYear: 1961, genre: 'Novela', pages: 89, authorId: garcia.id },
      { title: 'Doce cuentos peregrinos', description: 'Doce relatos sobre latinoamericanos en Europa.', isbn: '978-84-397-0685-2', publishedYear: 1992, genre: 'Cuento', pages: 208, authorId: garcia.id },
      { title: 'El otoño del patriarca', description: 'Retrato de un dictador latinoamericano.', isbn: '978-84-397-0355-4', publishedYear: 1975, genre: 'Novela', pages: 359, authorId: garcia.id },
      { title: 'Relato de un náufrago', description: 'Historia real de un marinero colombiano náufrago.', isbn: '978-84-397-0512-1', publishedYear: 1970, genre: 'Periodismo', pages: 110, authorId: garcia.id },
      { title: 'Memoria de mis putas tristes', description: 'Un anciano celebra sus 90 años enamorándose.', isbn: '978-84-397-1140-5', publishedYear: 2004, genre: 'Novela', pages: 109, authorId: garcia.id },
    ],
  })

  // Libros de Isabel Allende
  await prisma.book.createMany({
    data: [
      { title: 'La casa de los espíritus', description: 'Saga familiar de las Trueba en Chile.', isbn: '978-84-01-42395-5', publishedYear: 1982, genre: 'Novela', pages: 478, authorId: allende.id },
      { title: 'Eva Luna', description: 'Una mujer que narra historias para sobrevivir.', isbn: '978-84-01-42396-2', publishedYear: 1987, genre: 'Novela', pages: 361, authorId: allende.id },
      { title: 'De amor y de sombra', description: 'Una periodista investiga crímenes de la dictadura.', isbn: '978-84-01-42397-9', publishedYear: 1984, genre: 'Novela', pages: 280, authorId: allende.id },
      { title: 'Paula', description: 'Carta autobiográfica escrita para su hija en coma.', isbn: '978-84-01-42398-6', publishedYear: 1994, genre: 'Autobiografía', pages: 392, authorId: allende.id },
      { title: 'El cuaderno de Maya', description: 'Una joven en peligro se refugia en una isla de Chile.', isbn: '978-84-01-33836-5', publishedYear: 2011, genre: 'Novela', pages: 408, authorId: allende.id },
    ],
  })

  // Libros de Cortázar
  await prisma.book.createMany({
    data: [
      { title: 'Rayuela', description: 'Novela experimental sobre Horacio Oliveira en París y Buenos Aires.', isbn: '978-84-376-0072-8', publishedYear: 1963, genre: 'Novela', pages: 635, authorId: cortazar.id },
      { title: 'Bestiario', description: 'Ocho cuentos fantásticos.', isbn: '978-84-376-0073-5', publishedYear: 1951, genre: 'Cuento', pages: 168, authorId: cortazar.id },
      { title: 'Final del juego', description: 'Colección de cuentos fantásticos y cotidianos.', isbn: '978-84-376-0074-2', publishedYear: 1956, genre: 'Cuento', pages: 185, authorId: cortazar.id },
      { title: 'Historias de cronopios y de famas', description: 'Seres imaginarios con comportamientos absurdos.', isbn: '978-84-376-0075-9', publishedYear: 1962, genre: 'Cuento', pages: 125, authorId: cortazar.id },
      { title: 'Libro de Manuel', description: 'Una novela política y experimental.', isbn: '978-84-376-0076-6', publishedYear: 1973, genre: 'Novela', pages: 384, authorId: cortazar.id },
    ],
  })

  // Libros de Vargas Llosa
  await prisma.book.createMany({
    data: [
      { title: 'La ciudad y los perros', description: 'Vida en un colegio militar de Lima.', isbn: '978-84-322-0560-1', publishedYear: 1963, genre: 'Novela', pages: 408, authorId: vargas.id },
      { title: 'La fiesta del chivo', description: 'Los últimos días de la dictadura de Trujillo.', isbn: '978-84-204-4161-3', publishedYear: 2000, genre: 'Novela', pages: 517, authorId: vargas.id },
      { title: 'Conversación en La Catedral', description: 'Una conversación que reconstruye una vida en el Perú de Odría.', isbn: '978-84-322-0561-8', publishedYear: 1969, genre: 'Novela', pages: 600, authorId: vargas.id },
    ],
  })

  // Libros de Neruda
  await prisma.book.createMany({
    data: [
      { title: 'Veinte poemas de amor y una canción desesperada', description: 'El libro de poemas más leído en español.', isbn: '978-84-206-3694-7', publishedYear: 1924, genre: 'Poesía', pages: 96, authorId: neruda.id },
      { title: 'Canto general', description: 'Épica poética de América Latina.', isbn: '978-84-206-3695-4', publishedYear: 1950, genre: 'Poesía', pages: 628, authorId: neruda.id },
      { title: 'Odas elementales', description: 'Poemas dedicados a objetos y situaciones cotidianas.', isbn: '978-84-206-3696-1', publishedYear: 1954, genre: 'Poesía', pages: 198, authorId: neruda.id },
      { title: 'Confieso que he vivido', description: 'Memorias del poeta.', isbn: '978-84-206-3697-8', publishedYear: 1974, genre: 'Autobiografía', pages: 448, authorId: neruda.id },
    ],
  })

  const totalAuthors = await prisma.author.count()
  const totalBooks = await prisma.book.count()
  console.log(`✅ Seed completado: ${totalAuthors} autores, ${totalBooks} libros.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
