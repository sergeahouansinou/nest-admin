import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger'
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator'

import { OperatorDto } from '~/common/dto/operator.dto'
import { PagerDto } from '~/common/dto/pager.dto'
import { IsUnique } from '~/shared/database/constraints/unique.constraint'

import { RoleEntity } from './role.entity'

export class RoleDto extends OperatorDto {
  @ApiProperty({ description: 'Nom du rôle' })
  @IsString()
  @MinLength(2, { message: 'Le nom du rôle doit comporter au moins 2 caractères' })
  name: string

  @IsUnique({ entity: RoleEntity })
  @ApiProperty({ description: 'Identifiant du rôle' })
  @IsString()
  @Matches(/^[a-z0-9]+$/i, { message: 'La valeur du rôle ne peut contenir que des lettres et des chiffres' })
  @MinLength(2, { message: 'La valeur du rôle doit comporter au moins 2 caractères' })
  value: string

  @ApiProperty({ description: 'Remarque du rôle' })
  @IsString()
  @IsOptional()
  remark?: string

  @ApiProperty({ description: 'Statut' })
  @IsIn([0, 1])
  status: number

  @ApiProperty({ description: 'Identifiants des menus et permissions associés' })
  @IsOptional()
  @IsArray()
  menuIds?: number[]
}

export class RoleUpdateDto extends PartialType(RoleDto) {}

export class RoleQueryDto extends IntersectionType(PagerDto<RoleDto>, PartialType(RoleDto)) {
  @ApiProperty({ description: 'Nom du rôle', required: false })
  @IsString()
  name?: string

  @ApiProperty({ description: 'Valeur du rôle', required: false })
  @IsString()
  value: string
}
