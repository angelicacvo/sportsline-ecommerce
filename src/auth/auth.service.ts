import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // ---------------------------
  // VALIDAR USUARIO
  // ---------------------------
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return user;
  }

  // ---------------------------
  // LOGIN
  // ---------------------------
  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      message: 'Login exitoso',
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
      refresh_token: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
      user,
    };
  }

  // ---------------------------
  // REFRESH TOKEN
  // ---------------------------
  async refreshToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
    };
  }

  // ---------------------------
  // REGISTRO
  // ---------------------------
  async register(data: any) {
    const { email, password, name, role } = data;

    // Verificar si el correo ya existe
    const userExist = await this.usersService.findByEmail(email);
    if (userExist) {
      throw new BadRequestException('El usuario ya existe');
    }

    // Hash de contraseña
    const hashedPass = await bcrypt.hash(password, 10);

    // Crear usuario en BD
    const newUser = await this.usersService.create({
      email,
      password: hashedPass,
      name,
      role: role ?? 'user', // por si no envía rol
    });

    // Garantizar estructura correcta
    const user = Array.isArray(newUser) ? newUser[0] : newUser;

    console.log('Usuario creado:', user);

    // Crear token después del registro
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      message: 'Usuario registrado correctamente',
      user,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
