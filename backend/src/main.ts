import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ChatRoomDto } from './chats2/chats.dto';
import { Chats2Service } from './chats2/chats2.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = new DocumentBuilder()
    .setTitle('Nest Workshop')
    .setDescription('Nest Workshop')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  app.enableCors();
  await app.listen(3000);

  // add the general chat room to the database
  const generalChatRoomDto: ChatRoomDto = {
    name: process.env.GENERAL_CHAT_NAME,
    isPrivate: false,
    password: "",
  }
  
  const chats2Service = app.get(Chats2Service)
  await chats2Service.getChatRoom(generalChatRoomDto)

}

bootstrap();
