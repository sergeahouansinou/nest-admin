import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger'
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'

import { MenuEntity } from '~/modules/system/menu/menu.entity'

export class AccountUpdateDto {
  @ApiProperty({ description: 'Surnom de l\'utilisateur' })
  @IsString()
  @IsOptional()
  nickname: string

  @ApiProperty({ description: 'E-mail de l\'utilisateur' })
  @IsOptional()
  @IsEmail()
  email: string

  @ApiProperty({ description: 'QQ de l\'utilisateur' })
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  @MinLength(5)
  @MaxLength(11)
  qq: string

  @ApiProperty({ description: 'Numéro de téléphone de l\'utilisateur' })
  @IsOptional()
  @IsString()
  phone: string

  @ApiProperty({ description: 'Avatar de l\'utilisateur' })
  @IsOptional()
  @IsString()
  avatar: string

  @ApiProperty({ description: 'Remarque de l\'utilisateur' })
  @IsOptional()
  @IsString()
  remark: string
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token temporaire', example: 'uuid' })
  @IsString()
  accessToken: string

  @ApiProperty({ description: 'Mot de passe', example: 'a123456' })
  @IsString()
  @Matches(/^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i)
  @MinLength(6)
  password: string
}

export class MenuMeta extends PartialType(OmitType(MenuEntity, ['parentId', 'createdAt', 'updatedAt', 'id', 'roles', 'path', 'name'] as const)) {
  title: string
}
export class AccountMenus extends PickType(MenuEntity, ['id', 'path', 'name', 'component'] as const) {
  meta: MenuMeta
}
