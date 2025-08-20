# Sistema de Recursos de Lecciones con MinIO

## Descripción General

El sistema de recursos de lecciones ahora utiliza MinIO para el almacenamiento de archivos, proporcionando una solución escalable y robusta para la gestión de documentos, videos, audios y otros recursos educativos.

## Características Principales

### ✅ Funcionalidades Implementadas

1. **Subida de archivos a MinIO**
   - Almacenamiento en bucket `resources`
   - Soporte para múltiples tipos de archivo
   - Generación automática de URLs públicas

2. **Tipos de archivo soportados**
   - **Documentos**: PDF, DOC, DOCX, XLS, XLSX
   - **Archivos comprimidos**: ZIP, RAR
   - **Videos**: MP4, WebM, OGG
   - **Audio**: MP3, WAV, OGG
   - **Imágenes**: JPEG, PNG, GIF
   - **Texto**: TXT

3. **Gestión completa de recursos**
   - Crear recursos con archivos
   - Actualizar recursos existentes
   - Eliminar recursos (incluye eliminación de archivos de MinIO)
   - Listar recursos por lección

4. **Validaciones y seguridad**
   - Autenticación requerida
   - Autorización por roles (solo organizaciones)
   - Validación de tipos de archivo
   - Límite de tamaño (50MB por archivo)

## Estructura de Archivos

### Middleware
- `middleware/minioUpload.ts` - Middleware para subida a MinIO
- `middleware/upload.ts` - Middleware legacy (mantenido para compatibilidad)

### Controladores
- `controllers/LessonResourceController.ts` - Lógica de negocio

### Rutas
- `routes/lessonresource.ts` - Definición de endpoints

### Scripts de Prueba
- `scripts/test-lesson-resource-upload.js` - Script para probar la funcionalidad

## Endpoints Disponibles

### POST `/api/lessonresource`
**Crear un nuevo recurso de lección**

**Headers requeridos:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Campos del formulario:**
- `lessonId` (string, requerido) - ID de la lección
- `title` (string, requerido) - Título del recurso
- `description` (string, opcional) - Descripción del recurso
- `type` (string, requerido) - Tipo de recurso (PDF, DOCUMENT, VIDEO, etc.)
- `orderIndex` (number, opcional) - Orden de visualización
- `isDownloadable` (boolean, opcional) - Si se puede descargar
- `file` (file, opcional) - Archivo a subir
- `url` (string, opcional) - URL externa (para tipo LINK)

**Respuesta exitosa (201):**
```json
{
  "id": "cmexxxxxx",
  "lessonId": "cmej1za2v0001pasdqgruh7gw",
  "title": "Documento de prueba",
  "description": "Descripción del documento",
  "type": "PDF",
  "url": "http://127.0.0.1:9000/resources/lesson-resource-1755638694054-934132511.pdf",
  "filePath": "lesson-resource-1755638694054-934132511.pdf",
  "fileSize": 22617634,
  "orderIndex": 1,
  "isDownloadable": true,
  "createdAt": "2024-01-19T17:24:54.123Z",
  "uploadedFile": {
    "url": "http://127.0.0.1:9000/resources/lesson-resource-1755638694054-934132511.pdf",
    "filename": "lesson-resource-1755638694054-934132511.pdf",
    "originalName": "documento.pdf",
    "size": 22617634,
    "mimetype": "application/pdf"
  }
}
```

### PUT `/api/lessonresource/:id`
**Actualizar un recurso existente**

**Headers requeridos:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Campos del formulario (todos opcionales):**
- `title` (string) - Nuevo título
- `description` (string) - Nueva descripción
- `type` (string) - Nuevo tipo
- `orderIndex` (number) - Nuevo orden
- `isDownloadable` (boolean) - Nueva configuración de descarga
- `file` (file) - Nuevo archivo

### GET `/api/lessonresource`
**Listar recursos**

**Query parameters:**
- `lessonId` (opcional) - Filtrar por lección
- `type` (opcional) - Filtrar por tipo

### GET `/api/lessonresource/:id`
**Obtener un recurso específico**

### DELETE `/api/lessonresource/:id`
**Eliminar un recurso (solo SuperAdmin)**

## Configuración de MinIO

