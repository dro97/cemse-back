const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCompanySearch() {
  try {
    console.log('🔍 Probando el buscador de empresas...\n');

    // 1. Crear algunas empresas de prueba si no existen
    console.log('📝 Creando empresas de prueba...');
    
    const testCompanies = [
      {
        name: "Tech Solutions Bolivia",
        description: "Empresa de desarrollo de software y aplicaciones móviles",
        taxId: "123456789",
        legalRepresentative: "Juan Pérez",
        businessSector: "Tecnología",
        companySize: "MEDIUM",
        website: "https://techsolutions.bo",
        email: "contacto@techsolutions.bo",
        phone: "+591 4 1234567",
        address: "Av. Principal 123, Cochabamba",
        foundedYear: 2020,
        isActive: true,
        username: "techsolutions",
        password: "hashedpassword123",
        loginEmail: "admin@techsolutions.bo"
      },
      {
        name: "Salud Integral SRL",
        description: "Centro médico especializado en atención integral",
        taxId: "987654321",
        legalRepresentative: "María García",
        businessSector: "Salud",
        companySize: "LARGE",
        website: "https://saludintegral.bo",
        email: "info@saludintegral.bo",
        phone: "+591 4 7654321",
        address: "Calle San Martín 456, Cochabamba",
        foundedYear: 2018,
        isActive: true,
        username: "saludintegral",
        password: "hashedpassword456",
        loginEmail: "admin@saludintegral.bo"
      },
      {
        name: "Educa Bolivia",
        description: "Instituto de capacitación y educación continua",
        taxId: "456789123",
        legalRepresentative: "Carlos Rodríguez",
        businessSector: "Educación",
        companySize: "SMALL",
        website: "https://educabolivia.bo",
        email: "contacto@educabolivia.bo",
        phone: "+591 4 4567890",
        address: "Plaza Principal 789, La Paz",
        foundedYear: 2019,
        isActive: true,
        username: "educabolivia",
        password: "hashedpassword789",
        loginEmail: "admin@educabolivia.bo"
      },
      {
        name: "Comercial Los Andes",
        description: "Empresa de comercio al por mayor y menor",
        taxId: "789123456",
        legalRepresentative: "Ana Martínez",
        businessSector: "Comercio",
        companySize: "MICRO",
        website: "https://comercialandes.bo",
        email: "ventas@comercialandes.bo",
        phone: "+591 4 7891234",
        address: "Mercado Central 321, Santa Cruz",
        foundedYear: 2021,
        isActive: true,
        username: "comercialandes",
        password: "hashedpassword012",
        loginEmail: "admin@comercialandes.bo"
      },
      {
        name: "Manufactura Industrial",
        description: "Empresa de manufactura y producción industrial",
        taxId: "321654987",
        legalRepresentative: "Luis Fernández",
        businessSector: "Manufactura",
        companySize: "LARGE",
        website: "https://manufacturaindustrial.bo",
        email: "produccion@manufacturaindustrial.bo",
        phone: "+591 4 3216549",
        address: "Zona Industrial 654, Oruro",
        foundedYear: 2015,
        isActive: false,
        username: "manufacturaindustrial",
        password: "hashedpassword345",
        loginEmail: "admin@manufacturaindustrial.bo"
      }
    ];

    // Obtener un municipio y usuario para las empresas
    const municipality = await prisma.municipality.findFirst();
    const user = await prisma.user.findFirst({
      where: { role: 'SUPERADMIN' }
    });

    if (!municipality || !user) {
      console.log('❌ Se necesita al menos un municipio y un usuario SuperAdmin');
      return;
    }

    // Crear empresas de prueba
    for (const companyData of testCompanies) {
      const existingCompany = await prisma.company.findUnique({
        where: { username: companyData.username }
      });

      if (!existingCompany) {
        await prisma.company.create({
          data: {
            ...companyData,
            municipalityId: municipality.id,
            createdBy: user.id
          }
        });
        console.log(`✅ Empresa creada: ${companyData.name}`);
      } else {
        console.log(`ℹ️ Empresa ya existe: ${companyData.name}`);
      }
    }

    // 2. Probar diferentes búsquedas
    console.log('\n🔍 Probando diferentes búsquedas...\n');

    // Búsqueda por texto
    console.log('1. Búsqueda por texto "tecnología":');
    const techCompanies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: 'tecnología', mode: 'insensitive' } },
          { description: { contains: 'tecnología', mode: 'insensitive' } },
          { businessSector: { contains: 'tecnología', mode: 'insensitive' } }
        ]
      },
      include: {
        municipality: {
          select: { name: true, department: true }
        }
      }
    });
    console.log(`   Encontradas: ${techCompanies.length} empresas`);
    techCompanies.forEach(company => {
      console.log(`   - ${company.name} (${company.businessSector})`);
    });

    // Búsqueda por sector
    console.log('\n2. Búsqueda por sector "Salud":');
    const healthCompanies = await prisma.company.findMany({
      where: {
        businessSector: { contains: 'Salud', mode: 'insensitive' }
      },
      include: {
        municipality: {
          select: { name: true, department: true }
        }
      }
    });
    console.log(`   Encontradas: ${healthCompanies.length} empresas`);
    healthCompanies.forEach(company => {
      console.log(`   - ${company.name} (${company.companySize})`);
    });

    // Búsqueda por tamaño
    console.log('\n3. Búsqueda por tamaño "LARGE":');
    const largeCompanies = await prisma.company.findMany({
      where: {
        companySize: 'LARGE'
      },
      include: {
        municipality: {
          select: { name: true, department: true }
        }
      }
    });
    console.log(`   Encontradas: ${largeCompanies.length} empresas`);
    largeCompanies.forEach(company => {
      console.log(`   - ${company.name} (${company.businessSector})`);
    });

    // Búsqueda por año de fundación
    console.log('\n4. Búsqueda por año de fundación 2020:');
    const companies2020 = await prisma.company.findMany({
      where: {
        foundedYear: 2020
      },
      include: {
        municipality: {
          select: { name: true, department: true }
        }
      }
    });
    console.log(`   Encontradas: ${companies2020.length} empresas`);
    companies2020.forEach(company => {
      console.log(`   - ${company.name} (${company.foundedYear})`);
    });

    // Búsqueda por estado activo
    console.log('\n5. Búsqueda por estado activo:');
    const activeCompanies = await prisma.company.findMany({
      where: {
        isActive: true
      },
      include: {
        municipality: {
          select: { name: true, department: true }
        }
      }
    });
    console.log(`   Encontradas: ${activeCompanies.length} empresas activas`);

    const inactiveCompanies = await prisma.company.findMany({
      where: {
        isActive: false
      },
      include: {
        municipality: {
          select: { name: true, department: true }
        }
      }
    });
    console.log(`   Encontradas: ${inactiveCompanies.length} empresas inactivas`);

    // 3. Probar paginación
    console.log('\n📄 Probando paginación...');
    const page = 1;
    const limit = 2;
    const skip = (page - 1) * limit;

    const paginatedCompanies = await prisma.company.findMany({
      where: { isActive: true },
      include: {
        municipality: {
          select: { name: true, department: true }
        }
      },
      skip,
      take: limit,
      orderBy: { name: 'asc' }
    });

    const total = await prisma.company.count({ where: { isActive: true } });
    const pages = Math.ceil(total / limit);

    console.log(`   Página ${page} de ${pages} (${limit} elementos por página)`);
    console.log(`   Total de empresas activas: ${total}`);
    paginatedCompanies.forEach(company => {
      console.log(`   - ${company.name}`);
    });

    // 4. Probar ordenamiento
    console.log('\n🔄 Probando ordenamiento...');
    const sortedCompanies = await prisma.company.findMany({
      where: { isActive: true },
      include: {
        municipality: {
          select: { name: true, department: true }
        }
      },
      orderBy: { foundedYear: 'desc' },
      take: 3
    });

    console.log('   Top 3 empresas por año de fundación (descendente):');
    sortedCompanies.forEach(company => {
      console.log(`   - ${company.name} (${company.foundedYear})`);
    });

    // 5. Obtener filtros disponibles
    console.log('\n📊 Obteniendo filtros disponibles...');
    
    const businessSectors = await prisma.company.findMany({
      where: { isActive: true },
      select: { businessSector: true },
      distinct: ['businessSector']
    });

    const municipalities = await prisma.municipality.findMany({
      where: { isActive: true },
      select: { id: true, name: true, department: true },
      orderBy: { name: 'asc' }
    });

    console.log('   Sectores de negocio disponibles:');
    businessSectors.forEach(bs => {
      console.log(`   - ${bs.businessSector}`);
    });

    console.log('\n   Municipios disponibles:');
    municipalities.forEach(m => {
      console.log(`   - ${m.name} (${m.department})`);
    });

    // 6. Simular búsqueda compleja
    console.log('\n🎯 Simulando búsqueda compleja...');
    const complexSearch = await prisma.company.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { businessSector: { contains: 'Tecnología', mode: 'insensitive' } },
              { businessSector: { contains: 'Salud', mode: 'insensitive' } }
            ]
          },
          { companySize: { in: ['MEDIUM', 'LARGE'] } },
          { foundedYear: { gte: 2018 } }
        ]
      },
      include: {
        municipality: {
          select: { name: true, department: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`   Búsqueda compleja: empresas activas de Tecnología o Salud, tamaño MEDIUM/LARGE, fundadas desde 2018`);
    console.log(`   Encontradas: ${complexSearch.length} empresas`);
    complexSearch.forEach(company => {
      console.log(`   - ${company.name} (${company.businessSector}, ${company.companySize}, ${company.foundedYear})`);
    });

    console.log('\n🎉 ¡Buscador de empresas probado exitosamente!');
    console.log('\n📋 Endpoint disponible:');
    console.log('   GET /api/company/search');
    console.log('\n📋 Parámetros disponibles:');
    console.log('   - query: Búsqueda por texto');
    console.log('   - businessSector: Filtro por sector');
    console.log('   - companySize: Filtro por tamaño');
    console.log('   - municipalityId: Filtro por municipio');
    console.log('   - department: Filtro por departamento');
    console.log('   - foundedYear: Filtro por año de fundación');
    console.log('   - isActive: Filtro por estado activo');
    console.log('   - page: Número de página');
    console.log('   - limit: Elementos por página');
    console.log('   - sortBy: Campo para ordenar');
    console.log('   - sortOrder: Orden ascendente/descendente');

  } catch (error) {
    console.error('❌ Error probando el buscador de empresas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompanySearch();
