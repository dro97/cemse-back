# 🎓 Educación Detallada - Documentación Completa

## 🎯 **Descripción General**

El sistema de educación ahora incluye **campos detallados** para manejar información completa sobre la formación académica del usuario, incluyendo:
- **Historial educativo completo**
- **Información universitaria detallada**
- **Estado de estudios**
- **Promedio académico (GPA)**
- **Logros académicos**

## 🚀 **Endpoints Disponibles**

### **1. Obtener CV (incluye educación detallada)**
```bash
GET /api/cv
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta**:
```json
{
  "education": {
    "level": "UNIVERSITY",
    "currentInstitution": "Universidad Mayor de San Simón",
    "graduationYear": 2025,
    "isStudying": true,
    "educationHistory": [
      {
        "institution": "Colegio San Agustín",
        "degree": "Bachiller en Humanidades",
        "startDate": "2015-02-01",
        "endDate": "2020-11-30",
        "status": "graduado",
        "gpa": 85.5,
        "achievements": ["Primer lugar en Olimpiadas de Matemáticas"]
      }
    ],
    "currentDegree": "Ingeniería en Sistemas",
    "universityName": "Universidad Mayor de San Simón",
    "universityStartDate": "2021-02-01T00:00:00.000Z",
    "universityEndDate": null,
    "universityStatus": "en_curso",
    "gpa": 78.2,
    "academicAchievements": [
      {
        "title": "Beca de Excelencia Académica",
        "date": "2022",
        "description": "Beca otorgada por mantener un promedio superior a 75 puntos"
      }
    ]
  }
}
```

### **2. Actualizar CV (incluye educación detallada)**
```bash
PUT /api/cv
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "cvData": {
    "education": {
      "level": "UNIVERSITY",
      "currentInstitution": "Universidad Mayor de San Simón",
      "graduationYear": 2025,
      "isStudying": true,
      "educationHistory": [...],
      "currentDegree": "Ingeniería en Sistemas",
      "universityName": "Universidad Mayor de San Simón",
      "universityStartDate": "2021-02-01",
      "universityEndDate": null,
      "universityStatus": "en_curso",
      "gpa": 78.2,
      "academicAchievements": [...]
    }
  }
}
```

## 📊 **Estructura de Datos**

### **Education (Educación)**
```typescript
interface Education {
  level: string;                    // Nivel educativo (PRIMARY, SECONDARY, UNIVERSITY, etc.)
  currentInstitution: string;       // Institución actual
  graduationYear: number;           // Año de graduación
  isStudying: boolean;              // Si está estudiando actualmente
  
  // Educación detallada
  educationHistory: EducationHistoryItem[];  // Historial completo
  currentDegree: string;            // Grado actual
  universityName: string;           // Nombre de la universidad
  universityStartDate: string;      // Fecha de inicio en universidad
  universityEndDate: string | null; // Fecha de fin en universidad
  universityStatus: string;         // Estado universitario
  gpa: number;                      // Promedio académico
  academicAchievements: AcademicAchievement[]; // Logros académicos
}
```

### **EducationHistoryItem (Elemento del Historial)**
```typescript
interface EducationHistoryItem {
  institution: string;              // Nombre de la institución
  degree: string;                   // Título o grado obtenido
  startDate: string;                // Fecha de inicio
  endDate: string | null;           // Fecha de fin
  status: string;                   // Estado: "graduado", "en_curso", "pausado", "abandonado"
  gpa: number;                      // Promedio en esa institución
  achievements: string[];           // Logros específicos
}
```

### **AcademicAchievement (Logro Académico)**
```typescript
interface AcademicAchievement {
  title: string;                    // Título del logro
  date: string;                     // Fecha del logro
  description: string;              // Descripción detallada
}
```

## 🎓 **Estados Universitarios Disponibles**

| Estado | Descripción |
|--------|-------------|
| `en_curso` | Actualmente cursando estudios |
| `graduado` | Estudios completados exitosamente |
| `pausado` | Estudios temporalmente suspendidos |
| `abandonado` | Estudios abandonados |

## 📱 **Implementación en el Frontend**

### **1. Hook React para Educación**
```typescript
import { useState, useEffect } from 'react';

interface EducationHistoryItem {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string | null;
  status: string;
  gpa: number;
  achievements: string[];
}

