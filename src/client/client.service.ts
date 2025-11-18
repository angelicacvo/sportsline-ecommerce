import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) { }

  async create(createClientDto: CreateClientDto) {
    const existingClient = await this.clientRepository.findOne({
      where: { email: createClientDto.email },
    });

    if (existingClient) {
      throw new BadRequestException('Client with this email already exists');
    }

    const client = this.clientRepository.create(createClientDto);
    return await this.clientRepository.save(client);
    
  }


  async findAll() {
    return this.clientRepository.find();
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id: id.toString() } });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const existingClient = await this.clientRepository.findOne({
      where: { email: updateClientDto.email },
    });

    if (existingClient && existingClient.id !== id.toString()) {
      throw new BadRequestException('Client with this email already exists');
    }

    Object.assign(client, updateClientDto);
    return this.clientRepository.save(client);

  }

  async remove(id: number): Promise<{message: string}> {
    const client = await this.clientRepository.findOne({ where: { id: id.toString() } });
    
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    await this.clientRepository.remove(client);
    return { message: 'Client removed successfully' };
  }
}
