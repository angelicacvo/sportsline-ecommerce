import { Controller, Get, Param, Post, Body, Patch, Delete, Inject, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery, ApiParam, ApiHeader } from '@nestjs/swagger';
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
  @ApiOperation({ 
    summary: 'Get all users (Admin only)',
    description: 'Retrieve a paginated list of all users with optional filtering and search'
  })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of users to skip' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of users to return' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or email' })
  @ApiQuery({ name: 'role', required: false, type: String, description: 'Filter by role (admin, user, moderator)' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of users retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: '1',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            createdAt: '2025-11-27T21:00:00.000Z'
          }
        ],
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT Bearer token with admin role',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    return this.usersClient.send({ cmd: 'users.findAll' }, { skip, take, search, role });
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get user by ID (Admin only)',
    description: 'Retrieve detailed information about a specific user'
  })
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User found',
    schema: {
      example: {
        success: true,
        data: {
          id: '1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          avatar: null,
          emailVerified: true,
          isActive: true,
          createdAt: '2025-11-27T21:00:00.000Z',
          lastLogin: '2025-11-27T20:30:00.000Z'
        },
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  findOne(@Param('id') id: string) {
    return this.usersClient.send({ cmd: 'users.findOne' }, id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create user (Admin only)',
    description: 'Create a new user account with email and password'
  })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      example1: {
        value: {
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user'
        }
      },
      example2: {
        value: {
          email: 'moderator@example.com',
          password: 'SecurePass123!',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'moderator'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '2',
          email: 'newuser@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          createdAt: '2025-11-27T21:00:00.000Z'
        },
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'Conflict - email already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  create(@Body() dto: CreateUserDto) {
    return this.usersClient.send({ cmd: 'users.create' }, dto);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update user (Admin only)',
    description: 'Update user information including role, status, and profile data'
  })
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      example1: {
        value: {
          firstName: 'Updated',
          lastName: 'Name',
          role: 'admin'
        }
      },
      example2: {
        value: {
          isActive: false
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User updated successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '1',
          email: 'admin@example.com',
          firstName: 'Updated',
          lastName: 'Name',
          role: 'admin'
        },
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersClient.send({ cmd: 'users.update' }, { id, dto });
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete user (Admin only)',
    description: 'Permanently delete a user account'
  })
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'User deleted successfully',
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  remove(@Param('id') id: string) {
    return this.usersClient.send({ cmd: 'users.remove' }, id);
  }
}
