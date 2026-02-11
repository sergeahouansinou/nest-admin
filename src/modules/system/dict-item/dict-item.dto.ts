import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator'

import { PagerDto } from '~/common/dto/pager.dto'

import { DictItemEntity } from './dict-item.entity'

export class DictItemDto extends PartialType(DictItemEntity) {
  @ApiProperty({ description: 'ID du type de dictionnaire' })
  @IsInt()
  typeId: number

  @ApiProperty({ description: 'Nom de clé de l\'élément de dictionnaire' })
  @IsString()
  @MinLength(1)
  label: string

  @ApiProperty({ description: 'Valeur de l\'élément de dictionnaire' })
  @IsString()
  @MinLength(1)
  value: string

  @ApiProperty({ description: 'Statut' })
  @IsOptional()
  @IsInt()
  status?: number

  @ApiProperty({ description: 'Remarque' })
  @IsOptional()
  @IsString()
  remark?: string
}

export class DictItemQueryDto extends PagerDto {
  @ApiProperty({ description: 'ID du type de dictionnaire', required: true })
  @IsInt()
  typeId: number

  @ApiProperty({ description: 'Nom de clé de l\'élément de dictionnaire' })
  @IsString()
  @IsOptional()
  label?: string

  @ApiProperty({ description: 'Valeur de l\'élément de dictionnaire' })
  @IsString()
  @IsOptional()
  value?: string
}
