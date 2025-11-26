import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(
      body.email,
      body.password,
    );
    return this.authService.login(user);
  }
@Post('register')
async register(@Body() body: any) {
  return this.authService.register(body);
}

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@Req() req) {
    return this.authService.refreshToken(req.user);
  }
}
