const { PrismaClient, InstitutionType } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const sampleInstitutions = [
  {
    name: "Fundación Jóvenes Emprendedores",
    department: "Cochabamba",
    region: "Valle Alto",
    population: 50000,
    mayorName: "María González",
    mayorEmail: "maria@fundacion.org",
    mayorPhone: "+591 70012345",
    address: "Av. Principal 123, Cochabamba",
    website: "https://fundacion.org",
    username: "fundacion_jovenes",
    password: "fundacion123",
    email: "info@fundacion.org",
    phone: "+591 4 123456",
    institutionType: "NGO",
    customType: null,
    primaryColor: "#FF6B6B",
    secondaryColor: "#4ECDC4"
  },
  {
    name: "Instituto de Desarrollo Local",
    department: "La Paz",
    region: "Altiplano",
    population: 75000,
    mayorName: "Carlos Rodríguez",
    mayorEmail: "carlos@instituto.org",
    mayorPhone: "+591 70098765",
    address: "Calle Comercio 456, La Paz",
    website: "https://instituto.org",
    username: "instituto_desarrollo",
    password: "instituto123",
    email: "contacto@instituto.org",
    phone: "+591 2 987654",
    institutionType: "FOUNDATION",
    customType: null,
    primaryColor: "#45B7D1",
    secondaryColor: "#96CEB4"
  },
  {
    name: "Centro de Innovación Tecnológica",
    department: "Santa Cruz",
    region: "Llanos",
    population: 100000,
    mayorName: "Ana Martínez",
    mayorEmail: "ana@centro.org",
    mayorPhone: "+591 70055555",
    address: "Av. Libertador 789, Santa Cruz",
    website: "https://centro.org",
    username: "centro_innovacion",
    password: "centro123",
    email: "info@centro.org",
    phone: "+591 3 555555",
    institutionType: "OTHER",
    customType: "Centro de Investigación",
    primaryColor: "#FFA07A",
    secondaryColor: "#98D8C8"
  },
  {
    name: "Asociación de Mujeres Emprendedoras",
    department: "Cochabamba",
    region: "Valle Bajo",
    population: 30000,
    mayorName: "Rosa López",
    mayorEmail: "rosa@asociacion.org",
    mayorPhone: "+591 70011111",
    address: "Calle Independencia 321, Cochabamba",
    website: "https://asociacion.org",
    username: "asociacion_mujeres",
    password: "asociacion123",
    email: "contacto@asociacion.org",
    phone: "+591 4 111111",
    institutionType: "NGO",
    customType: null,
    primaryColor: "#DDA0DD",
    secondaryColor: "#F0E68C"
  }
];

async function createSampleInstitutions() {
  try {
    console.log('🏛️ Creando instituciones de ejemplo...\n');

    for (const institutionData of sampleInstitutions) {
      // Verificar si la institución ya existe
      const existingInstitution = await prisma.institution.findUnique({
        where: { username: institutionData.username }
      });

      if (existingInstitution) {
        console.log(`⚠️  Institución ${institutionData.name} ya existe, saltando...`);
        continue;
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(institutionData.password, 10);

      // Crear la institución
      const institution = await prisma.institution.create({
        data: {
          name: institutionData.name,
          department: institutionData.department,
          region: institutionData.region,
          population: institutionData.population,
          mayorName: institutionData.mayorName,
          mayorEmail: institutionData.mayorEmail,
          mayorPhone: institutionData.mayorPhone,
          address: institutionData.address,
          website: institutionData.website,
          username: institutionData.username,
          password: hashedPassword,
          email: institutionData.email,
          phone: institutionData.phone,
          institutionType: institutionData.institutionType,
          customType: institutionData.customType,
          primaryColor: institutionData.primaryColor,
          secondaryColor: institutionData.secondaryColor,
          isActive: true,
          createdBy: "system" // Necesitamos un usuario creador
        }
      });

      console.log(`✅ Institución "${institution.name}" creada exitosamente`);
    }

    console.log('\n🎉 Instituciones de ejemplo creadas exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    sampleInstitutions.forEach(inst => {
      console.log(`   Institución: ${inst.name}`);
      console.log(`   Usuario: ${inst.username} | Contraseña: ${inst.password}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error creando instituciones:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleInstitutions();
