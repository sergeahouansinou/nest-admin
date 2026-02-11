import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Validate,
  ValidateIf,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { isEmpty } from 'lodash'

import { NETDISK_HANDLE_MAX_ITEM } from '~/constants/oss.constant'

@ValidatorConstraint({ name: 'IsLegalNameExpression', async: false })
export class IsLegalNameExpression implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    try {
      if (isEmpty(value))
        throw new Error('dir name is empty')

      if (value.includes('/'))
        throw new Error('dir name not allow /')

      return true
    }
    catch (e) {
      return false
    }
  }

  defaultMessage(_args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return 'file or dir name invalid'
  }
}

export class FileOpItem {
  @ApiProperty({ description: 'Type de fichier', enum: ['file', 'dir'] })
  @IsString()
  @Matches(/(^file$)|(^dir$)/)
  type: string

  @ApiProperty({ description: 'Nom du fichier' })
  @IsString()
  @IsNotEmpty()
  @Validate(IsLegalNameExpression)
  name: string
}

export class GetFileListDto {
  @ApiProperty({ description: 'Marqueur de pagination' })
  @IsOptional()
  @IsString()
  marker: string

  @ApiProperty({ description: 'Chemin actuel' })
  @IsString()
  path: string

  @ApiPropertyOptional({ description: 'Mot-clé de recherche' })
  @Validate(IsLegalNameExpression)
  @ValidateIf(o => !isEmpty(o.key))
  @IsString()
  key: string
}

export class MKDirDto {
  @ApiProperty({ description: 'Nom du dossier' })
  @IsNotEmpty()
  @IsString()
  @Validate(IsLegalNameExpression)
  dirName: string

  @ApiProperty({ description: 'Chemin d\'appartenance' })
  @IsString()
  path: string
}

export class RenameDto {
  @ApiProperty({ description: 'Type de fichier' })
  @IsString()
  @Matches(/(^file$)|(^dir$)/)
  type: string

  @ApiProperty({ description: 'Nouveau nom' })
  @IsString()
  @IsNotEmpty()
  @Validate(IsLegalNameExpression)
  toName: string

  @ApiProperty({ description: 'Nom original' })
  @IsString()
  @IsNotEmpty()
  @Validate(IsLegalNameExpression)
  name: string

  @ApiProperty({ description: 'Chemin' })
  @IsString()
  path: string
}

export class FileInfoDto {
  @ApiProperty({ description: 'Nom du fichier' })
  @IsString()
  @IsNotEmpty()
  @Validate(IsLegalNameExpression)
  name: string

  @ApiProperty({ description: 'Chemin du fichier' })
  @IsString()
  path: string
}

export class DeleteDto {
  @ApiProperty({ description: 'Fichiers ou dossiers à traiter', type: [FileOpItem] })
  @Type(() => FileOpItem)
  @ArrayMaxSize(NETDISK_HANDLE_MAX_ITEM)
  @ValidateNested({ each: true })
  files: FileOpItem[]

  @ApiProperty({ description: 'Répertoire' })
  @IsString()
  path: string
}

export class MarkFileDto {
  @ApiProperty({ description: 'Nom du fichier' })
  @IsString()
  @IsNotEmpty()
  @Validate(IsLegalNameExpression)
  name: string

  @ApiProperty({ description: 'Chemin du fichier' })
  @IsString()
  path: string

  @ApiProperty({ description: 'Informations de remarque' })
  @IsString()
  mark: string
}

export class FileOpDto {
  @ApiProperty({ description: 'Fichiers ou dossiers à traiter', type: [FileOpItem] })
  @Type(() => FileOpItem)
  @ArrayMaxSize(NETDISK_HANDLE_MAX_ITEM)
  @ValidateNested({ each: true })
  files: FileOpItem[]

  @ApiProperty({ description: 'Répertoire avant l\'opération' })
  @IsString()
  originPath: string

  @ApiProperty({ description: 'Répertoire après l\'opération' })
  @IsString()
  toPath: string
}
