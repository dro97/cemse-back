# 🎯 CV Builder - Documentación Completa

## 📋 Campos Implementados

### ✅ **Campos Básicos (Ya Existentes)**
- ✅ **Personal Info**: Nombre, email, teléfono, dirección básica
- ✅ **Education**: Nivel educativo, institución, año de graduación
- ✅ **Skills**: Habilidades básicas (array de strings)
- ✅ **Interests**: Intereses (array de strings)
- ✅ **Work Experience**: Experiencia laboral (JSON)
- ✅ **Achievements**: Logros (JSON)
- ✅ **Profile Image**: Foto de perfil

### 🆕 **Nuevos Campos del CV Builder**

#### **1. Job Title (Puesto Objetivo)**
```typescript
jobTitle: string
```
**Ejemplo**: `"Desarrollador Frontend Junior"`

#### **2. Address Line (Línea de Dirección)**
```typescript
addressLine: string
```
**Ejemplo**: `"Calle Principal 123, Zona Centro"`

#### **3. City/State (Ciudad/Estado)**
```typescript
cityState: string
```
**Ejemplo**: `"Cochabamba, Cochabamba"`

#### **4. Languages (Idiomas)**
```typescript
languages: Array<{
  language: string;
  level: string;
}>
```
**Ejemplo**:
```json
[
  { "language": "Español", "level": "Nativo" },
  { "language": "Inglés", "level": "Intermedio" },
  { "language": "Portugués", "level": "Básico" }
]
```

#### **5. Websites & Social Links (Enlaces Web y Redes Sociales)**
```typescript
websites: Array<{
  type: string;
  url: string;
  label: string;
}>
```
**Ejemplo**:
```json
[
  { "type": "linkedin", "url": "https://linkedin.com/in/juanperez", "label": "LinkedIn" },
  { "type": "github", "url": "https://github.com/juanperez", "label": "GitHub" },
  { "type": "portfolio", "url": "https://juanperez.dev", "label": "Portfolio" }
]
```

#### **6. Skills with Experience Level (Habilidades con Nivel de Experiencia)**
```typescript
skillsWithLevel: Array<{
  skill: string;
  level: string;
  years: number;
}>
```
**Ejemplo**:
```json
[
  { "skill": "JavaScript", "level": "Intermedio", "years": 2 },
  { "skill": "React", "level": "Intermedio", "years": 1.5 },
  { "skill": "HTML/CSS", "level": "Avanzado", "years": 3 }
]
```

#### **7. Extra-curricular Activities (Actividades Extracurriculares)**
```typescript
extracurricularActivities: Array<{
  title: string;
  organization: string;
  period: string;
  description: string;
}>
```
**Ejemplo**:
```json
[
  {
    "title": "Voluntario en ONG Tech",
    "organization": "Fundación Tecnológica",
    "period": "2023 - Presente",
    "description": "Enseño programación básica a jóvenes de bajos recursos"
  }
]
```

#### **8. Projects (Proyectos)**
```typescript
projects: Array<{
  title: string;
  description: string;
  technologies: string[];
  url: string;
  period: string;
  highlights: string[];
}>
```
**Ejemplo**:
```json
[
  {
    "title": "E-commerce Platform",
    "description": "Plataforma de comercio electrónico desarrollada con React y Node.js",
    "technologies": ["React", "Node.js", "MongoDB", "Stripe"],
    "url": "https://github.com/juanperez/ecommerce",
    "period": "2023",
    "highlights": [
      "Implementé sistema de pagos con Stripe",
      "Desarrollé panel de administración completo"
    ]
  }
]
```

## 🚀 **Endpoints del CV Builder**

