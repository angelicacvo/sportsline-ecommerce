import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Delete,
  Param,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
  ApiExcludeEndpoint,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ApiKeyAuth } from '../decorators/api-key.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { GoogleOAuthGuard } from '../guards/google-oauth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Create a new account with email and password'
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      example1: {
        value: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        success: true,
        data: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
          createdAt: '2025-11-27T21:00:00.000Z'
        },
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation failed',
    schema: {
      example: {
        success: false,
        message: 'Email already exists',
        statusCode: 400,
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict - email already registered',
    schema: {
      example: {
        success: false,
        message: 'Email already exists',
        statusCode: 409,
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Login user and get JWT tokens',
    description: 'Authenticate with email and password. Returns accessToken and refreshToken. Test credentials: admin@sportsline.com/admin123'
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      admin: {
        value: {
          email: 'admin@sportsline.com',
          password: 'admin123'
        }
      },
      user: {
        value: {
          email: 'user@sportsline.com',
          password: 'user123'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in. Copy the accessToken and use it in Authorization header as Bearer token.',
    schema: {
      example: {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDAxNjAwfQ...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzcwMDAwMDAwfQ...',
          user: {
            id: '1',
            name: 'Admin User',
            email: 'admin@sportsline.com',
            role: 'admin'
          }
        },
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid credentials',
    schema: {
      example: {
        success: false,
        message: 'Invalid email or password',
        statusCode: 401,
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation failed',
    schema: {
      example: {
        success: false,
        message: 'email should not be empty, password should not be empty',
        statusCode: 400,
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Use the refreshToken from login response to get a new accessToken'
  })
  @ApiBody({
    type: RefreshTokenDto,
    examples: {
      example1: {
        value: {
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Token successfully refreshed. Use the new accessToken for subsequent requests.',
    schema: {
      example: {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDAxNjAwfQ...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzcwMDAwMDAwfQ...'
        },
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or expired refresh token',
    schema: {
      example: {
        success: false,
        message: 'Invalid refresh token',
        statusCode: 401,
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - missing refresh token',
    schema: {
      example: {
        success: false,
        message: 'refreshToken should not be empty',
        statusCode: 400,
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.authService.refreshToken(userId);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Retrieve authenticated user information. Requires valid JWT token in Authorization header.'
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '1',
          name: 'Admin User',
          email: 'admin@sportsline.com',
          role: 'admin',
          createdAt: '2025-11-27T21:00:00.000Z'
        },
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - missing or invalid JWT token',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized',
        statusCode: 401,
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - invalid token format',
    schema: {
      example: {
        success: false,
        message: 'Invalid token',
        statusCode: 403,
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT Bearer token from /auth/login',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  async getProfile(@CurrentUser('userId') userId: number) {
    return this.authService.getProfile(userId);
  }

  @Post('api-keys')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Create a new API key',
    description: 'Generate a new API key for programmatic access. Use x-api-key header to authenticate.'
  })
  @ApiBody({
    type: CreateApiKeyDto,
    examples: {
      example1: {
        value: {
          name: 'Production API Key',
          scopes: ['read', 'write']
        }
      },
      example2: {
        value: {
          name: 'Read-only API Key'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'API key created successfully. Save the key value - it will not be shown again.',
    schema: {
      example: {
        success: true,
        data: {
          id: '1',
          key: 'sk_live_abc123def456ghi789jkl',
          name: 'Production API Key',
          scopes: ['read', 'write'],
          createdAt: '2025-11-27T21:00:00.000Z',
          expiresAt: null
        },
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation failed',
    schema: {
      example: {
        success: false,
        message: 'name should not be empty',
        statusCode: 400,
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing JWT token',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized',
        statusCode: 401,
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  async createApiKey(
    @CurrentUser('userId') userId: string,
    @Body() createApiKeyDto: CreateApiKeyDto,
  ) {
    return this.authService.createApiKey(userId, createApiKeyDto);
  }

  @Get('api-keys')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'List all API keys for current user',
    description: 'Retrieve all API keys associated with the authenticated user. Key values are masked for security.'
  })
  @ApiResponse({
    status: 200,
    description: 'API keys retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: '1',
            key: 'sk_live_abc123***',
            name: 'Production API Key',
            scopes: ['read', 'write'],
            lastUsed: '2025-11-27T20:00:00.000Z',
            createdAt: '2025-11-20T10:00:00.000Z',
            expiresAt: null
          },
          {
            id: '2',
            key: 'sk_live_xyz789***',
            name: 'Development API Key',
            scopes: ['read'],
            lastUsed: null,
            createdAt: '2025-11-27T21:00:00.000Z',
            expiresAt: '2026-11-27T21:00:00.000Z'
          }
        ],
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized',
        statusCode: 401,
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  async listApiKeys(@CurrentUser('userId') userId: string) {
    return this.authService.listApiKeys(userId);
  }

  @Delete('api-keys/:id')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Revoke an API key',
    description: 'Permanently revoke an API key. Once revoked, it cannot be used for authentication.'
  })
  @ApiResponse({
    status: 200,
    description: 'API key revoked successfully',
    schema: {
      example: {
        success: true,
        message: 'API key revoked successfully',
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Not found - API key does not exist',
    schema: {
      example: {
        success: false,
        message: 'API key not found',
        statusCode: 404,
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized',
        statusCode: 401,
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  async revokeApiKey(
    @CurrentUser('userId') userId: string,
    @Param('id') keyId: string,
  ) {
    return this.authService.revokeApiKey(userId, keyId);
  }

  @Get('test-api-key')
  @ApiKeyAuth()
  @ApiSecurity('api-key')
  @ApiOperation({ 
    summary: 'Test endpoint with API key authentication',
    description: 'Verify that your API key is valid and working'
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key created with POST /auth/api-keys',
    example: 'sk_live_abc123def456ghi789jkl'
  })
  @ApiResponse({
    status: 200,
    description: 'API key is valid',
    schema: {
      example: {
        success: true,
        data: {
          message: 'API key valid',
          user: {
            id: '1',
            name: 'Admin User',
            email: 'admin@sportsline.com',
            role: 'admin'
          }
        },
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - missing or invalid API key',
    schema: {
      example: {
        success: false,
        message: 'Invalid API key',
        statusCode: 401,
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - API key has expired or been revoked',
    schema: {
      example: {
        success: false,
        message: 'API key has been revoked',
        statusCode: 403,
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  async testApiKey(@CurrentUser() user: any) {
    return { 
      success: true,
      data: {
        message: 'API key válida', 
        user 
      }
    };
  }

  @Get('google')
  @Public()
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ 
    summary: 'Initiate Google OAuth2 authentication',
    description: 'Redirects to Google login. After authentication, user is redirected to /auth/google/callback'
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Google OAuth consent screen',
  })
  @ApiExcludeEndpoint()
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @Public()
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ 
    summary: 'Google OAuth2 callback handler',
    description: 'Handles Google OAuth2 redirect. Returns JWT tokens after successful authentication.'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated with Google',
    schema: {
      example: {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@gmail.com',
            role: 'user'
          }
        },
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Google authentication failed',
    schema: {
      example: {
        success: false,
        message: 'Google authentication failed',
        statusCode: 401,
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiExcludeEndpoint()
  async googleAuthRedirect(@Req() req: any) {
    return this.authService.googleLogin(req);
  }
}
