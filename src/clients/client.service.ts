import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
  ) {}

  create(dto: CreateClientDto) {
    const client = this.clientRepo.create(dto);
    return this.clientRepo.save(client);
  }

  findAll() {
    return this.clientRepo.find();
  }

  findOne(id: number) {
    return this.clientRepo.findOneBy({ id });
  }

  update(id: number, dto: UpdateClientDto) {
    return this.clientRepo.update(id, { ...dto });
  }

  remove(id: number) {
    return this.clientRepo.delete(id);
  }
}
