import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../modules/users/entities/user.entity';
import { Roles } from '../common/enums/roles.enum';
import { DEFAULT_PERMISSIONS_BY_ROLE } from '../common/enums/permissions.enum';

@Injectable()
export class BootstrapSeeder implements OnModuleInit {
  private readonly logger = new Logger(BootstrapSeeder.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    const count = await this.userModel.countDocuments();
    if (count > 0) {
      return;
    }

    const email = process.env.ADMIN_EMAIL ?? 'admin@company.com';
    const password = process.env.ADMIN_PASSWORD ?? 'Admin123!';

    const hashedPassword = await bcrypt.hash(password, 12);

    await this.userModel.create({
      username: 'admin',
      email,
      password: hashedPassword,
      name: 'Admin',
      lastName: 'System',
      role: Roles.Admin,
      permissions: DEFAULT_PERMISSIONS_BY_ROLE[Roles.Admin],
    });

    this.logger.warn(
      `Usuario admin creado (${email}). Cambia la contraseña después del primer login.`,
    );
  }
}
