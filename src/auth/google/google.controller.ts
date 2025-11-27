import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { GoogleAuthGuard } from './google.guard';

@Controller('auth/google')
export class GoogleController {
  constructor(private readonly authService: AuthService) {}

  // 1. Redirige al usuario a Google
  @Get()
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    return;
  }

  // 2. Google redirige aquí luego del login
  @Get('callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: any) {
    const user = req.user; // viene desde google.strategy.ts

    // Tu AuthService debe manejar login o registro
    const token = await this.authService.login(user);

    return {
      message: 'Login con Google exitoso',
      user,
      token,
    };
  }
}
