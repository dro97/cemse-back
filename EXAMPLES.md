# 📝 Ejemplos de Uso - CV y Carta de Presentación

## **🎯 Nuevos Endpoints de CV**

### **1. Obtener CV del Usuario**
```bash
GET http://localhost:3001/api/cv
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta:**
```json
{
  "personalInfo": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@example.com",
    "phone": "+591 70012345",
    "address": "Calle Principal 123, Cochabamba",
    "municipality": "Cochabamba",
    "department": "Cochabamba",
    "country": "Bolivia",
    "birthDate": "2005-06-15T00:00:00.000Z",
    "gender": "Masculino",
    "documentType": "CI",
    "documentNumber": "12345678",
    "nationality": "Bolivia"
  },
  "education": {
    "level": "SECONDARY",
    "currentInstitution": "Colegio San José",
    "graduationYear": 2023,
    "isStudying": true
  },
  "skills": ["JavaScript", "React", "HTML", "CSS"],
  "interests": ["Programación", "Tecnología", "Diseño Web"],
  "workExperience": [],
  "achievements": [],
  "profileImage": "/uploads/images/avatar.jpg"
}
```

### **2. Actualizar CV del Usuario**
```bash
PUT http://localhost:3001/api/cv
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "cvData": {
    "personalInfo": {
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan.perez@example.com",
      "phone": "+591 70012345"
    },
    "skills": ["JavaScript", "React", "Node.js", "Python"],
    "interests": ["Programación", "Tecnología", "IA"]
  }
}
```

### **3. Obtener Carta de Presentación**
```bash
GET http://localhost:3001/api/cv/cover-letter
Authorization: Bearer YOUR_JWT_TOKEN
```

### **4. Guardar Carta de Presentación**
```bash
POST http://localhost:3001/api/cv/cover-letter
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "coverLetter": "Estimado equipo de reclutamiento...",
  "title": "Carta para Desarrollador Frontend"
}
```

### **5. Generar CV para Postulación Específica**
```bash
POST http://localhost:3001/api/cv/generate-for-application
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "jobOfferId": "job_offer_id_here",
  "customCoverLetter": "Carta personalizada opcional..."
}
```

**Respuesta:**
```json
{
  "cvData": { /* datos del CV */ },
  "coverLetter": "Estimado equipo de Tech Solutions...",
  "jobOffer": {
    "id": "job_offer_id",
    "title": "Desarrollador Frontend",
    "company": "Tech Solutions"
  }
}
```

## **🎯 Estructura de Datos del CV**

El CV se guarda como JSON con la siguiente estructura:

```json
{
  "personalInfo": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@example.com",
    "phone": "+591 70012345",
    "address": "Calle Principal 123, Cochabamba",
    "birthDate": "2005-06-15",
    "nationality": "Boliviano"
  },
  "education": [
    {
      "institution": "Colegio San José",
      "degree": "Bachiller en Ciencias",
      "startDate": "2020",
      "endDate": "2023",
      "description": "Especialización en ciencias exactas"
    }
  ],
  "experience": [
    {
      "company": "Tech Solutions",
      "position": "Desarrollador Junior",
      "startDate": "2023-01",
      "endDate": "2023-12",
      "description": "Desarrollo de aplicaciones web con React y Node.js"
    }
  ],
  "skills": [
    {
      "category": "Programming",
      "skills": ["JavaScript", "React", "Node.js", "HTML", "CSS"]
    },
    {
      "category": "Languages",
      "skills": ["Spanish", "English"]
    }
  ],
  "certifications": [
    {
      "name": "React Developer Certificate",
      "issuer": "Meta",
      "date": "2023-06",
      "url": "https://example.com/cert"
    }
  ],
  "projects": [
    {
      "name": "E-commerce Platform",
      "description": "Plataforma de comercio electrónico desarrollada con React",
      "technologies": ["React", "Node.js", "MongoDB"],
      "url": "https://github.com/juan/ecommerce"
    }
  ]
}
```

## **📤 Endpoints Disponibles**

### **1. Subir Imagen de Perfil**
```bash
POST http://localhost:3001/api/files/upload/profile-image
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

