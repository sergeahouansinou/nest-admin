import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsEmail,
  IsInt,
  IsMobilePhone,
  IsOptional,
  IsString,
} from 'class-validator'

export class ImageCaptchaDto {
  @ApiProperty({
    required: false,
    default: 100,
    description: 'Largeur du captcha',
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly width: number = 100

  @ApiProperty({
    required: false,
    default: 50,
    description: 'Hauteur du captcha',
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly height: number = 50
}

export class SendEmailCodeDto {
  @ApiProperty({ description: 'E-mail' })
  @IsEmail({}, { message: 'Format d\'e-mail incorrect' })
  email: string
}

export class SendSmsCodeDto {
  @ApiProperty({ description: 'Numéro de téléphone' })
  @IsMobilePhone('zh-CN', {}, { message: 'Format de numéro de téléphone incorrect' })
  phone: string
}

export class CheckCodeDto {
  @ApiProperty({ description: 'Numéro de téléphone/E-mail' })
  @IsString()
  account: string

  @ApiProperty({ description: 'Code de vérification' })
  @IsString()
  code: string
}
