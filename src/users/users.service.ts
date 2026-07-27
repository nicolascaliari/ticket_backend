import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import { Client, ClientDocument } from 'src/clients/entities/client.entity';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Client.name) private readonly clientModel: Model<ClientDocument>
  ) { }


  

  async create(createUserDto: CreateUserDto) {
    const client = await this.clientModel.findById(createUserDto.clientId)
    if (!client) {
      throw new NotFoundException('Client not found')
    }
    const user = await this.userModel.create(createUserDto)
    return user;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
