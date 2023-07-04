import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Chats2Service } from './chats2/chats2.service';
import { UsersService } from './users/users.service';

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
  try{
     const generalRoom = await chats2Service.createChatRoom(generalChatRoomDto)
     const m = await chats2Service.findChatRoomMembers(generalRoom.id)
     console.log("General chat room created")
     console.log(m.length)
    }
  catch(error){ console.log("General chat room already exists") }

  const ownerMock = {
    username: process.env.OWNER_USERNAME,
    email: process.env.OWNER_EMAIL,
    password: process.env.OWNER_PASSWORD,
    isBanned: false,
    role: "OWNER"
  }
  const adminMock = {
    username: process.env.ADMIN_USERNAME,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    isBanned: false,
    role: "ADMIN"
  }

  const usersService = app.get(UsersService)
  

  try { await usersService.createUser(ownerMock, false) }
  catch(error) { console.log("Owner already exists") }
  try { await usersService.createUser(adminMock, false) }
  catch(error) { console.log("Admin already exists") }
}

bootstrap();
