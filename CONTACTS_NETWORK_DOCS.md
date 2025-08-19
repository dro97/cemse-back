# 🤝 Red de Contactos - Documentación Completa

## 🎯 **Descripción General**

El sistema de **Red de Contactos** permite a los jóvenes conectarse entre sí, crear una red profesional y colaborativa. Los usuarios pueden:

- **Buscar otros jóvenes** por nombre, email o habilidades
- **Enviar solicitudes de contacto** con mensajes personalizados
- **Aceptar o rechazar** solicitudes recibidas
- **Gestionar su red de contactos** (ver, eliminar conexiones)
- **Ver estadísticas** de su red

## 🚀 **Endpoints Disponibles**

### **1. Buscar Jóvenes**
```bash
GET /api/contacts/search?query=maria&page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta**:
```json
{
  "users": [
    {
      "userId": "user123",
      "firstName": "María",
      "lastName": "García",
      "email": "maria.garcia@email.com",
      "avatarUrl": "https://example.com/avatar.jpg",
      "skills": ["JavaScript", "React", "Diseño UX"],
      "interests": ["Desarrollo web", "Tecnología"],
      "educationLevel": "UNIVERSITY",
      "currentInstitution": "Universidad Católica Boliviana",
      "department": "Cochabamba",
      "municipality": "Cochabamba",
      "createdAt": "2024-01-15T10:30:00Z",
      "contactStatus": null,
      "contactId": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### **2. Enviar Solicitud de Contacto**
```bash
POST /api/contacts/request
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "contactId": "user123",
  "message": "¡Hola! Me gustaría conectar contigo para colaborar en proyectos de desarrollo web."
}
```

**Respuesta**:
```json
{
  "message": "Contact request sent successfully",
  "contact": {
    "id": "contact123",
    "userId": "current_user_id",
    "contactId": "user123",
    "status": "PENDING",
    "message": "¡Hola! Me gustaría conectar contigo...",
    "createdAt": "2024-01-15T11:00:00Z",
    "contact": {
      "firstName": "María",
      "lastName": "García",
      "email": "maria.garcia@email.com",
      "avatarUrl": "https://example.com/avatar.jpg"
    }
  }
}
```

### **3. Obtener Solicitudes Recibidas**
```bash
GET /api/contacts/requests/received?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta**:
```json
{
  "requests": [
    {
      "id": "contact123",
      "userId": "user123",
      "contactId": "current_user_id",
      "status": "PENDING",
      "message": "¡Hola! Me gustaría conectar contigo...",
      "createdAt": "2024-01-15T11:00:00Z",
      "user": {
        "userId": "user123",
        "firstName": "María",
        "lastName": "García",
        "email": "maria.garcia@email.com",
        "avatarUrl": "https://example.com/avatar.jpg",
        "skills": ["JavaScript", "React"],
        "interests": ["Desarrollo web"],
        "educationLevel": "UNIVERSITY",
        "currentInstitution": "Universidad Católica Boliviana",
        "department": "Cochabamba",
        "municipality": "Cochabamba"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

### **4. Aceptar Solicitud**
```bash
PUT /api/contacts/requests/contact123/accept
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta**:
```json
{
  "message": "Contact request accepted successfully",
  "contact": {
    "id": "contact123",
    "status": "ACCEPTED",
    "user": {
      "firstName": "María",
      "lastName": "García",
      "email": "maria.garcia@email.com"
    }
  }
}
```

### **5. Rechazar Solicitud**
```bash
PUT /api/contacts/requests/contact123/reject
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta**:
```json
{
  "message": "Contact request rejected successfully"
}
```

### **6. Obtener Lista de Contactos**
```bash
GET /api/contacts?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta**:
```json
{
  "contacts": [
    {
      "userId": "user123",
      "firstName": "María",
      "lastName": "García",
      "email": "maria.garcia@email.com",
      "avatarUrl": "https://example.com/avatar.jpg",
      "skills": ["JavaScript", "React"],
      "interests": ["Desarrollo web"],
      "educationLevel": "UNIVERSITY",
      "currentInstitution": "Universidad Católica Boliviana",
      "department": "Cochabamba",
      "municipality": "Cochabamba",
      "connectionDate": "2024-01-15T11:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

### **7. Eliminar Contacto**
```bash
DELETE /api/contacts/user123
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta**:
```json
{
  "message": "Contact removed successfully"
}
```

### **8. Obtener Estadísticas de la Red**
```bash
GET /api/contacts/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta**:
```json
{
  "stats": {
    "totalContacts": 15,
    "pendingRequests": 3,
    "sentRequests": 2
  }
}
```

## 📊 **Estructura de Datos**

### **Contact (Solicitud de Contacto)**
```typescript
interface Contact {
  id: string;
  userId: string;        // Usuario que envía la solicitud
  contactId: string;     // Usuario que recibe la solicitud
  status: ContactStatus; // Estado de la solicitud
  message?: string;      // Mensaje opcional
  createdAt: Date;
  updatedAt: Date;
}
```

### **ContactStatus (Estados)**
```typescript
enum ContactStatus {
  PENDING   = "PENDING",   // Solicitud pendiente
  ACCEPTED  = "ACCEPTED",  // Solicitud aceptada
  REJECTED  = "REJECTED",  // Solicitud rechazada
  BLOCKED   = "BLOCKED"    // Usuario bloqueado
}
```

### **User Profile (Perfil de Usuario)**
```typescript
interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  skills: string[];
  interests: string[];
  educationLevel: string;
  currentInstitution: string;
  department: string;
  municipality: string;
  createdAt: Date;
}
```

## 📱 **Implementación en el Frontend**

### **1. Hook React para Red de Contactos**
```typescript
import { useState, useEffect } from 'react';

interface ContactRequest {
  id: string;
  userId: string;
  contactId: string;
  status: string;
  message?: string;
  createdAt: string;
  user: UserProfile;
}

interface Contact {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  skills: string[];
  interests: string[];
  educationLevel: string;
  currentInstitution: string;
  department: string;
  municipality: string;
  connectionDate: string;
}

interface NetworkStats {
  totalContacts: number;
  pendingRequests: number;
  sentRequests: number;
}

export const useContactsNetwork = (token: string) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ContactRequest[]>([]);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/contacts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error fetching contacts');
      }

      const data = await response.json();
      setContacts(data.contacts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/contacts/requests/received', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error fetching pending requests');
      }

      const data = await response.json();
      setPendingRequests(data.requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/contacts/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error fetching stats');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const sendContactRequest = async (contactId: string, message?: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/contacts/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contactId, message })
      });

      if (!response.ok) {
        throw new Error('Error sending contact request');
      }

      await fetchStats(); // Actualizar estadísticas
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const acceptContactRequest = async (contactId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/contacts/requests/${contactId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error accepting contact request');
      }

      await Promise.all([fetchContacts(), fetchPendingRequests(), fetchStats()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const rejectContactRequest = async (contactId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/contacts/requests/${contactId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error rejecting contact request');
      }

      await Promise.all([fetchPendingRequests(), fetchStats()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const removeContact = async (contactId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error removing contact');
      }

      await Promise.all([fetchContacts(), fetchStats()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    if (token) {
      setLoading(true);
      Promise.all([fetchContacts(), fetchPendingRequests(), fetchStats()])
        .finally(() => setLoading(false));
    }
  }, [token]);

  return {
    contacts,
    pendingRequests,
    stats,
    loading,
    error,
    sendContactRequest,
    acceptContactRequest,
    rejectContactRequest,
    removeContact,
    refetch: () => Promise.all([fetchContacts(), fetchPendingRequests(), fetchStats()])
  };
};
```

### **2. Componente de Búsqueda de Usuarios**
```typescript
import React, { useState } from 'react';

interface UserSearchProps {
  token: string;
  onSendRequest: (contactId: string, message?: string) => void;
}

export const UserSearch: React.FC<UserSearchProps> = ({ token, onSendRequest }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [message, setMessage] = useState('');

  const searchUsers = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/contacts/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error searching users');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = () => {
    if (selectedUser) {
      onSendRequest(selectedUser.userId, message);
      setSelectedUser(null);
      setMessage('');
    }
  };

  return (
    <div className="user-search">
      <div className="search-section">
        <h3>Buscar Jóvenes</h3>
        <div className="search-input">
          <input
            type="text"
            placeholder="Buscar por nombre, email o habilidades..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
          />
          <button onClick={searchUsers} disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {users.length > 0 && (
        <div className="search-results">
          <h4>Resultados de búsqueda</h4>
          {users.map((user) => (
            <div key={user.userId} className="user-card">
              <div className="user-info">
                <img src={user.avatarUrl || '/default-avatar.png'} alt="Avatar" />
                <div>
                  <h5>{user.firstName} {user.lastName}</h5>
                  <p>{user.email}</p>
                  <p><strong>Habilidades:</strong> {user.skills.join(', ')}</p>
                  <p><strong>Institución:</strong> {user.currentInstitution}</p>
                </div>
              </div>
              
              {user.contactStatus === null && (
                <button onClick={() => setSelectedUser(user)}>
                  Enviar Solicitud
                </button>
              )}
              
              {user.contactStatus === 'PENDING' && (
                <span className="status pending">Solicitud Pendiente</span>
              )}
              
              {user.contactStatus === 'ACCEPTED' && (
                <span className="status accepted">Conectado</span>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedUser && (
        <div className="contact-modal">
          <h4>Enviar solicitud a {selectedUser.firstName} {selectedUser.lastName}</h4>
          <textarea
            placeholder="Mensaje opcional..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
          <div className="modal-actions">
            <button onClick={handleSendRequest}>Enviar Solicitud</button>
            <button onClick={() => setSelectedUser(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};
```

### **3. Componente de Solicitudes Pendientes**
```typescript
import React from 'react';

interface PendingRequestsProps {
  requests: any[];
  onAccept: (contactId: string) => void;
  onReject: (contactId: string) => void;
}

export const PendingRequests: React.FC<PendingRequestsProps> = ({ requests, onAccept, onReject }) => {
  if (requests.length === 0) {
    return (
      <div className="pending-requests">
        <h3>Solicitudes de Contacto</h3>
        <p>No tienes solicitudes pendientes</p>
      </div>
    );
  }

  return (
    <div className="pending-requests">
      <h3>Solicitudes de Contacto ({requests.length})</h3>
      {requests.map((request) => (
        <div key={request.id} className="request-card">
          <div className="user-info">
            <img src={request.user.avatarUrl || '/default-avatar.png'} alt="Avatar" />
            <div>
              <h5>{request.user.firstName} {request.user.lastName}</h5>
              <p>{request.user.email}</p>
              <p><strong>Habilidades:</strong> {request.user.skills.join(', ')}</p>
              {request.message && (
                <p><strong>Mensaje:</strong> {request.message}</p>
              )}
            </div>
          </div>
          <div className="request-actions">
            <button 
              className="accept-btn"
              onClick={() => onAccept(request.id)}
            >
              Aceptar
            </button>
            <button 
              className="reject-btn"
              onClick={() => onReject(request.id)}
            >
              Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
```

### **4. Componente de Lista de Contactos**
```typescript
import React from 'react';

interface ContactsListProps {
  contacts: any[];
  onRemoveContact: (contactId: string) => void;
}

export const ContactsList: React.FC<ContactsListProps> = ({ contacts, onRemoveContact }) => {
  if (contacts.length === 0) {
    return (
      <div className="contacts-list">
        <h3>Mi Red de Contactos</h3>
        <p>Aún no tienes contactos. ¡Busca otros jóvenes para conectar!</p>
      </div>
    );
  }

  return (
    <div className="contacts-list">
      <h3>Mi Red de Contactos ({contacts.length})</h3>
      {contacts.map((contact) => (
        <div key={contact.userId} className="contact-card">
          <div className="contact-info">
            <img src={contact.avatarUrl || '/default-avatar.png'} alt="Avatar" />
            <div>
              <h5>{contact.firstName} {contact.lastName}</h5>
              <p>{contact.email}</p>
              <p><strong>Habilidades:</strong> {contact.skills.join(', ')}</p>
              <p><strong>Institución:</strong> {contact.currentInstitution}</p>
              <p><strong>Conectado desde:</strong> {new Date(contact.connectionDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="contact-actions">
            <button 
              className="remove-btn"
              onClick={() => onRemoveContact(contact.userId)}
            >
              Eliminar Contacto
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
```

## 🎯 **Ejemplos de Uso**

### **1. Buscar Usuarios**
```javascript
const response = await fetch('http://localhost:3001/api/contacts/search?query=maria', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
console.log(data.users);
```

### **2. Enviar Solicitud**
```javascript
const response = await fetch('http://localhost:3001/api/contacts/request', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contactId: 'user123',
    message: '¡Hola! Me gustaría conectar contigo.'
  })
});
```

### **3. Aceptar Solicitud**
```javascript
const response = await fetch('http://localhost:3001/api/contacts/requests/contact123/accept', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

## 🔧 **Base de Datos**

### **Modelo Contact**
```prisma
model Contact {
  id              String        @id @default(cuid())
  userId          String        @map("user_id")
  contactId       String        @map("contact_id")
  status          ContactStatus @default(PENDING)
  message         String?
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")
  
  user            Profile       @relation("UserContacts", fields: [userId], references: [userId], onDelete: Cascade)
  contact         Profile       @relation("ContactOfUser", fields: [contactId], references: [userId], onDelete: Cascade)
  
  @@unique([userId, contactId])
  @@index([userId])
  @@index([contactId])
  @@index([status])
  @@map("contacts")
}
```

### **Enum ContactStatus**
```prisma
enum ContactStatus {
  PENDING
  ACCEPTED
  REJECTED
  BLOCKED
}
```

## ✅ **Estado Actual**

- ✅ **Base de datos**: Modelo Contact creado y migración aplicada
- ✅ **Backend**: Controlador completo con todas las funcionalidades
- ✅ **Rutas**: Endpoints registrados y funcionando
- ✅ **Usuarios de ejemplo**: 5 usuarios jóvenes creados
- ✅ **Validaciones**: Seguridad y validaciones implementadas
- ✅ **Documentación**: Completa

## 🚀 **Próximos Pasos**

1. **Implementar en el frontend** usando los ejemplos
2. **Agregar notificaciones** en tiempo real
3. **Implementar chat** entre contactos
4. **Agregar recomendaciones** de contactos

## 👥 **Usuarios de Ejemplo Creados**

| Usuario | Nombre | Habilidades | Institución |
|---------|--------|-------------|-------------|
| `maria_garcia` | María García | JavaScript, React, UX | Universidad Católica Boliviana |
| `carlos_rodriguez` | Carlos Rodríguez | Python, ML, Datos | Universidad Mayor de San Simón |
| `ana_martinez` | Ana Martínez | Marketing Digital, Redes | Universidad Privada Boliviana |
| `luis_fernandez` | Luis Fernández | Java, Spring Boot, BD | Universidad Mayor de San Simón |
| `sofia_lopez` | Sofía López | Diseño Gráfico, Illustrator | Universidad Católica Boliviana |

**Contraseña para todos**: `password123`

¡La red de contactos está completamente implementada y lista para usar! 🤝
