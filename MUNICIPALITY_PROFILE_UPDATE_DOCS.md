# Documentación: Actualización de Perfil del Municipio

## 📋 Resumen

Se ha implementado la funcionalidad para que los municipios puedan editar su propio perfil directamente desde la API, sin necesidad de que un SuperAdmin lo haga por ellos.

## 🚀 Nuevas Funcionalidades

### 1. **Actualización de Perfil del Municipio**

**Endpoint:** `PUT /api/municipality/auth/update-profile`

**Autenticación:** Requerida (Token JWT del municipio)

**Descripción:** Permite al municipio actualizar su información de perfil.

## 📝 Campos Editables

### Campos Obligatorios:
- `name` (string) - Nombre del municipio
- `department` (string) - Departamento

### Campos Opcionales:
- `region` (string) - Región
- `population` (integer) - Población
- `mayorName` (string) - Nombre del alcalde
- `mayorEmail` (string) - Email del alcalde
- `mayorPhone` (string) - Teléfono del alcalde
- `address` (string) - Dirección
- `website` (string) - Sitio web
- `email` (string) - Email del municipio
- `phone` (string) - Teléfono del municipio
- `primaryColor` (string) - Color primario para branding
- `secondaryColor` (string) - Color secundario para branding
- `customType` (string) - Tipo personalizado de institución

## 🔧 Ejemplo de Uso

### 1. **Login del Municipio**

```bash
POST /api/municipality/auth/login
Content-Type: application/json

{
  "username": "municipio_test",
  "password": "password123"
}
```

### 2. **Actualizar Perfil**

```bash
PUT /api/municipality/auth/update-profile
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "name": "Municipio de Prueba Actualizado",
  "department": "Antioquia",
  "region": "Occidente",
  "population": 75000,
  "mayorName": "María González",
  "mayorEmail": "maria.gonzalez@municipio.com",
  "mayorPhone": "3001234567",
  "address": "Calle Principal #456, Centro",
  "website": "https://municipio-prueba.com",
  "email": "contacto@municipio-prueba.com",
  "phone": "6041234567",
  "primaryColor": "#1E40AF",
  "secondaryColor": "#F59E0B",
  "customType": "Municipio Turístico"
}
```

### 3. **Respuesta Exitosa**

```json
{
  "municipality": {
    "id": "clx1234567890",
    "name": "Municipio de Prueba Actualizado",
    "department": "Antioquia",
    "region": "Occidente",
    "population": 75000,
    "mayorName": "María González",
    "mayorEmail": "maria.gonzalez@municipio.com",
    "mayorPhone": "3001234567",
    "address": "Calle Principal #456, Centro",
    "website": "https://municipio-prueba.com",
    "isActive": true,
    "username": "municipio_test",
    "email": "contacto@municipio-prueba.com",
    "phone": "6041234567",
    "primaryColor": "#1E40AF",
    "secondaryColor": "#F59E0B",
    "customType": "Municipio Turístico",
    "institutionType": "MUNICIPALITY",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  },
  "message": "Municipality profile updated successfully"
}
```

## ✅ Validaciones Implementadas

### 1. **Validaciones de Campos Obligatorios**
- `name` y `department` son requeridos
- No se pueden enviar valores vacíos

### 2. **Validaciones de Unicidad**
- No puede existir otro municipio con el mismo nombre y departamento
- No puede existir otro municipio con el mismo email

### 3. **Validaciones de Formato**
- Los emails deben tener formato válido
- La población debe ser un número entero positivo

### 4. **Validaciones de Autenticación**
- Solo el municipio autenticado puede editar su propio perfil
- Se requiere token JWT válido

## ❌ Códigos de Error

### 400 - Bad Request
```json
{
  "message": "Name and department are required"
}
```

```json
{
  "message": "Invalid email format"
}
```

```json
{
  "message": "Population must be a positive integer"
}
```

```json
{
  "message": "A municipality with this name and department already exists"
}
```

### 401 - Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 404 - Not Found
```json
{
  "message": "Municipality not found"
}
```

## 🧪 Scripts de Prueba

### 1. **Crear Municipio de Prueba**

```bash
node scripts/create-test-municipality.js
```

Este script crea un municipio de prueba con las siguientes credenciales:
- **Username:** `municipio_test`
- **Password:** `password123`

### 2. **Probar Actualización de Perfil**

```bash
node scripts/test-municipality-profile-update.js
```

Este script prueba:
- Login del municipio
- Obtención del perfil actual
- Actualización del perfil
- Verificación de cambios
- Validaciones de datos

## 🔄 Flujo Completo de Uso

1. **Login del municipio** → Obtener token JWT
2. **Obtener perfil actual** → Ver información actual
3. **Actualizar perfil** → Enviar datos modificados
4. **Verificar cambios** → Confirmar que se aplicaron correctamente

## 🛡️ Seguridad

- **Autenticación requerida:** Solo municipios autenticados pueden editar su perfil
- **Validación de datos:** Todos los campos se validan antes de guardar
- **Prevención de duplicados:** Se verifica que no existan conflictos con otros municipios
- **Sanitización:** Los datos se limpian y validan antes de procesar

## 📊 Comparación con Funcionalidades Existentes

| Funcionalidad | SuperAdmin | Municipio |
|---------------|------------|-----------|
| Ver perfil | ✅ | ✅ |
| Editar perfil | ✅ | ✅ (NUEVO) |
| Cambiar contraseña | ✅ | ✅ |
| Crear municipio | ✅ | ❌ |
| Eliminar municipio | ✅ | ❌ |

## 🎯 Beneficios

1. **Autonomía:** Los municipios pueden gestionar su propia información
2. **Eficiencia:** No necesitan depender de SuperAdmin para cambios menores
3. **Actualización en tiempo real:** Los cambios se reflejan inmediatamente
4. **Validación robusta:** Previene errores y datos inconsistentes
5. **Seguridad:** Solo pueden editar su propio perfil

## 🔧 Configuración Técnica

### Archivos Modificados:
- `controllers/MunicipalityAuthController.ts` - Nueva función `updateMunicipalityProfile`
- `routes/municipalityAuth.ts` - Nueva ruta `PUT /update-profile`

### Dependencias:
- `bcrypt` - Para validación de contraseñas
- `jsonwebtoken` - Para autenticación
- `prisma` - Para operaciones de base de datos

## 📞 Soporte

Si encuentras algún problema o necesitas ayuda adicional:

1. Revisa los logs del servidor
2. Verifica que el municipio esté autenticado
3. Confirma que los datos enviados cumplan con las validaciones
4. Ejecuta los scripts de prueba para verificar la funcionalidad

---

**Fecha de implementación:** Enero 2024  
**Versión:** 1.0  
**Autor:** Sistema de API

