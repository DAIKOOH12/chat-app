import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
// Sử dụng đúng Server và Socket từ socket.io
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3002, { cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private messages = new Map(); // Lưu trữ tin nhắn để theo dõi trạng thái

  handleConnection(client: Socket) {
    console.log('New user connected', client.id);

    client.emit('user-joined', {
      message: `Bạn đã tham gia chat`,
    });

    client.broadcast.emit('user-joined', {
      message: `Một người dùng mới đã tham gia chat`,
    });
  }

  handleDisconnect(client: Socket) {
    console.log('User disconnected', client.id);

    this.server.emit('user-left', {
      message: 'Một người dùng đã rời khỏi phòng chat',
      userId: client.id,
    });
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket) {
    // Broadcast cho tất cả client khác biết người này đang nhập
    client.broadcast.emit('userTyping', {
      senderId: client.id,
    });
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(client: Socket) {
    // Broadcast cho tất cả client khác biết người này đã ngừng nhập
    client.broadcast.emit('userStopTyping', {
      senderId: client.id,
    });
  }

  @SubscribeMessage('newMessage')
  handleNewMessage(client: Socket, message: any) {
    const messageId = Date.now().toString(); // Tạo ID tin nhắn đơn giản

    const msgObj = {
      id: messageId,
      message: message,
      senderId: client.id,
      seen: false,
      timestamp: new Date().toISOString(),
    };

    // Lưu tin nhắn vào map
    this.messages.set(messageId, msgObj);

    // Gửi cho chính sender với trạng thái đã gửi
    client.emit('reply', {
      ...msgObj,
      status: 'sent',
    });

    // Gửi cho các client khác
    client.broadcast.emit('reply', msgObj);
  }

  @SubscribeMessage('seenMessage')
  handleSeenMessage(client: Socket, data: any) {
    const { messageId } = data;

    if (this.messages.has(messageId)) {
      const message = this.messages.get(messageId);
      message.seen = true;

      // Broadcast cho tất cả client về trạng thái đã xem
      this.server.emit('messageSeen', {
        messageId: messageId,
        senderId: message.senderId,
      });
    }
  }
}
