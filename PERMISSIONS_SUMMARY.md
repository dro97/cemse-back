# 🔐 Resumen de Permisos - Sistema de Cursos Tipo Platzi

## 👥 Roles y Permisos

### 🎓 **Creación y Gestión de Cursos**

#### ✅ **Pueden Crear/Editar Cursos:**
- **SUPERADMIN** - Acceso completo
- **COMPANIES** - Empresas
- **MUNICIPAL_GOVERNMENTS** - Gobiernos municipales
- **TRAINING_CENTERS** - Centros de entrenamiento
- **NGOS_AND_FOUNDATIONS** - ONGs y fundaciones
- **Municipios** (`type: 'municipality'`) - Entidades municipales

#### 🗑️ **Pueden Eliminar Cursos:**
- **SUPERADMIN** únicamente

---

### 📚 **Recursos de Lecciones**

#### ✅ **Pueden Crear/Editar Recursos:**
- **SUPERADMIN**
- **COMPANIES**
- **MUNICIPAL_GOVERNMENTS**
- **TRAINING_CENTERS**
- **NGOS_AND_FOUNDATIONS**

#### 🗑️ **Pueden Eliminar Recursos:**
- **SUPERADMIN** únicamente

---

### 🏆 **Certificados de Módulos**

#### ✅ **Pueden Crear/Editar Certificados:**
- **SUPERADMIN**
- **COMPANIES**
- **MUNICIPAL_GOVERNMENTS**
- **TRAINING_CENTERS**
- **NGOS_AND_FOUNDATIONS**

#### 🗑️ **Pueden Eliminar Certificados:**
- **SUPERADMIN** únicamente

---

### 📊 **Progreso de Estudiantes**

#### ✅ **Pueden Ver Progreso:**
- **Estudiantes** - Solo su propio progreso
- **SUPERADMIN** - Progreso de todos los estudiantes
- **Organizaciones** - Progreso de sus estudiantes

#### ✅ **Pueden Actualizar Progreso:**
- **Estudiantes** - Su propio progreso
- **SUPERADMIN** - Progreso de cualquier estudiante

---

### 👀 **Visualización de Cursos**

#### ✅ **Pueden Ver Cursos:**
- **Todos los usuarios autenticados** pueden ver cursos públicos
- **Estudiantes inscritos** pueden ver contenido completo
- **Instructores** pueden ver sus propios cursos

---

## 🔧 **Middleware Utilizados**

### `requireCourseCreation`
```javascript
// Permite: SUPERADMIN, Organizaciones, Municipios
const requireCourseCreation = (req, res, next) => {
  // SUPERADMIN
  if (user.role === 'SUPERADMIN') return next();
  
  // Organizaciones
  if (['COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user.role)) return next();
  
  // Municipios
  if (user.type === 'municipality') return next();
  
  return res.status(403).json({ message: "Access denied" });
};
```

### `requireOrganization`
```javascript
// Permite: SUPERADMIN + Organizaciones
export const requireOrganization = requireRole([
  UserRole.COMPANIES,
  UserRole.MUNICIPAL_GOVERNMENTS,
  UserRole.TRAINING_CENTERS,
  UserRole.NGOS_AND_FOUNDATIONS,
  UserRole.SUPERADMIN
]);
```

### `requireSuperAdmin`
```javascript
// Permite: Solo SUPERADMIN
export const requireSuperAdmin = requireRole([UserRole.SUPERADMIN]);
```

---

## 📋 **Resumen de Endpoints por Permisos**

### 🎓 **Cursos**
- `GET /api/course` - **Todos los usuarios autenticados**
- `GET /api/course/:id` - **Todos los usuarios autenticados**
- `POST /api/course` - **SUPERADMIN + Organizaciones + Municipios**
- `PUT /api/course/:id` - **SUPERADMIN + Organizaciones + Municipios**
- `DELETE /api/course/:id` - **SUPERADMIN únicamente**

### 📚 **Recursos**
- `GET /api/lessonresource` - **Todos los usuarios autenticados**
- `GET /api/lessonresource/:id` - **Todos los usuarios autenticados**
- `POST /api/lessonresource` - **SUPERADMIN + Organizaciones**
- `PUT /api/lessonresource/:id` - **SUPERADMIN + Organizaciones**
- `DELETE /api/lessonresource/:id` - **SUPERADMIN únicamente**

### 🏆 **Certificados**
- `GET /api/modulecertificate` - **Estudiantes (propios) + SUPERADMIN (todos)**
- `GET /api/modulecertificate/:id` - **Estudiantes (propios) + SUPERADMIN (todos)**
- `POST /api/modulecertificate` - **SUPERADMIN + Organizaciones**
- `PUT /api/modulecertificate/:id` - **SUPERADMIN + Organizaciones**
- `DELETE /api/modulecertificate/:id` - **SUPERADMIN únicamente**

### 📊 **Progreso**
- `GET /api/lessonprogress` - **Estudiantes (propios) + SUPERADMIN (todos)**
- `GET /api/lessonprogress/:id` - **Estudiantes (propios) + SUPERADMIN (todos)**
- `POST /api/lessonprogress` - **Estudiantes + SUPERADMIN**
- `PUT /api/lessonprogress/:id` - **Estudiantes + SUPERADMIN**
- `DELETE /api/lessonprogress/:id` - **Estudiantes + SUPERADMIN**

---

## ✅ **Verificación de Permisos**

El sistema está correctamente configurado para que:

1. **SUPERADMIN** tenga acceso completo a todas las funcionalidades
2. **Instituciones** (COMPANIES, MUNICIPAL_GOVERNMENTS, TRAINING_CENTERS, NGOS_AND_FOUNDATIONS) puedan:
   - Crear y editar cursos
   - Gestionar recursos de lecciones
   - Crear certificados de módulos
3. **Municipios** (`type: 'municipality'`) puedan crear y editar cursos
4. **Estudiantes** puedan ver y actualizar su propio progreso
5. **Todos los usuarios autenticados** puedan ver cursos públicos

¡Los permisos están correctamente configurados! 🎯
