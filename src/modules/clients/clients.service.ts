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

    return {
      ...client.toObject(),
      _id: client._id.toString(),
      id: client._id.toString(),
    };
  }

  async findAll() {
    const clients = await this.clientModel.find().sort({ name: 1 });
    return clients.map((client) => ({
      ...client.toObject(),
      _id: client._id.toString(),
      id: client._id.toString(),
    }));
  }

  async findOne(id: string) {
    const client = await this.clientModel.findById(id);
    if (!client) return null;
    return {
      ...client.toObject(),
      _id: client._id.toString(),
      id: client._id.toString(),
    };
  }

  update(id: number, updateClientDto: UpdateClientDto) {
    return `This action updates a #${id} client`;
  }

  remove(id: number) {
    return `This action removes a #${id} client`;
  }
}
