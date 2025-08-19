# 📝 Carta de Presentación Editable - Documentación Completa

## 🎯 **Descripción General**

El sistema de carta de presentación ahora permite editar **todos los campos** de la carta, incluyendo:
- **Destinatario** (Para:)
- **Asunto**
- **Contenido**
- **Template**

## 🚀 **Endpoints Disponibles**

### **1. Obtener Carta de Presentación**
```bash
GET /api/cv/cover-letter
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta**:
```json
{
  "recipient": {
    "department": "Recursos Humanos",
    "companyName": "TechCorp Bolivia",
    "address": "Av. Principal 123, Zona Centro",
    "city": "Cochabamba",
    "country": "Bolivia"
  },
  "subject": "Postulación para Desarrollador Frontend Junior",
  "content": "Estimado equipo de Recursos Humanos...",
  "template": "professional"
}
```

### **2. Guardar Carta de Presentación**
```bash
POST /api/cv/cover-letter
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "recipient": {
    "department": "Recursos Humanos",
    "companyName": "TechCorp Bolivia",
    "address": "Av. Principal 123, Zona Centro",
    "city": "Cochabamba",
    "country": "Bolivia"
  },
  "subject": "Postulación para Desarrollador Frontend Junior",
  "content": "Estimado equipo de Recursos Humanos...",
  "template": "professional"
}
```

## 📊 **Estructura de Datos**

### **Recipient (Destinatario)**
```typescript
interface Recipient {
  department: string;    // Departamento (ej: "Recursos Humanos")
  companyName: string;   // Nombre de la empresa
  address: string;       // Dirección de la empresa
  city: string;          // Ciudad
  country: string;       // País
}
```

### **Cover Letter Completa**
```typescript
interface CoverLetter {
  recipient: Recipient;
  subject: string;       // Asunto de la carta
  content: string;       // Contenido principal
  template: string;      // Template a usar ("professional", "creative", "minimalist")
}
```

## 🎨 **Templates Disponibles**

### **1. Professional (Profesional)**
- Diseño formal y corporativo
- Tipografía clara y legible
- Estructura estándar de carta de presentación

### **2. Creative (Creativo)**
- Diseño más moderno y atractivo
- Elementos visuales adicionales
- Colores más vibrantes

### **3. Minimalist (Minimalista)**
- Diseño limpio y simple
- Enfoque en el contenido
- Mínimos elementos decorativos

## 📱 **Implementación en el Frontend**

### **1. Hook React para Carta de Presentación**
```typescript
import { useState, useEffect } from 'react';

interface Recipient {
  department: string;
  companyName: string;
  address: string;
  city: string;
  country: string;
}

interface CoverLetter {
  recipient: Recipient;
  subject: string;
  content: string;
  template: string;
}

export const useCoverLetter = (token: string) => {
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoverLetter = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/cv/cover-letter', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error fetching cover letter');
      }

      const data = await response.json();
      setCoverLetter(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const saveCoverLetter = async (coverLetterData: CoverLetter) => {
    try {
      const response = await fetch('http://localhost:3001/api/cv/cover-letter', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(coverLetterData)
      });

      if (!response.ok) {
        throw new Error('Error saving cover letter');
      }

      await fetchCoverLetter(); // Recargar datos
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    if (token) {
      fetchCoverLetter();
    }
  }, [token]);

  return { 
    coverLetter, 
    loading, 
    error, 
    saveCoverLetter, 
    refetch: fetchCoverLetter 
  };
};
```

### **2. Componente de Edición**
```typescript
import React, { useState } from 'react';
import { useCoverLetter } from '../hooks/useCoverLetter';

interface CoverLetterEditorProps {
  token: string;
}

