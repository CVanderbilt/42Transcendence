import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Chats2Service } from './chats2/chats2.service';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = new DocumentBuilder()
    .setTitle('42Transcendence')
    .setDescription('42Transcendence')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  app.enableCors();
  await app.listen(3000);

  // add the general chat room to the database
  const generalChatRoomDto: {
    name: string,
    isDirect: boolean
  } = {
    name: process.env.GENERAL_CHAT_NAME,
    isDirect: false,
  }
      
  const chats2Service = app.get(Chats2Service)
  try{ await chats2Service.createChatRoom(generalChatRoomDto) }
  catch(error){ console.log("General chat room already exists") }

  const authService = app.get(AuthService)
  const ownerMock = {
    username: process.env.OWNER_USERNAME,
    email: process.env.OWNER_EMAIL,
    password: process.env.OWNER_PASSWORD,
    role: "OWNER"
  }
  const adminMock = {
    username: process.env.ADMIN_USERNAME,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: "ADMIN"
  }

  try { await authService.makeMockUser(ownerMock) }
  catch(error) { console.log("Owner already exists") }
  try { await authService.makeMockUser(adminMock) }
  catch(error) { console.log("Admin already exists") }
}

bootstrap();
