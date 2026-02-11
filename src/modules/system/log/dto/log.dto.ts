import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsOptional, IsString } from 'class-validator'

import { PagerDto } from '~/common/dto/pager.dto'

export class LoginLogQueryDto extends PagerDto {
  @ApiProperty({ description: 'Nom d\'utilisateur' })
  @IsString()
  @IsOptional()
  username: string

  @ApiProperty({ description: 'IP de connexion' })
  @IsOptional()
  @IsString()
  ip?: string

  @ApiProperty({ description: 'Lieu de connexion' })
  @IsOptional()
  @IsString()
  address?: string

  @ApiProperty({ description: 'Heure de connexion' })
  @IsOptional()
  @IsArray()
  time?: string[]
}

export class TaskLogQueryDto extends PagerDto {
  @ApiProperty({ description: 'Nom d\'utilisateur' })
  @IsOptional()
  @IsString()
  username: string

  @ApiProperty({ description: 'IP de connexion' })
  @IsString()
  @IsOptional()
  ip?: string

  @ApiProperty({ description: 'Heure de connexion' })
  @IsOptional()
  time?: string[]
}

export class CaptchaLogQueryDto extends PagerDto {
  @ApiProperty({ description: 'Nom d\'utilisateur' })
  @IsOptional()
  @IsString()
  username: string

  @ApiProperty({ description: 'Code de vérification' })
  @IsString()
  @IsOptional()
  code?: string

  @ApiProperty({ description: 'Heure d\'envoi' })
  @IsOptional()
  time?: string[]
}
