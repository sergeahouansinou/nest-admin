import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator'
import { isEmpty } from 'lodash'

import { PagerDto } from '~/common/dto/pager.dto'

export class UserDto {
  @ApiProperty({ description: 'Avatar' })
  @IsOptional()
  @IsString()
  avatar?: string

  @ApiProperty({ description: 'Identifiant de connexion', example: 'admin' })
  @IsString()
  @Matches(/^[\s\S]+$/)
  @MinLength(4)
  @MaxLength(20)
  username: string

  @ApiProperty({ description: 'Mot de passe de connexion', example: 'a123456' })
  @IsOptional()
  @Matches(/^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i, {
    message: 'Le mot de passe doit contenir des chiffres et des lettres, longueur de 6 à 16',
  })
  password: string

  @ApiProperty({ description: 'Rôles attribués', type: [Number] })
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  roleIds: number[]

  @ApiProperty({ description: 'Département attribué', type: Number })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  deptId?: number

  @ApiProperty({ description: 'Surnom', example: 'admin' })
  @IsOptional()
  @IsString()
  nickname: string

  @ApiProperty({ description: 'E-mail', example: 'bqy.dev@qq.com' })
  @IsEmail()
  @ValidateIf(o => !isEmpty(o.email))
  email: string

  @ApiProperty({ description: 'Numéro de téléphone' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({ description: 'QQ' })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d{4,10}$/)
  @MinLength(5)
  @MaxLength(11)
  qq?: string

  @ApiProperty({ description: 'Remarque' })
  @IsOptional()
  @IsString()
  remark?: string

  @ApiProperty({ description: 'Statut' })
  @IsIn([0, 1])
  status: number
}

export class UserUpdateDto extends PartialType(UserDto) {}

export class UserQueryDto extends IntersectionType(PagerDto<UserDto>, PartialType(UserDto)) {
  @ApiProperty({ description: 'Département attribué', example: 1, required: false })
  @IsInt()
  @IsOptional()
  deptId?: number

  @ApiProperty({ description: 'Statut', example: 0, required: false })
  @IsInt()
  @IsOptional()
  status?: number
}
