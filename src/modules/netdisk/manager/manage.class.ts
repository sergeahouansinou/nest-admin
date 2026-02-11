import { ApiProperty } from '@nestjs/swagger'

export type FileType = 'file' | 'dir'

export class SFileInfo {
  @ApiProperty({ description: 'ID du fichier' })
  id: string

  @ApiProperty({ description: 'Type de fichier', enum: ['file', 'dir'] })
  type: FileType

  @ApiProperty({ description: 'Nom du fichier' })
  name: string

  @ApiProperty({ description: 'Date d\'enregistrement', type: Date })
  putTime?: Date

  @ApiProperty({ description: 'Taille du fichier, en octets' })
  fsize?: string

  @ApiProperty({ description: 'Type mime du fichier' })
  mimeType?: string

  @ApiProperty({ description: 'Répertoire d\'appartenance' })
  belongTo?: string
}

export class SFileList {
  @ApiProperty({ description: 'Liste des fichiers', type: [SFileInfo] })
  list: SFileInfo[]

  @ApiProperty({ description: 'Marqueur de pagination, vide signifie chargement terminé' })
  marker?: string
}

export class UploadToken {
  @ApiProperty({ description: 'Token de téléversement' })
  token: string
}

export class SFileInfoDetail {
  @ApiProperty({ description: 'Taille du fichier, type int64, en octets (Byte)' })
  fsize: number

  @ApiProperty({ description: 'Valeur HASH du fichier' })
  hash: string

  @ApiProperty({ description: 'Type MIME du fichier, type string' })
  mimeType: string

  @ApiProperty({
    description:
      'Type de stockage du fichier, 2 représente le stockage d\'archives, 1 le stockage basse fréquence, 0 le stockage standard.',
  })
  type: number

  @ApiProperty({ description: 'Date de téléversement du fichier', type: Date })
  putTime: Date

  @ApiProperty({ description: 'Valeur md5 du fichier' })
  md5: string

  @ApiProperty({ description: 'Auteur du téléversement' })
  uploader: string

  @ApiProperty({ description: 'Remarque du fichier' })
  mark?: string
}
