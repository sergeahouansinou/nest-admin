import { ApiProperty } from '@nestjs/swagger'

export class StorageInfo {
  @ApiProperty({ description: 'ID du fichier' })
  id: number

  @ApiProperty({ description: 'Nom du fichier' })
  name: string

  @ApiProperty({ description: 'Extension du fichier' })
  extName: string

  @ApiProperty({ description: 'Chemin du fichier' })
  path: string

  @ApiProperty({ description: 'Type de fichier' })
  type: string

  @ApiProperty({ description: 'Taille' })
  size: string

  @ApiProperty({ description: 'Date de téléversement' })
  createdAt: string

  @ApiProperty({ description: 'Auteur du téléversement' })
  username: string
}
