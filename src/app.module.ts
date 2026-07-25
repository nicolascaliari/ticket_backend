import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { ProjectsModule } from './projects/projects.module';
import { TicketsModule } from './tickets/tickets.module';
import { CommentsModule } from './comments/comments.module';
import { MongooseModule } from '@nestjs/mongoose';
import { envs } from './config/envs';

@Module({
  imports: [UsersModule, ClientsModule, ProjectsModule, TicketsModule, CommentsModule,
    MongooseModule.forRoot(envs.mongoUrl), 
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