Form Data:
- profileImage: [archivo de imagen]
```

**Respuesta:**
```json
{
  "message": "Image uploaded successfully",
  "imageUrl": "/uploads/images/profileImage-1703123456789-123456789.jpg",
  "filename": "profileImage-1703123456789-123456789.jpg"
}
```

### **2. Crear Postulación con CV y Carta**
```bash
POST http://localhost:3001/api/jobapplication
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "jobOfferId": "job_offer_id_here",
  "coverLetter": "Estimado equipo de reclutamiento,\n\nMe dirijo a ustedes con gran interés para postularme a la posición de Desarrollador Frontend...",
  "cvData": {
    "personalInfo": {
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan.perez@example.com",
      "phone": "+591 70012345"
    },
    "education": [...],
    "experience": [...],
    "skills": [...]
  },
  "profileImage": "/uploads/images/profileImage-1703123456789-123456789.jpg"
}
```

### **3. Ver Imagen de Perfil**
```bash
GET http://localhost:3001/api/files/images/profileImage-1703123456789-123456789.jpg
```

## **🔄 Flujo Completo de Postulación (Nuevo Enfoque)**

### **Paso 1: Obtener CV del Usuario**
```javascript
const cvResponse = await fetch('http://localhost:3001/api/cv', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const cvData = await cvResponse.json();
```

### **Paso 2: Subir Imagen de Perfil (Opcional)**
```javascript
const formData = new FormData();
formData.append('profileImage', imageFile);

const imageResponse = await fetch('http://localhost:3001/api/files/upload/profile-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { imageUrl } = await imageResponse.json();
```

### **Paso 3: Generar CV para Postulación Específica**
```javascript
const generateResponse = await fetch('http://localhost:3001/api/cv/generate-for-application', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jobOfferId: 'job_offer_id',
    customCoverLetter: 'Carta personalizada opcional...'
  })
});

const { cvData, coverLetter, jobOffer } = await generateResponse.json();
```

### **Paso 4: Crear Postulación**
```javascript
const applicationData = {
  jobOfferId: jobOffer.id,
  coverLetter: coverLetter,
  cvData: cvData,
  profileImage: imageUrl
};

const response = await fetch('http://localhost:3001/api/jobapplication', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(applicationData)
});
```

### **Paso 3: El Frontend Genera el PDF**
```javascript
// El frontend usa los datos del cvData para generar un PDF
// Puede usar librerías como jsPDF, react-pdf, etc.
import jsPDF from 'jspdf';

function generatePDF(cvData) {
  const doc = new jsPDF();
  
  // Agregar datos personales
  doc.text(`${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}`, 20, 20);
  doc.text(cvData.personalInfo.email, 20, 30);
  
  // Agregar educación
  doc.text('Educación:', 20, 50);
  cvData.education.forEach((edu, index) => {
    doc.text(`${edu.degree} - ${edu.institution}`, 20, 60 + (index * 10));
  });
  
  // ... más contenido del CV
  
  doc.save('cv.pdf');
}
```

## **📋 Ventajas del Nuevo Enfoque**

### **🎯 Separación de Responsabilidades**
1. **CV Controller**: Maneja solo datos del CV y carta de presentación
2. **JobApplication Controller**: Maneja solo postulaciones
3. **FileUpload Controller**: Maneja solo archivos

### **🔄 Reutilización y Flexibilidad**
1. **CV Reutilizable**: Un CV puede usarse para múltiples postulaciones
2. **Carta Personalizada**: Se genera automáticamente según la empresa y posición
3. **Datos Centralizados**: Los datos del CV se mantienen en el perfil del usuario
4. **Fácil Actualización**: Se puede actualizar el CV sin afectar postulaciones existentes

### **⚡ Eficiencia**
1. **Menos Duplicación**: No se duplican datos del CV en cada postulación
2. **Búsqueda Optimizada**: Los datos del CV están indexados en el perfil
3. **Menor Tamaño**: Solo se guardan referencias, no archivos pesados
4. **Rápida Generación**: El CV se genera dinámicamente según la oferta

### **🔒 Seguridad**
1. **Autenticación**: Todos los endpoints requieren autenticación
2. **Autorización**: Cada usuario solo accede a sus propios datos
3. **Validación**: Se validan todos los datos antes de guardar
4. **Auditoría**: Se puede rastrear quién actualizó qué y cuándo

## **🔧 Configuración del Servidor**

Asegúrate de que el servidor esté configurado para servir archivos estáticos:

```typescript
// En server.ts
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

## **📱 Ejemplo con Credenciales Reales**

```bash
# 1. Login para obtener token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "joven_test", "password": "joven123"}'

# 2. Usar el token para crear postulación
curl -X POST http://localhost:3001/api/jobapplication \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobOfferId": "job_offer_id",
    "coverLetter": "Me interesa mucho esta posición...",
    "cvData": {
      "personalInfo": {
        "firstName": "Juan",
        "lastName": "Pérez",
        "email": "juan.perez@example.com"
      }
    }
  }'
```