### Bucket `resources`
El bucket `resources` debe estar configurado en MinIO con las siguientes políticas:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": [
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::resources/*"
      ]
    }
  ]
}
```

### Variables de entorno requeridas
```env
MINIO_ENDPOINT=127.0.0.1
MINIO_PORT=9000
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_USE_SSL=false
```

## Flujo de Trabajo

### 1. Creación de Recurso
```
Frontend → FormData → uploadLessonResourceToMinIO → MinIO → Database → Response
```

### 2. Actualización de Recurso
```
Frontend → FormData → uploadLessonResourceToMinIO → MinIO → Database → Response
```

### 3. Eliminación de Recurso
```
Frontend → DELETE Request → Database → MinIO (delete file) → Response
```

## Manejo de Errores

### Errores comunes y soluciones

1. **Error de autenticación (401)**
   - Verificar que el token JWT sea válido
   - Verificar que el usuario tenga permisos de organización

2. **Error de autorización (403)**
   - Verificar que el usuario tenga rol de organización
   - Roles permitidos: `SUPERADMIN`, `COMPANIES`, `MUNICIPAL_GOVERNMENTS`, `TRAINING_CENTERS`, `NGOS_AND_FOUNDATIONS`

3. **Error de tipo de archivo**
   - Verificar que el archivo sea de un tipo permitido
   - Tipos soportados: PDF, DOC, DOCX, XLS, XLSX, ZIP, MP4, MP3, JPEG, PNG, etc.

4. **Error de tamaño de archivo**
   - Límite máximo: 50MB
   - Comprimir archivos grandes si es necesario

5. **Error de conexión con MinIO**
   - Verificar que MinIO esté ejecutándose
   - Verificar las credenciales de MinIO
   - Verificar la conectividad de red

## Scripts de Prueba

### Ejecutar prueba completa
```bash
node scripts/test-lesson-resource-upload.js
```

### Configurar para pruebas
1. Editar `scripts/test-lesson-resource-upload.js`
2. Reemplazar `YOUR_JWT_TOKEN_HERE` con un token válido
3. Reemplazar `lessonId` con un ID de lección válido
4. Ejecutar el script

## Logs y Debug

### Logs disponibles
- `📁 [DEBUG] Archivo recibido` - Información del archivo subido
- `📝 [DEBUG] Nombre del objeto generado` - Nombre del archivo en MinIO
- `☁️ [DEBUG] Subiendo archivo a MinIO` - Inicio de subida
- `✅ Archivo subido exitosamente` - Subida completada
- `📋 [DEBUG] req.uploadedResource configurado` - Información del archivo procesado

### Habilitar logs detallados
Los logs están habilitados por defecto. Para deshabilitarlos, comentar las líneas `console.log` en el middleware.

## Migración desde Almacenamiento Local

### Si tienes recursos existentes en almacenamiento local:

1. **Backup de datos**
   ```sql
   SELECT * FROM lesson_resources WHERE file_path LIKE '/uploads/resources/%';
   ```

2. **Migración manual**
   - Subir archivos existentes a MinIO
   - Actualizar URLs en la base de datos
   - Eliminar archivos locales

3. **Script de migración automática** (futuro)
   - Crear script que migre automáticamente archivos existentes

## Consideraciones de Rendimiento

### Optimizaciones implementadas
- Almacenamiento en memoria temporal para archivos
- Subida directa a MinIO sin almacenamiento local intermedio
- URLs públicas para acceso directo a archivos

### Recomendaciones
- Usar CDN para archivos muy accedidos
- Implementar cache para metadatos de recursos
- Considerar compresión de archivos grandes

## Seguridad

### Medidas implementadas
- Validación de tipos de archivo
- Límites de tamaño de archivo
- Autenticación y autorización
- Nombres de archivo únicos para evitar conflictos

### Recomendaciones adicionales
- Escanear archivos en busca de malware
- Implementar rate limiting
- Monitorear uso de almacenamiento

## Troubleshooting

### Problemas comunes

1. **Archivo no se sube a MinIO**
   - Verificar conectividad con MinIO
   - Verificar permisos del bucket
   - Revisar logs de error

2. **URL del archivo no funciona**
   - Verificar política del bucket
   - Verificar que el archivo existe en MinIO
   - Verificar configuración de MinIO

3. **Error de memoria**
   - Reducir límite de tamaño de archivo
   - Implementar streaming para archivos grandes

## Soporte

Para problemas o preguntas:
1. Revisar logs del servidor
2. Verificar configuración de MinIO
3. Probar con el script de prueba
4. Contactar al equipo de desarrollo