### **1. Obtener CV Completo**
```bash
GET /api/cv
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta Completa**:
```json
{
  "personalInfo": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@example.com",
    "phone": "+591 70012345",
    "address": "Calle Principal 123",
    "addressLine": "Calle Principal 123, Zona Centro",
    "municipality": "Cochabamba",
    "cityState": "Cochabamba, Cochabamba",
    "department": "Cochabamba",
    "country": "Bolivia",
    "birthDate": "2005-06-15T00:00:00.000Z",
    "gender": "Masculino",
    "documentType": "CI",
    "documentNumber": "12345678",
    "nationality": "Bolivia"
  },
  "jobTitle": "Desarrollador Frontend Junior",
  "education": {
    "level": "SECONDARY",
    "currentInstitution": "Colegio San José",
    "graduationYear": 2023,
    "isStudying": true
  },
  "skills": ["JavaScript", "React", "HTML", "CSS"],
  "skillsWithLevel": [
    { "skill": "JavaScript", "level": "Intermedio", "years": 2 },
    { "skill": "React", "level": "Intermedio", "years": 1.5 }
  ],
  "interests": ["Programación", "Tecnología", "Diseño Web"],
  "languages": [
    { "language": "Español", "level": "Nativo" },
    { "language": "Inglés", "level": "Intermedio" }
  ],
  "websites": [
    { "type": "linkedin", "url": "https://linkedin.com/in/juanperez", "label": "LinkedIn" },
    { "type": "github", "url": "https://github.com/juanperez", "label": "GitHub" }
  ],
  "workExperience": [],
  "extracurricularActivities": [
    {
      "title": "Voluntario en ONG Tech",
      "organization": "Fundación Tecnológica",
      "period": "2023 - Presente",
      "description": "Enseño programación básica a jóvenes de bajos recursos"
    }
  ],
  "projects": [
    {
      "title": "E-commerce Platform",
      "description": "Plataforma de comercio electrónico desarrollada con React y Node.js",
      "technologies": ["React", "Node.js", "MongoDB", "Stripe"],
      "url": "https://github.com/juanperez/ecommerce",
      "period": "2023",
      "highlights": [
        "Implementé sistema de pagos con Stripe",
        "Desarrollé panel de administración completo"
      ]
    }
  ],
  "achievements": [
    {
      "title": "Primer lugar en Hackathon 2023",
      "date": "2023",
      "description": "Gané el primer lugar en el hackathon de desarrollo web organizado por la universidad"
    }
  ],
  "profileImage": "/uploads/images/profile-123.jpg"
}
```

### **2. Actualizar CV**
```bash
PUT /api/cv
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "cvData": {
    "jobTitle": "Desarrollador Full Stack",
    "personalInfo": {
      "addressLine": "Nueva dirección 456",
      "cityState": "La Paz, La Paz"
    },
    "languages": [
      { "language": "Español", "level": "Nativo" },
      { "language": "Inglés", "level": "Avanzado" }
    ],
    "websites": [
      { "type": "linkedin", "url": "https://linkedin.com/in/juanperez", "label": "LinkedIn" }
    ],
    "skillsWithLevel": [
      { "skill": "React", "level": "Avanzado", "years": 3 }
    ],
    "extracurricularActivities": [
      {
        "title": "Nueva Actividad",
        "organization": "Nueva Organización",
        "period": "2024 - Presente",
        "description": "Descripción de la nueva actividad"
      }
    ],
    "projects": [
      {
        "title": "Nuevo Proyecto",
        "description": "Descripción del nuevo proyecto",
        "technologies": ["React", "TypeScript"],
        "url": "https://github.com/juanperez/nuevo-proyecto",
        "period": "2024",
        "highlights": ["Nuevo highlight"]
      }
    ]
  }
}
```

## 🎨 **Implementación en el Frontend**

### **1. Tipos TypeScript**
```typescript
interface Language {
  language: string;
  level: string;
}

interface Website {
  type: string;
  url: string;
  label: string;
}

interface SkillWithLevel {
  skill: string;
  level: string;
  years: number;
}

interface ExtracurricularActivity {
  title: string;
  organization: string;
  period: string;
  description: string;
}

interface Project {
  title: string;
  description: string;
  technologies: string[];
  url: string;
  period: string;
  highlights: string[];
}

interface Achievement {
  title: string;
  date: string;
  description: string;
}

interface CVData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    addressLine: string;
    municipality: string;
    cityState: string;
    department: string;
    country: string;
    birthDate: string;
    gender: string;
    documentType: string;
    documentNumber: string;
    nationality: string;
  };
  jobTitle: string;
  education: {
    level: string;
    currentInstitution: string;
    graduationYear: number;
    isStudying: boolean;
  };
  skills: string[];
  skillsWithLevel: SkillWithLevel[];
  interests: string[];
  languages: Language[];
  websites: Website[];
  workExperience: any[];
  extracurricularActivities: ExtracurricularActivity[];
  projects: Project[];
  achievements: Achievement[];
  profileImage: string;
}
```

### **2. Hook useCV (Actualizado)**
```typescript
import { useState, useEffect } from 'react';

export const useCV = (token: string) => {
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCV = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/cv', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error fetching CV');
      }

      const data = await response.json();
      setCvData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateCV = async (newCVData: Partial<CVData>) => {
    try {
      const response = await fetch('http://localhost:3001/api/cv', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cvData: newCVData })
      });

      if (!response.ok) {
        throw new Error('Error updating CV');
      }

      await fetchCV(); // Recargar CV
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    if (token) {
      fetchCV();
    }
  }, [token]);

  return { cvData, loading, error, updateCV, refetch: fetchCV };
};
```

### **3. Componente CVTemplate (Actualizado)**
```typescript
import React from 'react';
import { CVData } from '../types/cv';