export const CoverLetterEditor: React.FC<CoverLetterEditorProps> = ({ token }) => {
  const { coverLetter, loading, error, saveCoverLetter } = useCoverLetter(token);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    recipient: {
      department: '',
      companyName: '',
      address: '',
      city: '',
      country: ''
    },
    subject: '',
    content: '',
    template: 'professional'
  });

  const handleSave = async () => {
    await saveCoverLetter(formData);
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (coverLetter) {
      setFormData(coverLetter);
    }
    setIsEditing(true);
  };

  if (loading) return <div>Cargando carta de presentación...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!coverLetter) return <div>No se encontró carta de presentación</div>;

  return (
    <div className="cover-letter-editor">
      <div className="header">
        <h2>Carta de Presentación</h2>
        <button onClick={isEditing ? handleSave : handleEdit}>
          {isEditing ? 'Guardar' : 'Editar'}
        </button>
      </div>

      {isEditing ? (
        <div className="edit-form">
          {/* Recipient Fields */}
          <div className="recipient-section">
            <h3>Destinatario</h3>
            <input
              type="text"
              placeholder="Departamento"
              value={formData.recipient.department}
              onChange={(e) => setFormData({
                ...formData,
                recipient: { ...formData.recipient, department: e.target.value }
              })}
            />
            <input
              type="text"
              placeholder="Nombre de la empresa"
              value={formData.recipient.companyName}
              onChange={(e) => setFormData({
                ...formData,
                recipient: { ...formData.recipient, companyName: e.target.value }
              })}
            />
            <input
              type="text"
              placeholder="Dirección"
              value={formData.recipient.address}
              onChange={(e) => setFormData({
                ...formData,
                recipient: { ...formData.recipient, address: e.target.value }
              })}
            />
            <input
              type="text"
              placeholder="Ciudad"
              value={formData.recipient.city}
              onChange={(e) => setFormData({
                ...formData,
                recipient: { ...formData.recipient, city: e.target.value }
              })}
            />
            <input
              type="text"
              placeholder="País"
              value={formData.recipient.country}
              onChange={(e) => setFormData({
                ...formData,
                recipient: { ...formData.recipient, country: e.target.value }
              })}
            />
          </div>

          {/* Subject */}
          <div className="subject-section">
            <h3>Asunto</h3>
            <input
              type="text"
              placeholder="Asunto de la carta"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          {/* Content */}
          <div className="content-section">
            <h3>Contenido</h3>
            <textarea
              placeholder="Contenido de la carta"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={15}
            />
          </div>

          {/* Template */}
          <div className="template-section">
            <h3>Template</h3>
            <select
              value={formData.template}
              onChange={(e) => setFormData({ ...formData, template: e.target.value })}
            >
              <option value="professional">Profesional</option>
              <option value="creative">Creativo</option>
              <option value="minimalist">Minimalista</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="preview">
          {/* Preview de la carta */}
          <div className="cover-letter-preview">
            <div className="recipient">
              <strong>Para:</strong><br />
              {coverLetter.recipient.department}<br />
              {coverLetter.recipient.companyName}<br />
              {coverLetter.recipient.address}<br />
              {coverLetter.recipient.city}, {coverLetter.recipient.country}
            </div>
            
            <div className="subject">
              <strong>Asunto:</strong> {coverLetter.subject}
            </div>
            
            <div className="content">
              {coverLetter.content.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

## 🎯 **Ejemplos de Uso**

### **1. Obtener Carta de Presentación**
```javascript
const response = await fetch('http://localhost:3001/api/cv/cover-letter', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const coverLetter = await response.json();
console.log(coverLetter);
```

### **2. Guardar Carta de Presentación**
```javascript
const coverLetterData = {
  recipient: {
    department: "Recursos Humanos",
    companyName: "TechCorp Bolivia",
    address: "Av. Principal 123, Zona Centro",
    city: "Cochabamba",
    country: "Bolivia"
  },
  subject: "Postulación para Desarrollador Frontend Junior",
  content: "Estimado equipo de Recursos Humanos...",
  template: "professional"
};

const response = await fetch('http://localhost:3001/api/cv/cover-letter', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(coverLetterData)
});
```

## 🔧 **Base de Datos**

### **Campos Agregados al Modelo Profile**
```prisma
model Profile {
  // ... otros campos ...
  
  // Cover Letter fields
  coverLetterRecipient   Json?              @map("cover_letter_recipient")
  coverLetterSubject     String?            @map("cover_letter_subject")
  coverLetterContent     String?            @map("cover_letter_content")
  coverLetterTemplate    String?            @map("cover_letter_template") @default("professional")
}
```

### **Migración Aplicada**
```sql
-- Migración: add_cover_letter_fields
ALTER TABLE profiles ADD COLUMN cover_letter_recipient JSONB;
ALTER TABLE profiles ADD COLUMN cover_letter_subject TEXT;
ALTER TABLE profiles ADD COLUMN cover_letter_content TEXT;
ALTER TABLE profiles ADD COLUMN cover_letter_template TEXT DEFAULT 'professional';
```

## ✅ **Estado Actual**

- ✅ **Base de datos**: Campos agregados y migración aplicada
- ✅ **Backend**: Endpoints actualizados para manejar todos los campos
- ✅ **Validación**: Campos requeridos validados
- ✅ **Datos de ejemplo**: Agregados al usuario joven
- ✅ **Documentación**: Completa

## 🚀 **Próximos Pasos**

1. **Implementar en el frontend** usando los ejemplos
2. **Crear templates visuales** para cada tipo
3. **Agregar preview en tiempo real**
4. **Implementar exportación a PDF**

¡La funcionalidad de carta de presentación editable está completamente implementada! 🎉
