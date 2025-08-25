# 🚀 Configuración de Avatares de Perfil con MinIO

## 📋 **Resumen de Cambios**

El sistema ha sido configurado para usar **solo MinIO** para la subida de fotos de perfil de usuarios jóvenes, empresas y municipios.

---

## 🔧 **Cambios Realizados**

### **1. Controlador de Perfiles Actualizado**
- ✅ **`controllers/ProfileController.ts`** modificado para usar MinIO
- ✅ **Tipos TypeScript** agregados para `uploadedImages`
- ✅ **URLs de MinIO** en lugar de rutas locales

### **2. Middleware Configurado**
- ✅ **`middleware/minioUpload.ts`** ya estaba configurado
- ✅ **`routes/profile.ts`** usando `uploadImageToMinIO`
- ✅ **Validación de archivos** y límites configurados

### **3. Scripts de Prueba Creados**
- ✅ **`scripts/test-profile-avatar-minio.js`** - Prueba específica para MinIO
- ✅ **`scripts/check-minio-config.js`** - Verificación de configuración

---

## 🎯 **Cómo Usar Solo MinIO**

### **1. Verificar Configuración de MinIO**

```bash
# Verificar que MinIO esté funcionando
node scripts/check-minio-config.js

# Crear buckets faltantes si es necesario
node scripts/check-minio-config.js --create-buckets
```

### **2. Probar Subida de Avatares**

```bash
# 1. Obtener un token de autenticación
node scripts/generate-token.js

# 2. Editar el script de prueba con tu token
# En scripts/test-profile-avatar-minio.js, cambiar:
# const TOKEN = 'YOUR_TOKEN_HERE'; por tu token real

# 3. Ejecutar la prueba
node scripts/test-profile-avatar-minio.js
```

### **3. Endpoints Disponibles**

#### **Actualizar Solo Avatar**
```http
PUT /api/profiles/:id/avatar
Content-Type: multipart/form-data
Authorization: Bearer YOUR_TOKEN

Form Data:
- avatar: [archivo de imagen]
```

#### **Actualizar Perfil Completo con Avatar**
```http
PUT /api/profiles/:id
Content-Type: multipart/form-data
Authorization: Bearer YOUR_TOKEN

Form Data:
- firstName: "Juan"
- lastName: "Pérez"
- email: "juan@example.com"
- avatar: [archivo de imagen]
```

---

## 📊 **Especificaciones Técnicas**

### **Almacenamiento**
- **Sistema**: MinIO (Railway)
- **Bucket**: `images`
- **URLs**: `https://bucket-production-1a58.up.railway.app/images/avatar-[timestamp]-[random].jpg`

### **Límites de Archivo**
- **Tamaño máximo**: 5MB
- **Formatos permitidos**: JPEG, PNG, GIF, WebP
- **Validación**: Tipo MIME y tamaño en servidor y cliente

### **Nombres de Archivo**
```typescript
// Formato: avatar-[timestamp]-[random].[extension]
// Ejemplo: avatar-1755617641072-381916032.jpg
const objectName = `avatar-${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
```

---

## 🔄 **Flujo de Subida**

### **1. Cliente Envía Archivo**
```typescript
const formData = new FormData();
formData.append('avatar', file);

const response = await fetch('/api/profiles/123/avatar', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### **2. Middleware Procesa Archivo**
```typescript
// uploadImageToMinIO middleware:
// - Valida tipo y tamaño
// - Sube a MinIO
// - Genera URL pública
// - Agrega a req.uploadedImages
```

### **3. Controlador Actualiza Base de Datos**
```typescript
// ProfileController.updateProfileAvatar:
// - Verifica permisos
// - Usa URL de MinIO
// - Actualiza campo avatarUrl
// - Emite evento en tiempo real
```

---

## 🎨 **Frontend Integration**

### **Componente de Subida**
```typescript
const AvatarUpload = ({ profileId, onAvatarUpdate }) => {
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`/api/profiles/${profileId}/avatar`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const result = await response.json();
    onAvatarUpdate(result.profile.avatarUrl); // URL de MinIO
  };
};
```

### **Mostrar Avatar**
```typescript
// La URL de MinIO es directamente accesible
<img 
  src={profile.avatarUrl} 
  alt="Avatar" 
  className="avatar-image"
/>
```

---

## 🛠️ **Troubleshooting**

### **Error: "No avatar file uploaded"**
- ✅ Verificar que el campo se llame `avatar`
- ✅ Verificar que el archivo sea una imagen válida
- ✅ Verificar que el archivo no exceda 5MB

### **Error: "Access denied"**
- ✅ Verificar que el token sea válido
- ✅ Verificar que el usuario esté actualizando su propio perfil
- ✅ Verificar permisos de usuario

### **Error: "MinIO connection failed"**
- ✅ Ejecutar `node scripts/check-minio-config.js`
- ✅ Verificar credenciales de MinIO
- ✅ Verificar conectividad de red

### **Error: "Bucket does not exist"**
```bash
# Crear bucket faltante
node scripts/check-minio-config.js --create-buckets
```

---

## 📈 **Ventajas de Usar Solo MinIO**

### **✅ Escalabilidad**
- **Almacenamiento distribuido** en la nube
- **Sin límites de espacio** en el servidor local
- **CDN automático** para mejor rendimiento

### **✅ Confiabilidad**
- **Backup automático** en Railway
- **Alta disponibilidad** 24/7
- **Sin dependencia** del sistema de archivos local

### **✅ Mantenimiento**
- **Sin gestión** de directorios locales
- **Limpieza automática** de archivos temporales
- **Monitoreo centralizado** de uso

### **✅ URLs Públicas**
- **Acceso directo** sin autenticación
- **Caché del navegador** optimizado
- **Compartir fácil** de imágenes

---

## 🎯 **Resumen**

**El sistema ahora usa exclusivamente MinIO para la subida de avatares:**

1. ✅ **Configuración completa** implementada
2. ✅ **Scripts de prueba** disponibles
3. ✅ **Documentación** detallada
4. ✅ **Troubleshooting** cubierto
5. ✅ **Frontend integration** explicada

**Para usar el sistema:**
1. Verificar MinIO: `node scripts/check-minio-config.js`
2. Probar subida: `node scripts/test-profile-avatar-minio.js`
3. Integrar en frontend usando las URLs de MinIO

**¡El sistema está listo para producción con MinIO!** 🚀
