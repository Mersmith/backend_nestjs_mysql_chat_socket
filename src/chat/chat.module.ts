import { Module } from '@nestjs/common';
import { ChatGateway } from './socket/chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [AuthModule, UserModule],
  providers: [ChatGateway]
})
export class ChatModule { }
