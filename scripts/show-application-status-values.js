console.log('📋 === VALORES VÁLIDOS PARA ApplicationStatus ===\n');

console.log('Los valores válidos para el campo "status" en JobApplication son:');
console.log('✅ SENT - Aplicación enviada');
console.log('✅ UNDER_REVIEW - En revisión');
console.log('✅ PRE_SELECTED - Preseleccionado');
console.log('✅ REJECTED - Rechazado');
console.log('✅ HIRED - Contratado\n');

console.log('⚠️  NOTA: El frontend está enviando "PENDING" que NO es válido.');
console.log('   Debe cambiar a "SENT" o "UNDER_REVIEW"\n');

console.log('🔄 Mapeo automático implementado:');
console.log('   "PENDING" → "SENT"');
console.log('   "SENT" → "SENT"');
console.log('   "UNDER_REVIEW" → "UNDER_REVIEW"');
console.log('   "PRE_SELECTED" → "PRE_SELECTED"');
console.log('   "REJECTED" → "REJECTED"');
console.log('   "HIRED" → "HIRED"');
console.log('   Cualquier otro valor → "SENT" (por defecto)');