interface AcademicAchievement {
  title: string;
  date: string;
  description: string;
}

interface Education {
  level: string;
  currentInstitution: string;
  graduationYear: number;
  isStudying: boolean;
  educationHistory: EducationHistoryItem[];
  currentDegree: string;
  universityName: string;
  universityStartDate: string;
  universityEndDate: string | null;
  universityStatus: string;
  gpa: number;
  academicAchievements: AcademicAchievement[];
}

export const useEducation = (token: string) => {
  const [education, setEducation] = useState<Education | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEducation = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/cv', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error fetching education');
      }

      const data = await response.json();
      setEducation(data.education);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateEducation = async (educationData: Education) => {
    try {
      const response = await fetch('http://localhost:3001/api/cv', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cvData: {
            education: educationData
          }
        })
      });

      if (!response.ok) {
        throw new Error('Error updating education');
      }

      await fetchEducation(); // Recargar datos
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    if (token) {
      fetchEducation();
    }
  }, [token]);

  return { 
    education, 
    loading, 
    error, 
    updateEducation, 
    refetch: fetchEducation 
  };
};
```

### **2. Componente de Edición de Educación**
```typescript
import React, { useState } from 'react';
import { useEducation } from '../hooks/useEducation';

interface EducationEditorProps {
  token: string;
}

