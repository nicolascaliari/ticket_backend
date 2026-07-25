import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { Client, ClientSchema } from 'src/clients/entities/client.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: User.name,
      schema: UserSchema,
    }]),
    MongooseModule.forFeature([{
      name: Client.name,
      schema: ClientSchema,
    }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }
