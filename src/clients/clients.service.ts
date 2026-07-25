import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Client, ClientDocument } from './entities/client.entity';
import { Model } from 'mongoose';

@Injectable()
export class ClientsService {

  constructor(
    @InjectModel(Client.name) private readonly clientModel: Model<ClientDocument>
  ) { }

  async create(createClientDto: CreateClientDto) {
    const client = await this.clientModel.create(createClientDto);

    return client;
  }

  findAll() {
    return `This action returns all clients`;
  }

  findOne(id: number) {
    return `This action returns a #${id} client`;
  }

  update(id: number, updateClientDto: UpdateClientDto) {
    return `This action updates a #${id} client`;
  }

  remove(id: number) {
    return `This action removes a #${id} client`;
  }
}
