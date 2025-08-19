const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testMessagingSystem() {
  try {
    console.log('🧪 Probando el sistema de mensajería...\n');

    // 1. Obtener usuarios jóvenes para las pruebas
    const youthUsers = await prisma.profile.findMany({
      where: {
        role: 'YOUTH'
      },
      take: 3
    });

    if (youthUsers.length < 2) {
      console.log('❌ Se necesitan al menos 2 usuarios jóvenes para las pruebas');
      return;
    }

    const user1 = youthUsers[0];
    const user2 = youthUsers[1];

    console.log(`👤 Usuario 1: ${user1.userId} (${user1.firstName} ${user1.lastName})`);
    console.log(`👤 Usuario 2: ${user2.userId} (${user2.firstName} ${user2.lastName})\n`);

    // 2. Crear una conexión entre los usuarios
    console.log('🔗 Creando conexión entre usuarios...');
    
    // Verificar si ya existe una conexión
    let contact = await prisma.contact.findFirst({
      where: {
        OR: [
          { userId: user1.userId, contactId: user2.userId },
          { userId: user2.userId, contactId: user1.userId }
        ]
      }
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          userId: user1.userId,
          contactId: user2.userId,
          status: 'ACCEPTED',
          requestMessage: '¡Hola! Me gustaría conectar contigo para las pruebas del sistema de mensajería.'
        }
      });
      console.log('✅ Conexión creada exitosamente');
    } else {
      console.log('✅ Conexión ya existía');
    }

    // 3. Crear una conversación
    console.log('\n💬 Creando conversación...');
    const participants = [user1.userId, user2.userId].sort();
    
    let conversation = await prisma.conversation.findUnique({
      where: {
        participants
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants
        }
      });
      console.log('✅ Conversación creada exitosamente');
    } else {
      console.log('✅ Conversación ya existía');
    }

    // 4. Enviar algunos mensajes de prueba
    console.log('\n📨 Enviando mensajes de prueba...');

    const testMessages = [
      {
        senderId: user1.userId,
        receiverId: user2.userId,
        content: '¡Hola! ¿Cómo estás?',
        messageType: 'TEXT'
      },
      {
        senderId: user2.userId,
        receiverId: user1.userId,
        content: '¡Hola! Todo bien, ¿y tú?',
        messageType: 'TEXT'
      },
      {
        senderId: user1.userId,
        receiverId: user2.userId,
        content: '¡Excelente! ¿Te gustaría colaborar en un proyecto?',
        messageType: 'TEXT'
      },
      {
        senderId: user2.userId,
        receiverId: user1.userId,
        content: '¡Por supuesto! Me encantaría. ¿De qué se trata?',
        messageType: 'TEXT'
      },
      {
        senderId: user1.userId,
        receiverId: user2.userId,
        content: 'Es un proyecto de desarrollo web. Te cuento más detalles después.',
        messageType: 'TEXT'
      }
    ];

    for (const messageData of testMessages) {
      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          ...messageData,
          status: 'SENT'
        }
      });
      console.log(`✅ Mensaje enviado: "${messageData.content}"`);
    }

    // 5. Marcar algunos mensajes como leídos
    console.log('\n👁️ Marcando mensajes como leídos...');
    
    const unreadMessages = await prisma.message.findMany({
      where: {
        conversationId: conversation.id,
        receiverId: user2.userId,
        status: { not: 'READ' }
      },
      take: 2
    });

    for (const message of unreadMessages) {
      await prisma.message.update({
        where: { id: message.id },
        data: {
          status: 'READ',
          readAt: new Date()
        }
      });
      console.log(`✅ Mensaje marcado como leído: "${message.content}"`);
    }

    // 6. Actualizar la conversación con el último mensaje
    const lastMessage = await prisma.message.findFirst({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' }
    });

    if (lastMessage) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageContent: lastMessage.content,
          lastMessageTime: lastMessage.createdAt,
          unreadCount: 1 // Un mensaje no leído
        }
      });
      console.log('✅ Conversación actualizada con último mensaje');
    }

    // 7. Mostrar estadísticas
    console.log('\n📊 Estadísticas del sistema de mensajería:');
    
    const [totalConversations, totalMessages, totalUnreadMessages] = await Promise.all([
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.message.count({
        where: {
          status: { not: 'READ' }
        }
      })
    ]);

    console.log(`   • Total de conversaciones: ${totalConversations}`);
    console.log(`   • Total de mensajes: ${totalMessages}`);
    console.log(`   • Mensajes no leídos: ${totalUnreadMessages}`);

    // 8. Mostrar la conversación creada
    console.log('\n💬 Detalles de la conversación de prueba:');
    const conversationWithMessages = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      include: {
        messages: {
          include: {
            sender: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    console.log(`   • ID de conversación: ${conversation.id}`);
    console.log(`   • Participantes: ${conversationWithMessages.participants.join(', ')}`);
    console.log(`   • Último mensaje: "${conversationWithMessages.lastMessageContent}"`);
    console.log(`   • Mensajes no leídos: ${conversationWithMessages.unreadCount}`);
    console.log(`   • Total de mensajes: ${conversationWithMessages.messages.length}`);

    console.log('\n📝 Historial de mensajes:');
    conversationWithMessages.messages.forEach((message, index) => {
      const senderName = `${message.sender.firstName} ${message.sender.lastName}`;
      const status = message.status === 'READ' ? '✓✓' : '✓';
      console.log(`   ${index + 1}. [${senderName}] ${message.content} ${status}`);
    });

    console.log('\n🎉 ¡Sistema de mensajería probado exitosamente!');
    console.log('\n📋 Endpoints disponibles para probar:');
    console.log('   • GET /api/messages/conversations - Obtener conversaciones');
    console.log('   • GET /api/messages/conversation/:contactId - Obtener mensajes');
    console.log('   • POST /api/messages/send - Enviar mensaje');
    console.log('   • PUT /api/messages/:messageId/read - Marcar como leído');
    console.log('   • GET /api/messages/stats - Estadísticas');
    console.log('   • DELETE /api/messages/:messageId - Eliminar mensaje');

  } catch (error) {
    console.error('❌ Error probando el sistema de mensajería:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMessagingSystem();
