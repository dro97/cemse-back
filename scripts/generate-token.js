const jwt = require('jsonwebtoken');

// Usar el mismo secret que el servidor
const JWT_SECRET = 'your-secret-key'; // Cambia esto por tu JWT_SECRET real

// Crear un payload similar al que usa el servidor
const payload = {
  id: 'cme7crnpe0000y4jzy59dorf0', // ID del usuario que vimos en los datos
  type: 'user',
  role: 'YOUTH'
};

// Generar el token
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

console.log('🔑 Token generado:');
console.log(token);
console.log('\n📋 Payload decodificado:');
console.log(JSON.stringify(jwt.decode(token), null, 2));
