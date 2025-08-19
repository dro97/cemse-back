# 👤 Gestión de Avatares de Perfil - Frontend

## 🎯 **Funcionalidad Implementada**

### ✅ **Subida de Imágenes de Perfil**
- **Campo**: `avatar`
- **Formatos soportados**: JPEG, PNG, GIF, WebP
- **Límite**: 10MB
- **Almacenamiento**: `/uploads/profiles/`
- **URLs**: `http://localhost:3001/uploads/profiles/avatar-[timestamp].jpg`

---

## 🏢 **Para Instructores/Organizaciones**

### 📝 **Actualizar Avatar de Perfil**

#### **1. Componente de Subida de Avatar**
```typescript
interface AvatarUploadProps {
  profileId: string;
  currentAvatarUrl?: string;
  onAvatarUpdate: (newAvatarUrl: string) => void;
}

const AvatarUpload = ({ profileId, currentAvatarUrl, onAvatarUpdate }: AvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)');
        return;
      }

      // Validar tamaño (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo no puede exceder 10MB');
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`/api/profile/${profileId}/avatar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        onAvatarUpdate(result.profile.avatarUrl);
        setPreviewUrl(null);
        alert('Avatar actualizado exitosamente');
      } else {
        throw new Error('Error al actualizar avatar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar avatar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="avatar-upload">
      <div className="current-avatar">
        <img 
          src={previewUrl || currentAvatarUrl || '/default-avatar.png'} 
          alt="Avatar" 
          className="avatar-preview"
        />
      </div>

      <div className="upload-controls">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="btn-select-file"
        >
          Seleccionar Imagen
        </button>

        {previewUrl && (
          <button 
            onClick={handleUpload}
            disabled={isUploading}
            className="btn-upload"
          >
            {isUploading ? 'Subiendo...' : 'Actualizar Avatar'}
          </button>
        )}
      </div>

      <div className="upload-info">
        <p>Formatos permitidos: JPEG, PNG, GIF, WebP</p>
        <p>Tamaño máximo: 10MB</p>
      </div>
    </div>
  );
};
```

#### **2. Actualizar Perfil Completo con Avatar**
```typescript
const ProfileForm = ({ profile }: { profile: Profile }) => {
  const [formData, setFormData] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    // ... otros campos
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const formDataToSend = new FormData();
    
    // Agregar campos de texto
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    
    // Agregar avatar si se seleccionó uno nuevo
    if (avatarFile) {
      formDataToSend.append('avatar', avatarFile);
    }

    try {
      const response = await fetch(`/api/profile/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        alert('Perfil actualizado exitosamente');
      } else {
        throw new Error('Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar perfil');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <div className="avatar-section">
        <img 
          src={previewUrl || profile.avatarUrl || '/default-avatar.png'} 
          alt="Avatar" 
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setAvatarFile(file);
              const reader = new FileReader();
              reader.onload = (e) => setPreviewUrl(e.target?.result as string);
              reader.readAsDataURL(file);
            }
          }}
        />
      </div>

      <div className="form-fields">
        <input
          type="text"
          placeholder="Nombre"
          value={formData.firstName}
          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
        />
        
        <input
          type="text"
          placeholder="Apellido"
          value={formData.lastName}
          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
        />
        
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        
        {/* ... otros campos */}
      </div>

      <button type="submit" className="btn-save">
        Guardar Cambios
      </button>
    </form>
  );
};
```

### 🎨 **Estilos CSS**
```scss
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #f9f9f9;

  .current-avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid #fff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .upload-controls {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;

    button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;

      &.btn-select-file {
        background: #007bff;
        color: white;

        &:hover {
          background: #0056b3;
        }
      }

      &.btn-upload {
        background: #28a745;
        color: white;

        &:hover {
          background: #1e7e34;
        }

        &:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
      }
    }
  }

  .upload-info {
    text-align: center;
    color: #666;
    font-size: 0.9rem;

    p {
      margin: 0.25rem 0;
    }
  }
}

.profile-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;

  .avatar-section {
    text-align: center;
    margin-bottom: 2rem;

    img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #fff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      margin-bottom: 1rem;
    }

    input[type="file"] {
      display: block;
      margin: 0 auto;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
    }
  }

  .form-fields {
    display: grid;
    gap: 1rem;
    margin-bottom: 2rem;

    input, textarea, select {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;

      &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
      }
    }
  }

  .btn-save {
    width: 100%;
    padding: 1rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #0056b3;
    }
  }
}
```

---

## 👨‍🎓 **Para Estudiantes**

### 📱 **Vista de Perfil con Avatar**

#### **1. Componente de Perfil de Estudiante**
```typescript
const StudentProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch('/api/profile/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setProfile);
  }, []);

  if (!profile) return <Loading />;

  return (
    <div className="student-profile">
      <div className="profile-header">
        <div className="avatar-container">
          <img 
            src={profile.avatarUrl || '/default-avatar.png'} 
            alt={`${profile.firstName} ${profile.lastName}`}
            className="profile-avatar"
          />
          {isEditing && (
            <button 
              onClick={() => setIsEditing(false)}
              className="btn-edit-avatar"
            >
              ✏️
            </button>
          )}
        </div>

        <div className="profile-info">
          <h1>{profile.firstName} {profile.lastName}</h1>
          <p className="role">{profile.role}</p>
          <p className="email">{profile.email}</p>
        </div>

        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="btn-edit-profile"
        >
          {isEditing ? 'Cancelar' : 'Editar Perfil'}
        </button>
      </div>

      {isEditing ? (
        <ProfileForm 
          profile={profile} 
          onSave={(updatedProfile) => {
            setProfile(updatedProfile);
            setIsEditing(false);
          }}
        />
      ) : (
        <ProfileDetails profile={profile} />
      )}
    </div>
  );
};
```

#### **2. Componente de Detalles de Perfil**
```typescript
const ProfileDetails = ({ profile }: { profile: Profile }) => {
  return (
    <div className="profile-details">
      <div className="detail-section">
        <h3>Información Personal</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Nombre:</label>
            <span>{profile.firstName}</span>
          </div>
          <div className="detail-item">
            <label>Apellido:</label>
            <span>{profile.lastName}</span>
          </div>
          <div className="detail-item">
            <label>Email:</label>
            <span>{profile.email}</span>
          </div>
          <div className="detail-item">
            <label>Teléfono:</label>
            <span>{profile.phone || 'No especificado'}</span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3>Estadísticas</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">{profile.courseEnrollments?.length || 0}</span>
            <span className="stat-label">Cursos Inscritos</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{profile.certificates?.length || 0}</span>
            <span className="stat-label">Certificados</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{profile.profileCompletion}%</span>
            <span className="stat-label">Perfil Completo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 🎨 **Estilos para Perfil de Estudiante**
```scss
.student-profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;

  .profile-header {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 3rem;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);

    .avatar-container {
      position: relative;

      .profile-avatar {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid #fff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }

      .btn-edit-avatar {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid white;
        background: #007bff;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        transition: all 0.2s;

        &:hover {
          background: #0056b3;
          transform: scale(1.1);
        }
      }
    }

    .profile-info {
      flex: 1;

      h1 {
        margin: 0 0 0.5rem 0;
        color: #333;
        font-size: 2rem;
      }

      .role {
        color: #007bff;
        font-weight: 500;
        margin: 0 0 0.5rem 0;
        text-transform: capitalize;
      }

      .email {
        color: #666;
        margin: 0;
      }
    }

    .btn-edit-profile {
      padding: 0.75rem 1.5rem;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.2s;

      &:hover {
        background: #1e7e34;
      }
    }
  }

  .profile-details {
    .detail-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);

      h3 {
        margin: 0 0 1.5rem 0;
        color: #333;
        border-bottom: 2px solid #f0f0f0;
        padding-bottom: 0.5rem;
      }

      .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 6px;

          label {
            font-weight: 500;
            color: #666;
          }

          span {
            color: #333;
          }
        }
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;

        .stat-card {
          text-align: center;
          padding: 1.5rem;
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border-radius: 8px;

          .stat-number {
            display: block;
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
          }

          .stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
          }
        }
      }
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .student-profile {
    padding: 1rem;

    .profile-header {
      flex-direction: column;
      text-align: center;
      gap: 1rem;

      .profile-info {
        text-align: center;
      }
    }

    .profile-details {
      .detail-section {
        padding: 1rem;

        .detail-grid {
          grid-template-columns: 1fr;
        }

        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    }
  }
}
```

---

## 🔧 **Utilidades y Helpers**

### **1. Validación de Archivos**
```typescript
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Validar tipo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'
    };
  }

  // Validar tamaño (10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'El archivo no puede exceder 10MB'
    };
  }

  return { isValid: true };
};
```

### **2. Compresión de Imágenes**
```typescript
export const compressImage = (file: File, maxWidth = 800): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calcular nuevas dimensiones
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convertir a blob
      canvas.toBlob((blob) => {
        const compressedFile = new File([blob!], file.name, {
          type: file.type,
          lastModified: Date.now()
        });
        resolve(compressedFile);
      }, file.type, 0.8); // Calidad 80%
    };

    img.src = URL.createObjectURL(file);
  });
};
```

### **3. Hook Personalizado para Avatar**
```typescript
export const useAvatarUpload = (profileId: string) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAvatar = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setError(null);

    try {
      // Validar archivo
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Comprimir imagen si es necesario
      const compressedFile = await compressImage(file);

      // Subir archivo
      const formData = new FormData();
      formData.append('avatar', compressedFile);

      const response = await fetch(`/api/profile/${profileId}/avatar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al subir avatar');
      }

      const result = await response.json();
      return result.profile.avatarUrl;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadAvatar,
    isUploading,
    error
  };
};
```

---

## 🚀 **Características Avanzadas**

### **1. Crop de Imagen**
```typescript
const ImageCropper = ({ file, onCrop }: { file: File; onCrop: (croppedFile: File) => void }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [zoom, setZoom] = useState(1);

  return (
    <div className="image-cropper">
      <ReactCrop
        crop={crop}
        onChange={setCrop}
        zoom={zoom}
        aspect={1} // Cuadrado para avatar
      >
        <img src={URL.createObjectURL(file)} alt="Crop" />
      </ReactCrop>

      <div className="crop-controls">
        <label>
          Zoom:
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </label>

        <button onClick={() => {
          // Lógica para recortar imagen
          const croppedFile = cropImage(file, crop);
          onCrop(croppedFile);
        }}>
          Recortar y Guardar
        </button>
      </div>
    </div>
  );
};
```

### **2. Drag & Drop**
```typescript
const DragDropAvatar = ({ onFileSelect }: { onFileSelect: (file: File) => void }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      onFileSelect(imageFile);
    }
  };

  return (
    <div
      className={`drag-drop-zone ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="drag-content">
        <i className="fas fa-cloud-upload-alt"></i>
        <p>Arrastra una imagen aquí o haz clic para seleccionar</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
        />
      </div>
    </div>
  );
};
```

---

## 📱 **Responsive Design**

### **1. Breakpoints para Avatar**
```scss
.avatar-upload {
  // Mobile
  @media (max-width: 480px) {
    padding: 1rem;
    
    .current-avatar {
      width: 80px;
      height: 80px;
    }
    
    .upload-controls {
      flex-direction: column;
      
      button {
        width: 100%;
      }
    }
  }

  // Tablet
  @media (min-width: 481px) and (max-width: 768px) {
    .current-avatar {
      width: 100px;
      height: 100px;
    }
  }

  // Desktop
  @media (min-width: 769px) {
    .current-avatar {
      width: 120px;
      height: 120px;
    }
  }
}
```

---

## 🎯 **Resumen de Implementación**

### ✅ **Funcionalidades Completadas:**
1. **Subida de avatar** con validación de tipo y tamaño
2. **Preview en tiempo real** de la imagen seleccionada
3. **Actualización de perfil** con avatar incluido
4. **Interfaz responsive** para móvil y desktop
5. **Validación de archivos** (tipo y tamaño)
6. **Compresión automática** de imágenes grandes
7. **Manejo de errores** y feedback al usuario

### 🔗 **Endpoints Utilizados:**
- `PUT /api/profile/:id/avatar` - Actualizar solo avatar
- `PUT /api/profile/:id` - Actualizar perfil completo con avatar
- `GET /api/profile/me` - Obtener perfil actual

### 📁 **Estructura de Archivos:**
```
uploads/
├── profiles/
│   ├── avatar-1755617641072-381916032.jpg
│   ├── avatar-1755617641073-123456789.png
│   └── ...
├── courses/
└── resources/
```

**¡La gestión de avatares está completamente implementada y lista para usar!** 👤✨
