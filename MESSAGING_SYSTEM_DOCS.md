# 💬 Sistema de Mensajería - Documentación Completa

## 🎯 **Descripción General**

El sistema de **Mensajería** permite a los jóvenes que son contactos enviarse mensajes entre sí. Incluye:

- **Conversaciones** entre contactos
- **Mensajes en tiempo real** con estados (enviado, entregado, leído)
- **Contadores de mensajes no leídos**
- **Historial completo** de conversaciones
- **Estadísticas** de mensajería

## 🚀 **Endpoints Disponibles**

### **1. Obtener Conversaciones**
```bash
GET /api/messages/conversations?page=1&limit=20
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta**:
```json
{
  "conversations": [
    {
      "id": "conv123",
      "otherParticipantId": "user456",
      "participant": {
        "userId": "user456",
        "firstName": "María",
        "lastName": "García",
        "email": "maria.garcia@email.com",
        "avatarUrl": "https://example.com/avatar.jpg"
      },
      "lastMessage": {
        "id": "msg789",
        "content": "¡Hola! ¿Cómo estás?",
        "messageType": "TEXT",
        "status": "READ",
        "createdAt": "2024-01-15T14:30:00Z",
        "sender": {
          "firstName": "María",
          "lastName": "García",
          "avatarUrl": "https://example.com/avatar.jpg"
        }
      },
      "unreadCount": 0,
      "updatedAt": "2024-01-15T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

### **2. Obtener Mensajes de una Conversación**
```bash
GET /api/messages/conversation/user456?page=1&limit=50
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta**:
```json
{
  "conversationId": "conv123",
  "messages": [
    {
      "id": "msg789",
      "conversationId": "conv123",
      "senderId": "user456",
      "receiverId": "current_user_id",
      "content": "¡Hola! ¿Cómo estás?",
      "messageType": "TEXT",
      "status": "READ",
      "createdAt": "2024-01-15T14:30:00Z",
      "readAt": "2024-01-15T14:35:00Z",
      "sender": {
        "firstName": "María",
        "lastName": "García",
        "avatarUrl": "https://example.com/avatar.jpg"
      }
    },
    {
      "id": "msg790",
      "conversationId": "conv123",
      "senderId": "current_user_id",
      "receiverId": "user456",
      "content": "¡Hola María! Todo bien, ¿y tú?",
      "messageType": "TEXT",
      "status": "SENT",
      "createdAt": "2024-01-15T14:32:00Z",
      "readAt": null,
      "sender": {
        "firstName": "Juan",
        "lastName": "Pérez",
        "avatarUrl": "https://example.com/avatar2.jpg"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "pages": 1
  }
}
```

### **3. Enviar Mensaje**
```bash
POST /api/messages/send
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "receiverId": "user456",
  "content": "¡Hola! ¿Te gustaría colaborar en un proyecto?",
  "messageType": "TEXT"
}
```

**Respuesta**:
```json
{
  "message": "Message sent successfully",
  "data": {
    "id": "msg791",
    "conversationId": "conv123",
    "senderId": "current_user_id",
    "receiverId": "user456",
    "content": "¡Hola! ¿Te gustaría colaborar en un proyecto?",
    "messageType": "TEXT",
    "status": "SENT",
    "createdAt": "2024-01-15T15:00:00Z",
    "readAt": null,
    "sender": {
      "firstName": "Juan",
      "lastName": "Pérez",
      "avatarUrl": "https://example.com/avatar2.jpg"
    }
  }
}
```

### **4. Marcar Mensaje como Leído**
```bash
PUT /api/messages/msg789/read
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta**:
```json
{
  "message": "Message marked as read",
  "data": {
    "id": "msg789",
    "status": "READ",
    "readAt": "2024-01-15T15:05:00Z"
  }
}
```

### **5. Obtener Estadísticas de Mensajería**
```bash
GET /api/messages/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta**:
```json
{
  "stats": {
    "totalConversations": 5,
    "totalMessages": 150,
    "unreadMessages": 3
  }
}
```

### **6. Eliminar Mensaje**
```bash
DELETE /api/messages/msg789
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta**:
```json
{
  "message": "Message deleted successfully"
}
```

## 📊 **Estructura de Datos**

### **Conversation (Conversación)**
```typescript
interface Conversation {
  id: string;
  participants: string[];        // Array de userIds
  lastMessageContent?: string;   // Último mensaje
  lastMessageTime?: Date;        // Fecha del último mensaje
  unreadCount: number;           // Mensajes no leídos
  createdAt: Date;
  updatedAt: Date;
}
```

### **Message (Mensaje)**
```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: MessageType;
  status: MessageStatus;
  createdAt: Date;
  readAt?: Date;
}
```

### **MessageType (Tipos de Mensaje)**
```typescript
enum MessageType {
  TEXT   = "TEXT",   // Mensaje de texto
  IMAGE  = "IMAGE",  // Imagen
  FILE   = "FILE"    // Archivo
}
```

### **MessageStatus (Estados de Mensaje)**
```typescript
enum MessageStatus {
  SENT      = "SENT",      // Enviado
  DELIVERED = "DELIVERED", // Entregado
  READ      = "READ"       // Leído
}
```

## 📱 **Implementación en el Frontend**

### **1. Hook React para Mensajería**
```typescript
import { useState, useEffect } from 'react';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: string;
  status: string;
  createdAt: string;
  readAt?: string;
  sender: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

interface Conversation {
  id: string;
  otherParticipantId: string;
  participant: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

interface MessagingStats {
  totalConversations: number;
  totalMessages: number;
  unreadMessages: number;
}

export const useMessaging = (token: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<MessagingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error fetching conversations');
      }

      const data = await response.json();
      setConversations(data.conversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchMessages = async (contactId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/messages/conversation/${contactId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error fetching messages');
      }

      const data = await response.json();
      setCurrentMessages(data.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const sendMessage = async (receiverId: string, content: string, messageType: string = 'TEXT') => {
    try {
      const response = await fetch('http://localhost:3001/api/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ receiverId, content, messageType })
      });

      if (!response.ok) {
        throw new Error('Error sending message');
      }

      const data = await response.json();
      
      // Agregar el nuevo mensaje a la conversación actual
      setCurrentMessages(prev => [...prev, data.data]);
      
      // Actualizar conversaciones
      await fetchConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error marking message as read');
      }

      // Actualizar el estado del mensaje localmente
      setCurrentMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'READ', readAt: new Date().toISOString() }
            : msg
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/messages/stats', {
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

  useEffect(() => {
    if (token) {
      setLoading(true);
      Promise.all([fetchConversations(), fetchStats()])
        .finally(() => setLoading(false));
    }
  }, [token]);

  return {
    conversations,
    currentMessages,
    stats,
    loading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markMessageAsRead,
    fetchStats,
    refetch: () => Promise.all([fetchConversations(), fetchStats()])
  };
};
```

### **2. Componente de Lista de Conversaciones**
```typescript
import React from 'react';

interface ConversationsListProps {
  conversations: any[];
  onSelectConversation: (contactId: string) => void;
  selectedContactId?: string;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({ 
  conversations, 
  onSelectConversation, 
  selectedContactId 
}) => {
  if (conversations.length === 0) {
    return (
      <div className="conversations-list">
        <h3>Conversaciones</h3>
        <p>No tienes conversaciones activas. ¡Conecta con otros jóvenes para empezar a chatear!</p>
      </div>
    );
  }

  return (
    <div className="conversations-list">
      <h3>Conversaciones ({conversations.length})</h3>
      {conversations.map((conversation) => (
        <div 
          key={conversation.id} 
          className={`conversation-item ${selectedContactId === conversation.otherParticipantId ? 'selected' : ''}`}
          onClick={() => onSelectConversation(conversation.otherParticipantId)}
        >
          <div className="conversation-avatar">
            <img 
              src={conversation.participant.avatarUrl || '/default-avatar.png'} 
              alt="Avatar" 
            />
            {conversation.unreadCount > 0 && (
              <span className="unread-badge">{conversation.unreadCount}</span>
            )}
          </div>
          
          <div className="conversation-info">
            <h4>{conversation.participant.firstName} {conversation.participant.lastName}</h4>
            {conversation.lastMessage && (
              <p className="last-message">
                {conversation.lastMessage.sender.firstName}: {conversation.lastMessage.content}
              </p>
            )}
            <span className="last-time">
              {conversation.lastMessage 
                ? new Date(conversation.lastMessage.createdAt).toLocaleTimeString()
                : 'Sin mensajes'
              }
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
```

### **3. Componente de Chat**
```typescript
import React, { useState, useEffect, useRef } from 'react';

interface ChatProps {
  contactId: string;
  contactName: string;
  messages: any[];
  onSendMessage: (content: string) => void;
  onMarkAsRead: (messageId: string) => void;
}

export const Chat: React.FC<ChatProps> = ({ 
  contactId, 
  contactName, 
  messages, 
  onSendMessage, 
  onMarkAsRead 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>{contactName}</h3>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No hay mensajes aún. ¡Envía el primer mensaje!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.senderId === 'current_user_id' ? 'sent' : 'received'}`}
              onMouseEnter={() => {
                if (message.status !== 'READ' && message.senderId !== 'current_user_id') {
                  onMarkAsRead(message.id);
                }
              }}
            >
              <div className="message-content">
                <p>{message.content}</p>
                <span className="message-time">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </span>
                {message.senderId === 'current_user_id' && (
                  <span className="message-status">
                    {message.status === 'READ' ? '✓✓' : '✓'}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="message-input">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe un mensaje..."
          rows={1}
        />
        <button onClick={handleSendMessage} disabled={!newMessage.trim()}>
          Enviar
        </button>
      </div>
    </div>
  );
};
```

## 🎯 **Ejemplos de Uso**

### **1. Obtener Conversaciones**
```javascript
const response = await fetch('http://localhost:3001/api/messages/conversations', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
console.log(data.conversations);
```

### **2. Enviar Mensaje**
```javascript
const response = await fetch('http://localhost:3001/api/messages/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    receiverId: 'user456',
    content: '¡Hola! ¿Cómo estás?',
    messageType: 'TEXT'
  })
});
```

### **3. Obtener Mensajes de una Conversación**
```javascript
const response = await fetch('http://localhost:3001/api/messages/conversation/user456', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
console.log(data.messages);
```

## 🔧 **Base de Datos**

### **Modelo Conversation**
```prisma
model Conversation {
  id                  String    @id @default(cuid())
  participants        String[]  // Array de userIds
  lastMessageContent  String?   @map("last_message_content")
  lastMessageTime     DateTime? @map("last_message_time")
  unreadCount         Int       @default(0) @map("unread_count")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")
  
  messages            Message[]
  
  @@unique([participants])
  @@index([participants])
  @@map("conversations")
}
```

### **Modelo Message**
```prisma
model Message {
  id              String        @id @default(cuid())
  conversationId  String        @map("conversation_id")
  senderId        String        @map("sender_id")
  receiverId      String        @map("receiver_id")
  content         String
  messageType     MessageType   @default(TEXT) @map("message_type")
  status          MessageStatus @default(SENT) @map("message_status")
  createdAt       DateTime      @default(now()) @map("created_at")
  readAt          DateTime?     @map("read_at")
  
  conversation    Conversation  @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender          Profile       @relation("MessageSender", fields: [senderId], references: [userId], onDelete: Cascade)
  receiver        Profile       @relation("MessageReceiver", fields: [receiverId], references: [userId], onDelete: Cascade)
  
  @@index([conversationId])
  @@index([senderId])
  @@index([receiverId])
  @@index([createdAt])
  @@map("messages")
}
```

## ✅ **Estado Actual**

- ✅ **Base de datos**: Modelos Conversation y Message creados
- ✅ **Backend**: Controlador completo con todas las funcionalidades
- ✅ **Rutas**: Endpoints registrados y funcionando
- ✅ **Validaciones**: Solo contactos pueden enviarse mensajes
- ✅ **Estados de mensaje**: SENT, DELIVERED, READ
- ✅ **Contadores**: Mensajes no leídos por conversación
- ✅ **Documentación**: Completa

## 🚀 **Próximos Pasos**

1. **Implementar en el frontend** usando los ejemplos
2. **Agregar WebSockets** para mensajes en tiempo real
3. **Implementar notificaciones push**
4. **Agregar envío de archivos e imágenes**
5. **Implementar indicador de "escribiendo..."**

## 💡 **Características Destacadas**

- **Solo contactos**: Solo puedes enviar mensajes a tus contactos
- **Estados de mensaje**: Seguimiento completo del estado
- **Contadores automáticos**: Mensajes no leídos por conversación
- **Marcado automático**: Los mensajes se marcan como leídos al abrir la conversación
- **Paginación**: Para manejar muchas conversaciones y mensajes
- **Seguridad**: Validaciones completas de permisos

¡El sistema de mensajería está completamente implementado y listo para usar! 💬
