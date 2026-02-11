import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, IsArray, IsOptional, IsString } from 'class-validator'

import { PagerDto } from '~/common/dto/pager.dto'

export class StoragePageDto extends PagerDto {
  @ApiProperty({ description: 'Nom du fichier' })
  @IsOptional()
  @IsString()
  name: string

  @ApiProperty({ description: 'Extension du fichier' })
  @IsString()
  @IsOptional()
  extName: string

  @ApiProperty({ description: 'Type de fichier' })
  @IsString()
  @IsOptional()
  type: string

  @ApiProperty({ description: 'Taille' })
  @IsString()
  @IsOptional()
  size: string

  @ApiProperty({ description: 'Date de téléversement' })
  @IsOptional()
  time: string[]

  @ApiProperty({ description: 'Auteur du téléversement' })
  @IsString()
  @IsOptional()
  username: string
}

export class StorageCreateDto {
  @ApiProperty({ description: 'Nom du fichier' })
  @IsString()
  name: string

  @ApiProperty({ description: 'Nom réel du fichier' })
  @IsString()
  fileName: string

  @ApiProperty({ description: 'Extension du fichier' })
  @IsString()
  extName: string

  @ApiProperty({ description: 'Chemin du fichier' })
  @IsString()
  path: string

  @ApiProperty({ description: 'Chemin du fichier' })
  @IsString()
  type: string

  @ApiProperty({ description: 'Taille du fichier' })
  @IsString()
  size: string
}

export class StorageDeleteDto {
  @ApiProperty({ description: 'Liste des ID de fichiers à supprimer', type: [Number] })
  @IsArray()
  @ArrayNotEmpty()
  ids: number[]
}
