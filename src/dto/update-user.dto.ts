import { IsEmail, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe Updated', description: 'User name' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiPropertyOptional({ example: 'john.doe.updated@example.com', description: 'User email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 26, description: 'User age', minimum: 1, maximum: 150 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(150)
  age?: number;
}
