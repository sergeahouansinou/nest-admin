import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator'

import { PagerDto } from '~/common/dto/pager.dto'

import { IsUnique } from '~/shared/database/constraints/unique.constraint'

import { DictTypeEntity } from './dict-type.entity'

export class DictTypeDto extends PartialType(DictTypeEntity) {
  @ApiProperty({ description: 'Nom du type de dictionnaire' })
  @IsUnique({ entity: DictTypeEntity, message: 'Un dictionnaire avec le même nom existe déjà' })
  @IsString()
  @MinLength(1)
  name: string

  @ApiProperty({ description: 'Code du type de dictionnaire' })
  @IsUnique({ entity: DictTypeEntity, message: 'Un dictionnaire avec le même code existe déjà' })
  @IsString()
  @MinLength(3)
  code: string

  @ApiProperty({ description: 'Statut' })
  @IsOptional()
  @IsInt()
  status?: number

  @ApiProperty({ description: 'Remarque' })
  @IsOptional()
  @IsString()
  remark?: string
}

export class DictTypeQueryDto extends PagerDto {
  @ApiProperty({ description: 'Nom du type de dictionnaire' })
  @IsString()
  @IsOptional()
  name: string

  @ApiProperty({ description: 'Code du type de dictionnaire' })
  @IsString()
  @IsOptional()
  code: string
}
