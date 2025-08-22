# 🏆 Sistema de Certificados - Documentación Frontend

## 📋 **Resumen**

El sistema de certificados permite a los estudiantes obtener y descargar certificados tanto por completar módulos individuales como por completar cursos completos. Los certificados se filtran automáticamente por el usuario autenticado.

---

## 🎯 **Endpoints Principales**

### **1. Certificados de Cursos Completos**
```http
GET /api/certificate
Authorization: Bearer YOUR_JWT_TOKEN
```

### **2. Certificados de Módulos**
```http
GET /api/modulecertificate
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📊 **Respuestas de la API**

### **Certificados de Cursos Completos**
```json
[
  {
    "id": "cert_123",
    "userId": "user_456",
    "courseId": "course_789",
    "template": "default",
    "issuedAt": "2024-01-15T10:00:00Z",
    "verificationCode": "CERT-2024-001",
    "digitalSignature": "sha256-signature",
    "isValid": true,
    "url": "https://minio.example.com/certificates/course-cert-123.pdf",
    "course": {
      "id": "course_789",
      "title": "Desarrollo Web Completo",
      "description": "Aprende HTML, CSS y JavaScript"
    },
    "user": {
      "id": "user_456",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan@example.com"
    }
  }
]
```

### **Certificados de Módulos**
```json
[
  {
    "id": "module_cert_123",
    "moduleId": "module_456",
    "studentId": "user_789",
    "certificateUrl": "https://minio.example.com/certificates/module-cert-123.pdf",
    "issuedAt": "2024-01-15T10:00:00Z",
    "grade": 95,
    "completedAt": "2024-01-15T09:45:00Z",
    "module": {
      "id": "module_456",
      "title": "Fundamentos de JavaScript",
      "course": {
        "id": "course_123",
        "title": "Desarrollo Web Completo"
      }
    },
    "student": {
      "id": "user_789",
      "firstName": "María",
      "lastName": "García",
      "email": "maria@example.com"
    }
  }
]
```

---

## 🔧 **Implementación en el Frontend**

### **1. Componente Principal de Certificados**
```typescript
interface CourseCertificate {
  id: string;
  userId: string;
  courseId: string;
  template: string;
  issuedAt: string;
  verificationCode: string;
  digitalSignature: string;
  isValid: boolean;
  url: string;
  course: {
    id: string;
    title: string;
    description: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ModuleCertificate {
  id: string;
  moduleId: string;
  studentId: string;
  certificateUrl: string;
  issuedAt: string;
  grade: number;
  completedAt: string;
  module: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
    };
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const CertificatesPage = () => {
  const [courseCertificates, setCourseCertificates] = useState<CourseCertificate[]>([]);
  const [moduleCertificates, setModuleCertificates] = useState<ModuleCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar certificados de cursos completos
      const courseResponse = await fetch('/api/certificate', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!courseResponse.ok) {
        throw new Error(`Error al cargar certificados de cursos: ${courseResponse.status}`);
      }

      const courseData = await courseResponse.json();
      setCourseCertificates(courseData);

      // Cargar certificados de módulos
      const moduleResponse = await fetch('/api/modulecertificate', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!moduleResponse.ok) {
        throw new Error(`Error al cargar certificados de módulos: ${moduleResponse.status}`);
      }

      const moduleData = await moduleResponse.json();
      setModuleCertificates(moduleData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error cargando certificados:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (certificate: CourseCertificate | ModuleCertificate) => {
    try {
      const url = 'url' in certificate ? certificate.url : certificate.certificateUrl;
      
      if (!url) {
        alert('No hay URL de descarga disponible para este certificado');
        return;
      }

      // Descargar el PDF
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Crear enlace de descarga
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Nombre del archivo
      let fileName = '';
      if ('course' in certificate) {
        fileName = `certificado-curso-${certificate.course.title}.pdf`;
      } else {
        fileName = `certificado-modulo-${certificate.module.title}.pdf`;
      }
      
      link.download = fileName;
      link.click();
      
      // Limpiar
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (error) {
      console.error('Error descargando certificado:', error);
      alert('Error al descargar el certificado');
    }
  };

  if (loading) {
    return (
      <div className="certificates-loading">
        <div className="spinner"></div>
        <p>Cargando certificados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="certificates-error">
        <h2>Error al cargar certificados</h2>
        <p>{error}</p>
        <button onClick={loadCertificates} className="retry-button">
          Reintentar
        </button>
      </div>
    );
  }

  const totalCertificates = courseCertificates.length + moduleCertificates.length;

  return (
    <div className="certificates-page">
      <header className="certificates-header">
        <h1>🏆 Mis Certificados</h1>
        <p>{totalCertificates} certificados obtenidos</p>
      </header>

      {/* Certificados de Cursos Completos */}
      {courseCertificates.length > 0 && (
        <section className="certificates-section">
          <h2>📚 Certificados de Cursos Completos</h2>
          <div className="certificates-grid">
            {courseCertificates.map(cert => (
              <div key={cert.id} className="certificate-card course-certificate">
                <div className="certificate-icon">🎓</div>
                <h3>{cert.course.title}</h3>
                <p className="certificate-description">{cert.course.description}</p>
                <div className="certificate-details">
                  <p><strong>Emitido:</strong> {new Date(cert.issuedAt).toLocaleDateString()}</p>
                  <p><strong>Código:</strong> {cert.verificationCode}</p>
                  <p><strong>Estado:</strong> {cert.isValid ? '✅ Válido' : '❌ Inválido'}</p>
                </div>
                <button 
                  onClick={() => downloadCertificate(cert)}
                  className="download-button"
                >
                  📥 Descargar Certificado
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certificados de Módulos */}
      {moduleCertificates.length > 0 && (
        <section className="certificates-section">
          <h2>📜 Certificados de Módulos</h2>
          <div className="certificates-grid">
            {moduleCertificates.map(cert => (
              <div key={cert.id} className="certificate-card module-certificate">
                <div className="certificate-icon">📋</div>
                <h3>{cert.module.title}</h3>
                <p className="certificate-course">Curso: {cert.module.course.title}</p>
                <div className="certificate-details">
                  <p><strong>Calificación:</strong> {cert.grade}%</p>
                  <p><strong>Completado:</strong> {new Date(cert.completedAt).toLocaleDateString()}</p>
                  <p><strong>Emitido:</strong> {new Date(cert.issuedAt).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => downloadCertificate(cert)}
                  className="download-button"
                >
                  📥 Descargar Certificado
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Estado vacío */}
      {totalCertificates === 0 && (
        <div className="certificates-empty">
          <div className="empty-icon">📭</div>
          <h2>No tienes certificados aún</h2>
          <p>Completa cursos y módulos para obtener tus primeros certificados</p>
        </div>
      )}
    </div>
  );
};
```

### **2. Estilos CSS**
```css
.certificates-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.certificates-header {
  text-align: center;
  margin-bottom: 40px;
}

.certificates-header h1 {
  color: #333;
  margin-bottom: 10px;
}

.certificates-section {
  margin-bottom: 40px;
}

.certificates-section h2 {
  color: #555;
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.certificates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.certificate-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.certificate-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.certificate-icon {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 16px;
}

.certificate-card h3 {
  color: #333;
  margin-bottom: 8px;
  font-size: 1.2rem;
}

.certificate-description,
.certificate-course {
  color: #666;
  margin-bottom: 16px;
  font-size: 0.9rem;
}

.certificate-details {
  margin-bottom: 20px;
}

.certificate-details p {
  margin-bottom: 4px;
  font-size: 0.85rem;
  color: #555;
}

.download-button {
  width: 100%;
  background: #007bff;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.download-button:hover {
  background: #0056b3;
}

.certificates-loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.certificates-error {
  text-align: center;
  padding: 60px 20px;
  color: #dc3545;
}

.retry-button {
  background: #dc3545;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 16px;
}

.certificates-empty {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}
```

---

## 🔐 **Permisos y Seguridad**

### **Autenticación Requerida**
- Todos los endpoints requieren un token JWT válido
- El token debe incluirse en el header: `Authorization: Bearer YOUR_TOKEN`

### **Filtrado Automático**
- Los estudiantes solo ven sus propios certificados
- Los administradores pueden ver todos los certificados
- El filtrado se hace automáticamente basado en el `userId` del token

---

## 📱 **Uso en React/Next.js**

### **Hook Personalizado**
```typescript
import { useState, useEffect } from 'react';

interface UseCertificatesReturn {
  courseCertificates: CourseCertificate[];
  moduleCertificates: ModuleCertificate[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useCertificates = (): UseCertificatesReturn => {
  const [courseCertificates, setCourseCertificates] = useState<CourseCertificate[]>([]);
  const [moduleCertificates, setModuleCertificates] = useState<ModuleCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const [courseRes, moduleRes] = await Promise.all([
        fetch('/api/certificate', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/modulecertificate', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!courseRes.ok) throw new Error(`Error cursos: ${courseRes.status}`);
      if (!moduleRes.ok) throw new Error(`Error módulos: ${moduleRes.status}`);

      const [courseData, moduleData] = await Promise.all([
        courseRes.json(),
        moduleRes.json()
      ]);

      setCourseCertificates(courseData);
      setModuleCertificates(moduleData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  return {
    courseCertificates,
    moduleCertificates,
    loading,
    error,
    refetch: fetchCertificates
  };
};
```

---

## 🎯 **Resumen de Endpoints**

| Tipo | Endpoint | Método | Descripción |
|------|----------|--------|-------------|
| **Cursos** | `/api/certificate` | GET | Listar certificados de cursos completos |
| **Cursos** | `/api/certificate/:id` | GET | Obtener certificado específico de curso |
| **Módulos** | `/api/modulecertificate` | GET | Listar certificados de módulos |
| **Módulos** | `/api/modulecertificate/:id` | GET | Obtener certificado específico de módulo |

---

## 🚀 **Pruebas**

### **Script de Prueba**
```bash
# Crear certificados de prueba
node scripts/create-test-certificates.js

# Probar endpoints
node scripts/test-certificates.js
```

**¡Con esta implementación, el frontend podrá mostrar y descargar todos los certificados del usuario autenticado!**
