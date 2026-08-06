import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { ClientsModule } from '../clients/clients.module';
import { ProjectsModule } from '../projects/projects.module';
import { TicketsModule } from '../tickets/tickets.module';
import { CommentsModule } from '../comments/comments.module';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { MongooseModule } from '@nestjs/mongoose';
import { envs } from '../../config/envs';
import { SeedersModule } from '../../seeders/seeders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: envs.jwtSecret,
      signOptions: {
        expiresIn: envs.jwtExpiresIn as JwtSignOptions['expiresIn'],
      },
    }),
    MongooseModule.forRoot(envs.mongoUrl),
    SeedersModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    ProjectsModule,
    TicketsModule,
    CommentsModule,
    StorageModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
