import { Controller, Get, Param, Post, Body, Patch, Delete, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from '../../../users/dto/createUser.dto';
import { UpdateUserDto } from '../../../users/dto/updateUser.dto';
import { Roles } from '../../decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Roles('admin')
@Controller('users')
export class UsersController {
  constructor(@Inject('USERS_SERVICE') private readonly usersClient: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'List users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Array of users returned.' })
  findAll() {
    return this.usersClient.send({ cmd: 'users.findAll' }, {});
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id (Admin only)' })
  @ApiResponse({ status: 200, description: 'User found.' })
  findOne(@Param('id') id: string) {
    return this.usersClient.send({ cmd: 'users.findOne' }, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created.' })
  create(@Body() dto: CreateUserDto) {
    return this.usersClient.send({ cmd: 'users.create' }, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated.' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersClient.send({ cmd: 'users.update' }, { id, dto });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User removed.' })
  remove(@Param('id') id: string) {
    return this.usersClient.send({ cmd: 'users.remove' }, id);
  }
}
