import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model, isValidObjectId } from 'mongoose';
import { Client, ClientDocument } from '../clients/entities/client.entity';
import * as bcrypt from 'bcrypt';
import { DEFAULT_PERMISSIONS_BY_ROLE } from '../../common/enums/permissions.enum';
import { Roles } from '../../common/enums/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Client.name) private readonly clientModel: Model<ClientDocument>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new BadRequestException('Ya existe un usuario con este email');
    }

    const existingUsername = await this.userModel.findOne({
      username: createUserDto.username,
    });
    if (existingUsername) {
      throw new BadRequestException('Ya existe un usuario con este username');
    }

    const role = createUserDto.role ?? Roles.Client;

    if (role === Roles.Client && !createUserDto.clientId) {
      throw new BadRequestException(
        'Los usuarios client deben estar asociados a una empresa (clientId)',
      );
    }

    if (role === Roles.Admin && createUserDto.clientId) {
      throw new BadRequestException('Los usuarios admin no deben tener clientId');
    }

    if (createUserDto.clientId) {
      const client = await this.clientModel.findById(createUserDto.clientId);
      if (!client) {
        throw new NotFoundException('Client not found');
      }
    }

    const permissions =
      createUserDto.permissions ?? DEFAULT_PERMISSIONS_BY_ROLE[role];

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const user = await this.userModel.create({
      ...createUserDto,
      role,
      permissions,
      password: hashedPassword,
      clientId: role === Roles.Admin ? undefined : createUserDto.clientId,
    });

    const userObj = user.toObject();
    const { password: _password, ...safeUser } = userObj;

    return {
      ...safeUser,
      id: user._id.toString(),
      _id: user._id.toString(),
      clientId: user.clientId?.toString(),
    };
  }

  async findOne(userId: string) {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('ID de usuario inválido');
    }

    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      ...user.toObject(),
      id: user._id.toString(),
      _id: user._id.toString(),
      clientId: user.clientId?.toString(),
    };
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email, isActive: true });
    if (!user) {
      return null;
    }

    const userObj = user.toObject();
    return {
      ...userObj,
      id: user._id.toString(),
      _id: user._id.toString(),
      clientId: user.clientId?.toString(),
    };
  }

  async findByIdWithPassword(userId: string): Promise<UserDocument | null> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('ID de usuario inválido');
    }
    return this.userModel.findById(userId).exec();
  }

  async updatePassword(userId: string, hashedPassword: string) {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('ID de usuario inválido');
    }

    await this.userModel.updateOne(
      { _id: userId },
      { $set: { password: hashedPassword }, $inc: { tokenVersion: 1 } },
    );

    return { success: true };
  }

  async getTokenVersion(userId: string): Promise<number | null> {
    if (!isValidObjectId(userId)) {
      return null;
    }

    const user = await this.userModel
      .findById(userId)
      .select('tokenVersion isActive');
    if (!user || !user.isActive) {
      return null;
    }

    return user.tokenVersion ?? 0;
  }

  async findAll(assignableOnly = false) {
    const query: Record<string, unknown> = { isActive: true };

    if (assignableOnly) {
      query.role = { $in: [Roles.Admin, 'super-admin', 'agent'] };
    }

    const users = await this.userModel
      .find(query)
      .select('-password')
      .sort({ name: 1, lastName: 1 });

    return users.map((user) => ({
      ...user.toObject(),
      id: user._id.toString(),
      _id: user._id.toString(),
      clientId: user.clientId?.toString(),
    }));
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