interface CVTemplateProps {
  cvData: CVData;
}

export const CVTemplate: React.FC<CVTemplateProps> = ({ cvData }) => {
  return (
    <div className="cv-template">
      {/* Header con Job Title */}
      <header className="cv-header">
        <h1>{cvData.personalInfo.firstName} {cvData.personalInfo.lastName}</h1>
        <h2>{cvData.jobTitle}</h2>
        <div className="contact-info">
          <p>{cvData.personalInfo.email}</p>
          <p>{cvData.personalInfo.phone}</p>
          <p>{cvData.personalInfo.addressLine}</p>
          <p>{cvData.personalInfo.cityState}</p>
        </div>
      </header>

      {/* Languages */}
      {cvData.languages && cvData.languages.length > 0 && (
        <section className="languages-section">
          <h3>Idiomas</h3>
          <div className="languages-grid">
            {cvData.languages.map((lang, index) => (
              <div key={index} className="language-item">
                <strong>{lang.language}</strong>: {lang.level}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Websites */}
      {cvData.websites && cvData.websites.length > 0 && (
        <section className="websites-section">
          <h3>Enlaces Web</h3>
          <div className="websites-grid">
            {cvData.websites.map((website, index) => (
              <a key={index} href={website.url} target="_blank" rel="noopener noreferrer">
                {website.label}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Skills with Level */}
      {cvData.skillsWithLevel && cvData.skillsWithLevel.length > 0 && (
        <section className="skills-section">
          <h3>Habilidades</h3>
          <div className="skills-grid">
            {cvData.skillsWithLevel.map((skill, index) => (
              <div key={index} className="skill-item">
                <strong>{skill.skill}</strong>
                <span className="level">{skill.level}</span>
                <span className="years">{skill.years} años</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Extracurricular Activities */}
      {cvData.extracurricularActivities && cvData.extracurricularActivities.length > 0 && (
        <section className="activities-section">
          <h3>Actividades Extracurriculares</h3>
          {cvData.extracurricularActivities.map((activity, index) => (
            <div key={index} className="activity-item">
              <h4>{activity.title}</h4>
              <p className="organization">{activity.organization}</p>
              <p className="period">{activity.period}</p>
              <p className="description">{activity.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {cvData.projects && cvData.projects.length > 0 && (
        <section className="projects-section">
          <h3>Proyectos</h3>
          {cvData.projects.map((project, index) => (
            <div key={index} className="project-item">
              <h4>{project.title}</h4>
              <p className="description">{project.description}</p>
              <div className="technologies">
                <strong>Tecnologías:</strong> {project.technologies.join(', ')}
              </div>
              <div className="highlights">
                <strong>Destacados:</strong>
                <ul>
                  {project.highlights.map((highlight, hIndex) => (
                    <li key={hIndex}>{highlight}</li>
                  ))}
                </ul>
              </div>
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                Ver proyecto
              </a>
            </div>
          ))}
        </section>
      )}

      {/* Achievements */}
      {cvData.achievements && cvData.achievements.length > 0 && (
        <section className="achievements-section">
          <h3>Logros</h3>
          {cvData.achievements.map((achievement, index) => (
            <div key={index} className="achievement-item">
              <h4>{achievement.title}</h4>
              <span className="date">{achievement.date}</span>
              <p>{achievement.description}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};
```

## 🎯 **Estado Actual**

### ✅ **Completado**
- ✅ **Base de datos**: Todos los campos agregados
- ✅ **Migración**: Aplicada exitosamente
- ✅ **Backend**: Endpoints actualizados
- ✅ **Datos de ejemplo**: Agregados al usuario joven
- ✅ **Documentación**: Completa

### 🚀 **Listo para Frontend**
- ✅ **Tipos TypeScript**: Definidos
- ✅ **Estructura de datos**: Documentada
- ✅ **Ejemplos de uso**: Incluidos
- ✅ **Endpoints**: Funcionando

## 📝 **Próximos Pasos**

1. **Implementar en el frontend** usando la documentación
2. **Crear formularios** para cada sección
3. **Diseñar templates** de CV
4. **Agregar validaciones** en el frontend
5. **Implementar preview** en tiempo real

¡El CV Builder está completamente implementado y listo para usar! 🎉
