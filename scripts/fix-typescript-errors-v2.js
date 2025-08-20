const fs = require('fs');
const path = require('path');

// Función para corregir errores específicos de TypeScript
function fixTypeScriptErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Corregir doble return
    content = content.replace(/return return /g, "return ");
    
    // 2. Corregir doble Promise<Response>
    content = content.replace(/Promise<Response>: Promise<Response>/g, "Promise<Response>");
    
    // 3. Corregir errores de sintaxis en type assertions
    content = content.replace(/\.\((\w+) as any\)\./g, ".($1 as any).");
    
    // 4. Corregir errores de prisma con type assertions incorrectos
    content = content.replace(/prisma\.\((\w+) as any\)\./g, "prisma.$1.");
    
    // 5. Corregir errores de sintaxis en where clauses
    content = content.replace(/where:\s*\{\s*id:\s*id\s*\|\|\s*''\s*\}\s*,/g, "where: { id: id || '' },");
    
    // 6. Corregir errores de sintaxis en type assertions de objetos
    content = content.replace(/\((\w+) as any\)\.(\w+)\.(\w+)/g, "($1 as any).$2.$3");
    
    // 7. Corregir errores de sintaxis en prisma queries
    content = content.replace(/await prisma\.\((\w+) as any\)\./g, "await prisma.$1.");
    
    // 8. Corregir errores de sintaxis en return statements
    content = content.replace(/return return res\./g, "return res.");
    
    // 9. Corregir errores de sintaxis en function signatures
    content = content.replace(/\): Promise<Response>: Promise<Response>/g, "): Promise<Response>");
    
    // 10. Corregir errores de sintaxis en type assertions de enrollment
    content = content.replace(/\(enrollment as any\)\./g, "(enrollment as any).");
    content = content.replace(/\(applicant as any\)\./g, "(applicant as any).");
    content = content.replace(/\(jobOffer as any\)\./g, "(jobOffer as any).");

    // Guardar el archivo si se modificó
    if (content !== fs.readFileSync(filePath, 'utf8')) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corregido: ${filePath}`);
      modified = true;
    }

    return modified;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Función para procesar directorios recursivamente
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let totalFixed = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
      totalFixed += processDirectory(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      if (fixTypeScriptErrors(filePath)) {
        totalFixed++;
      }
    }
  }

  return totalFixed;
}

// Ejecutar el script
console.log('🔧 Iniciando corrección específica de errores de TypeScript...\n');

const startTime = Date.now();
const totalFixed = processDirectory('.');

const endTime = Date.now();
const duration = (endTime - startTime) / 1000;

console.log(`\n✅ Proceso completado en ${duration.toFixed(2)}s`);
console.log(`📊 Total de archivos corregidos: ${totalFixed}`);
console.log('\n💡 Ejecuta "npx tsc --noEmit" para verificar que los errores se han corregido.');
