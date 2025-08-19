const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('📝 Creando datos de prueba...\n');

    // 1. Verificar que existe un usuario SuperAdmin
    console.log('👤 Verificando usuario SuperAdmin...');
    const superAdmin = await prisma.user.findFirst({
      where: { role: 'SUPERADMIN' }
    });

    if (!superAdmin) {
      console.log('❌ No se encontró usuario SuperAdmin. Ejecuta primero: npx prisma db seed');
      return;
    }
    console.log(`✅ SuperAdmin encontrado: ${superAdmin.username}`);

    // 2. Crear un municipio de prueba
    console.log('\n🏛️ Creando municipio de prueba...');
    const municipality = await prisma.municipality.upsert({
      where: { username: 'cochabamba' },
      update: {},
      create: {
        name: 'Cochabamba',
        department: 'Cochabamba',
        isActive: true,
        username: 'cochabamba',
        password: 'hashedpassword123',
        email: 'admin@cochabamba.bo',
        createdBy: superAdmin.id
      }
    });
    console.log(`✅ Municipio creado: ${municipality.name}`);

    // 3. Crear algunas empresas de prueba
    console.log('\n🏢 Creando empresas de prueba...');
    
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
            createdBy: superAdmin.id
          }
        });
        console.log(`✅ Empresa creada: ${companyData.name}`);
      } else {
        console.log(`ℹ️ Empresa ya existe: ${companyData.name}`);
      }
    }

    console.log('\n🎉 Datos de prueba creados exitosamente!');
    console.log('\n📋 Ahora puedes ejecutar: node scripts/test-company-search.js');

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