export const EducationEditor: React.FC<EducationEditorProps> = ({ token }) => {
  const { education, loading, error, updateEducation } = useEducation(token);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    level: '',
    currentInstitution: '',
    graduationYear: 0,
    isStudying: false,
    currentDegree: '',
    universityName: '',
    universityStartDate: '',
    universityEndDate: '',
    universityStatus: 'en_curso',
    gpa: 0,
    educationHistory: [],
    academicAchievements: []
  });

  const handleSave = async () => {
    await updateEducation(formData);
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (education) {
      setFormData(education);
    }
    setIsEditing(true);
  };

  const addEducationHistory = () => {
    const newHistory = {
      institution: '',
      degree: '',
      startDate: '',
      endDate: '',
      status: 'graduado',
      gpa: 0,
      achievements: []
    };
    setFormData({
      ...formData,
      educationHistory: [...formData.educationHistory, newHistory]
    });
  };

  const addAcademicAchievement = () => {
    const newAchievement = {
      title: '',
      date: '',
      description: ''
    };
    setFormData({
      ...formData,
      academicAchievements: [...formData.academicAchievements, newAchievement]
    });
  };

  if (loading) return <div>Cargando educación...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!education) return <div>No se encontró información de educación</div>;

  return (
    <div className="education-editor">
      <div className="header">
        <h2>Educación</h2>
        <button onClick={isEditing ? handleSave : handleEdit}>
          {isEditing ? 'Guardar' : 'Editar'}
        </button>
      </div>

      {isEditing ? (
        <div className="edit-form">
          {/* Información básica */}
          <div className="basic-info">
            <h3>Información Básica</h3>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            >
              <option value="">Seleccionar nivel</option>
              <option value="PRIMARY">Primaria</option>
              <option value="SECONDARY">Secundaria</option>
              <option value="UNIVERSITY">Universidad</option>
              <option value="TECHNICAL">Técnico</option>
            </select>

            <input
              type="text"
              placeholder="Institución actual"
              value={formData.currentInstitution}
              onChange={(e) => setFormData({ ...formData, currentInstitution: e.target.value })}
            />

            <input
              type="number"
              placeholder="Año de graduación"
              value={formData.graduationYear}
              onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) })}
            />

            <label>
              <input
                type="checkbox"
                checked={formData.isStudying}
                onChange={(e) => setFormData({ ...formData, isStudying: e.target.checked })}
              />
              Actualmente estudiando
            </label>
          </div>

          {/* Información universitaria */}
          <div className="university-info">
            <h3>Información Universitaria</h3>
            <input
              type="text"
              placeholder="Grado actual"
              value={formData.currentDegree}
              onChange={(e) => setFormData({ ...formData, currentDegree: e.target.value })}
            />

            <input
              type="text"
              placeholder="Nombre de la universidad"
              value={formData.universityName}
              onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
            />

            <input
              type="date"
              placeholder="Fecha de inicio"
              value={formData.universityStartDate}
              onChange={(e) => setFormData({ ...formData, universityStartDate: e.target.value })}
            />

            <input
              type="date"
              placeholder="Fecha de fin"
              value={formData.universityEndDate}
              onChange={(e) => setFormData({ ...formData, universityEndDate: e.target.value })}
            />

            <select
              value={formData.universityStatus}
              onChange={(e) => setFormData({ ...formData, universityStatus: e.target.value })}
            >
              <option value="en_curso">En curso</option>
              <option value="graduado">Graduado</option>
              <option value="pausado">Pausado</option>
              <option value="abandonado">Abandonado</option>
            </select>

            <input
              type="number"
              step="0.1"
              placeholder="GPA"
              value={formData.gpa}
              onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) })}
            />
          </div>

          {/* Historial educativo */}
          <div className="education-history">
            <h3>Historial Educativo</h3>
            <button onClick={addEducationHistory}>Agregar Institución</button>
            
            {formData.educationHistory.map((item, index) => (
              <div key={index} className="history-item">
                <input
                  type="text"
                  placeholder="Institución"
                  value={item.institution}
                  onChange={(e) => {
                    const newHistory = [...formData.educationHistory];
                    newHistory[index].institution = e.target.value;
                    setFormData({ ...formData, educationHistory: newHistory });
                  }}
                />
                <input
                  type="text"
                  placeholder="Grado"
                  value={item.degree}
                  onChange={(e) => {
                    const newHistory = [...formData.educationHistory];
                    newHistory[index].degree = e.target.value;
                    setFormData({ ...formData, educationHistory: newHistory });
                  }}
                />
                <input
                  type="date"
                  placeholder="Fecha inicio"
                  value={item.startDate}
                  onChange={(e) => {
                    const newHistory = [...formData.educationHistory];
                    newHistory[index].startDate = e.target.value;
                    setFormData({ ...formData, educationHistory: newHistory });
                  }}
                />
                <input
                  type="date"
                  placeholder="Fecha fin"
                  value={item.endDate}
                  onChange={(e) => {
                    const newHistory = [...formData.educationHistory];
                    newHistory[index].endDate = e.target.value;
                    setFormData({ ...formData, educationHistory: newHistory });
                  }}
                />
                <select
                  value={item.status}
                  onChange={(e) => {
                    const newHistory = [...formData.educationHistory];
                    newHistory[index].status = e.target.value;
                    setFormData({ ...formData, educationHistory: newHistory });
                  }}
                >
                  <option value="graduado">Graduado</option>
                  <option value="en_curso">En curso</option>
                  <option value="pausado">Pausado</option>
                  <option value="abandonado">Abandonado</option>
                </select>
                <input
                  type="number"
                  step="0.1"
                  placeholder="GPA"
                  value={item.gpa}
                  onChange={(e) => {
                    const newHistory = [...formData.educationHistory];
                    newHistory[index].gpa = parseFloat(e.target.value);
                    setFormData({ ...formData, educationHistory: newHistory });
                  }}
                />
              </div>
            ))}
          </div>

          {/* Logros académicos */}
          <div className="academic-achievements">
            <h3>Logros Académicos</h3>
            <button onClick={addAcademicAchievement}>Agregar Logro</button>
            
            {formData.academicAchievements.map((achievement, index) => (
              <div key={index} className="achievement-item">
                <input
                  type="text"
                  placeholder="Título del logro"
                  value={achievement.title}
                  onChange={(e) => {
                    const newAchievements = [...formData.academicAchievements];
                    newAchievements[index].title = e.target.value;
                    setFormData({ ...formData, academicAchievements: newAchievements });
                  }}
                />
                <input
                  type="text"
                  placeholder="Fecha"
                  value={achievement.date}
                  onChange={(e) => {
                    const newAchievements = [...formData.academicAchievements];
                    newAchievements[index].date = e.target.value;
                    setFormData({ ...formData, academicAchievements: newAchievements });
                  }}
                />
                <textarea
                  placeholder="Descripción"
                  value={achievement.description}
                  onChange={(e) => {
                    const newAchievements = [...formData.academicAchievements];
                    newAchievements[index].description = e.target.value;
                    setFormData({ ...formData, academicAchievements: newAchievements });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="preview">
          {/* Preview de la educación */}
          <div className="education-preview">
            <h3>Información Educativa</h3>
            <p><strong>Nivel:</strong> {education.level}</p>
            <p><strong>Institución actual:</strong> {education.currentInstitution}</p>
            <p><strong>Grado actual:</strong> {education.currentDegree}</p>
            <p><strong>Universidad:</strong> {education.universityName}</p>
            <p><strong>Estado:</strong> {education.universityStatus}</p>
            <p><strong>GPA:</strong> {education.gpa}</p>
            <p><strong>Estudiando:</strong> {education.isStudying ? 'Sí' : 'No'}</p>
            
            <h4>Historial Educativo</h4>
            {education.educationHistory.map((item, index) => (
              <div key={index} className="history-item">
                <p><strong>{item.institution}</strong> - {item.degree}</p>
                <p>{item.startDate} - {item.endDate || 'En curso'}</p>
                <p>Estado: {item.status} | GPA: {item.gpa}</p>
              </div>
            ))}
            
            <h4>Logros Académicos</h4>
            {education.academicAchievements.map((achievement, index) => (
              <div key={index} className="achievement-item">
                <p><strong>{achievement.title}</strong> ({achievement.date})</p>
                <p>{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

## 🎯 **Ejemplos de Uso**

### **1. Obtener Educación**
```javascript
const response = await fetch('http://localhost:3001/api/cv', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const cvData = await response.json();
console.log(cvData.education);
```

### **2. Actualizar Educación**
```javascript
const educationData = {
  level: "UNIVERSITY",
  currentInstitution: "Universidad Mayor de San Simón",
  graduationYear: 2025,
  isStudying: true,
  currentDegree: "Ingeniería en Sistemas",
  universityName: "Universidad Mayor de San Simón",
  universityStartDate: "2021-02-01",
  universityEndDate: null,
  universityStatus: "en_curso",
  gpa: 78.2,
  educationHistory: [
    {
      institution: "Colegio San Agustín",
      degree: "Bachiller en Humanidades",
      startDate: "2015-02-01",
      endDate: "2020-11-30",
      status: "graduado",
      gpa: 85.5,
      achievements: ["Primer lugar en Olimpiadas de Matemáticas"]
    }
  ],
  academicAchievements: [
    {
      title: "Beca de Excelencia Académica",
      date: "2022",
      description: "Beca otorgada por mantener un promedio superior a 75 puntos"
    }
  ]
};

const response = await fetch('http://localhost:3001/api/cv', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    cvData: {
      education: educationData
    }
  })
});
```

## 🔧 **Base de Datos**

### **Campos Agregados al Modelo Profile**
```prisma
model Profile {
  // ... otros campos ...
  
  // Educación detallada
  educationHistory       Json?              @map("education_history")
  currentDegree          String?            @map("current_degree")
  universityName         String?            @map("university_name")
  universityStartDate    DateTime?          @map("university_start_date")
  universityEndDate      DateTime?          @map("university_end_date")
  universityStatus       String?            @map("university_status")
  gpa                    Float?
  academicAchievements   Json?              @map("academic_achievements")
}
```

### **Migración Aplicada**
```sql
-- Migración: add_detailed_education_fields
ALTER TABLE profiles ADD COLUMN education_history JSONB;
ALTER TABLE profiles ADD COLUMN current_degree TEXT;
ALTER TABLE profiles ADD COLUMN university_name TEXT;
ALTER TABLE profiles ADD COLUMN university_start_date TIMESTAMP;
ALTER TABLE profiles ADD COLUMN university_end_date TIMESTAMP;
ALTER TABLE profiles ADD COLUMN university_status TEXT;
ALTER TABLE profiles ADD COLUMN gpa FLOAT;
ALTER TABLE profiles ADD COLUMN academic_achievements JSONB;
```

## ✅ **Estado Actual**

- ✅ **Base de datos**: Campos agregados y migración aplicada
- ✅ **Backend**: Endpoints actualizados para manejar todos los campos
- ✅ **Validación**: Campos requeridos validados
- ✅ **Datos de ejemplo**: Agregados al usuario joven
- ✅ **Documentación**: Completa

## 🚀 **Próximos Pasos**

1. **Implementar en el frontend** usando los ejemplos
2. **Crear formularios dinámicos** para historial educativo
3. **Agregar validaciones** específicas para fechas y GPA
4. **Implementar exportación** de educación a PDF

¡La funcionalidad de educación detallada está completamente implementada! 🎓
