import { Body, Controller, HttpCode, HttpStatus, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './guards/auth.guard';
 
/**
 * @ApiTags() groups endpoints in Swagger UI
 * All endpoints in this controller will be grouped under "Authentication"
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * @ApiOperation() describes what the endpoint does
     * @ApiBody() specifies the request body structure
     * @ApiResponse() documents possible responses
     */
    @ApiOperation({ 
        summary: 'Register a new user',  // Short description
        description: 'Creates a new user account with email, password, and optional role. Returns a JWT access token upon successful registration.'
    })
    @ApiBody({
        description: 'User registration data',
        schema: {
            type: 'object',
            properties: {
                email: { 
                    type: 'string', 
                    example: 'user@example.com',
                    description: 'User email address'
                },
                password: { 
                    type: 'string', 
                    example: 'SecurePass123!',
                    description: 'User password (min 6 characters)'
                },
                role: { 
                    type: 'string', 
                    example: 'customer',
                    enum: ['admin', 'customer', 'seller'],
                    description: 'User role (optional, defaults to customer)'
                },
            },
            required: ['email', 'password']
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'User successfully registered',
        schema: {
            type: 'object',
            properties: {
                accessToken: { 
                    type: 'string', 
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'User already exists' })
    @HttpCode(HttpStatus.OK)
    @Post('register')
    async registerUser(@Body() body: { email: string; password: string; role: string }): Promise<{ accessToken: string }> {
        const { email, password, role } = body;
        return this.authService.registerUser(email, password, role);
    }

    @ApiOperation({ 
        summary: 'User login',
        description: 'Authenticates a user with email and password. Returns a JWT access token on success.'
    })
    @ApiBody({
        description: 'Login credentials',
        schema: {
            type: 'object',
            properties: {
                email: { 
                    type: 'string', 
                    example: 'user@example.com' 
                },
                password: { 
                    type: 'string', 
                    example: 'SecurePass123!' 
                },
            },
            required: ['email', 'password']
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully authenticated',
        schema: {
            type: 'object',
            properties: {
                accessToken: { type: 'string' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(@Body() signInDto: Record<string, string>): Promise<{ accessToken: string }> {
        const { email, password } = signInDto;
        return this.authService.signIn(email, password);
    }

    /**
     * @ApiBearerAuth() indicates this endpoint requires JWT authentication
     * Adds a lock icon in Swagger UI
     */
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Get current user profile',
        description: 'Returns the authenticated user\'s profile information. Requires valid JWT token.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'User profile retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                sub: { type: 'number', example: 1 },
                email: { type: 'string', example: 'user@example.com' },
                role: { type: 'string', example: 'customer' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

}
