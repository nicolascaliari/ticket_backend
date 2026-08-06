import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../modules/users/entities/user.entity';
import { BootstrapSeeder } from './bootstrap.seeder';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [BootstrapSeeder],
})
export class SeedersModule {}
