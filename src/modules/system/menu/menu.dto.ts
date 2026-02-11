import { ApiProperty, PartialType } from '@nestjs/swagger'
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator'

import { OperatorDto } from '~/common/dto/operator.dto'

enum MenuType {
  /** Menu */
  MENU = 0,
  /** Répertoire */
  MENU_GROUP = 1,
  /** Permission */
  PERMISSION = 2,
}

export class MenuDto extends OperatorDto {
  @ApiProperty({
    description: `
Type de menu :
- 0 : Menu
- 1 : Répertoire
- 2 : Permission   
    `,
    enum: MenuType,
  })
  @IsIn([0, 1, 2])
  type: MenuType

  @ApiProperty({ description: 'Menu parent' })
  @IsOptional()
  parentId: number

  @ApiProperty({ description: 'Nom du menu ou de la permission' })
  @IsString()
  @MinLength(2)
  name: string

  @ApiProperty({ description: 'Ordre de tri' })
  @IsInt()
  @Min(0)
  orderNo: number

  @ApiProperty({ description: 'Chemin de la route front-end' })
  // @Matches(/^[/]$/)
  @ValidateIf(o => o.type !== MenuType.PERMISSION)
  path: string

  @ApiProperty({ description: 'Lien externe', default: false })
  @ValidateIf(o => o.type !== MenuType.PERMISSION)
  @IsBoolean()
  isExt: boolean

  @ApiProperty({ description: 'Mode d\'ouverture du lien externe', default: 1 })
  @ValidateIf((o: MenuDto) => o.isExt)
  @IsIn([1, 2])
  extOpenMode: number

  @ApiProperty({ description: 'Affichage du menu', default: 1 })
  @ValidateIf((o: MenuDto) => o.type !== MenuType.PERMISSION)
  @IsIn([0, 1])
  show: number

  @ApiProperty({ description: 'Définir l\'élément de menu actif pour la route actuelle, généralement utilisé pour les pages de détail' })
  @ValidateIf((o: MenuDto) => o.type !== MenuType.PERMISSION && o.show === 0)
  @IsString()
  @IsOptional()
  activeMenu?: string

  @ApiProperty({ description: 'Activer le cache de page', default: 1 })
  @ValidateIf((o: MenuDto) => o.type === 1)
  @IsIn([0, 1])
  keepAlive: number

  @ApiProperty({ description: 'Statut', default: 1 })
  @IsIn([0, 1])
  status: number

  @ApiProperty({ description: 'Icône du menu' })
  @IsOptional()
  @ValidateIf((o: MenuDto) => o.type !== MenuType.PERMISSION)
  @IsString()
  icon?: string

  @ApiProperty({ description: 'Permission correspondante' })
  @ValidateIf((o: MenuDto) => o.type === MenuType.PERMISSION)
  @IsString()
  @IsOptional()
  permission: string

  @ApiProperty({ description: 'Chemin de route du menu ou lien externe' })
  @ValidateIf((o: MenuDto) => o.type !== MenuType.PERMISSION)
  @IsString()
  @IsOptional()
  component?: string
}

export class MenuUpdateDto extends PartialType(MenuDto) {}

export class MenuQueryDto extends PartialType(MenuDto) {}
