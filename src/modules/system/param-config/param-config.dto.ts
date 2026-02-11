import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, MinLength } from 'class-validator'

import { PagerDto } from '~/common/dto/pager.dto'
import { IsUnique } from '~/shared/database/constraints/unique.constraint'

import { ParamConfigEntity } from './param-config.entity'

export class ParamConfigDto {
  @ApiProperty({ description: 'Nom du paramètre' })
  @IsString()
  name: string

  @ApiProperty({ description: 'Nom de clé du paramètre' })
  @IsUnique({ entity: ParamConfigEntity, message: 'Ce nom de clé existe déjà' })
  @IsString()
  @MinLength(3)
  key: string

  @ApiProperty({ description: 'Valeur du paramètre' })
  @IsString()
  value: string

  @ApiProperty({ description: 'Remarque' })
  @IsOptional()
  @IsString()
  remark?: string
}

export class ParamConfigQueryDto extends PagerDto {
  @ApiProperty({ description: 'Nom du paramètre' })
  @IsString()
  @IsOptional()
  name: string
}
