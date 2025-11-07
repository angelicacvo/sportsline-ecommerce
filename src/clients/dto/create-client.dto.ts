import { IsNotEmpty, IsEmail } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  phone: number;
}
