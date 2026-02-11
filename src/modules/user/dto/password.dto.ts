import { ApiProperty } from '@nestjs/swagger'
import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class PasswordUpdateDto {
  @ApiProperty({ description: 'Ancien mot de passe' })
  @IsString()
  @Matches(/^[\s\S]+$/)
  @MinLength(6)
  @MaxLength(20)
  oldPassword: string

  @ApiProperty({ description: 'Nouveau mot de passe' })
  @Matches(/^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i, {
    message: 'Le mot de passe doit contenir des chiffres et des lettres, longueur de 6 à 16',
  })
  newPassword: string
}

export class UserPasswordDto {
  // @ApiProperty({ description: 'ID administrateur/utilisateur' })
  // @IsEntityExist(UserEntity, { message: 'L\'utilisateur n\'existe pas' })
  // @IsInt()
  // id: number

  @ApiProperty({ description: 'Mot de passe modifié' })
  @Matches(/^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i, {
    message: 'Le format du mot de passe est incorrect',
  })
  password: string
}

export class UserExistDto {
  @ApiProperty({ description: 'Identifiant de connexion' })
  @IsString()
  @Matches(/^[\w-]{4,16}$/)
  @MinLength(6)
  @MaxLength(20)
  username: string
}
