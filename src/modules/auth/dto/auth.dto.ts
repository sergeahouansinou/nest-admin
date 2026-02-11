import { ApiProperty } from '@nestjs/swagger'

import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({ description: 'Numéro de téléphone/E-mail' })
  @IsString()
  @MinLength(4)
  username: string

  @ApiProperty({ description: 'Mot de passe', example: 'a123456' })
  @IsString()
  @Matches(/^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i)
  @MinLength(6)
  password: string

  @ApiProperty({ description: 'Identifiant du captcha' })
  @IsString()
  captchaId: string

  @ApiProperty({ description: 'Code de vérification saisi par l\'utilisateur' })
  @IsString()
  @MinLength(4)
  @MaxLength(4)
  verifyCode: string
}

export class RegisterDto {
  @ApiProperty({ description: 'Nom d\'utilisateur' })
  @IsString()
  username: string

  @ApiProperty({ description: 'Mot de passe' })
  @IsString()
  @Matches(/^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i)
  @MinLength(6)
  @MaxLength(16)
  password: string

  @ApiProperty({ description: 'Langue', examples: ['EN', 'ZH'] })
  @IsString()
  lang: string
}
