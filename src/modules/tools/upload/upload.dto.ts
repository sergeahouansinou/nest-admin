import { MultipartFile } from '@fastify/multipart'
import { ApiProperty } from '@nestjs/swagger'

import { IsDefined } from 'class-validator'

import { IsFile } from './file.constraint'

export class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Fichier' })
  @IsDefined()
  @IsFile(
    {
      mimetypes: [
        'image/png',
        'image/gif',
        'image/jpeg',
        'image/webp',
        'image/svg+xml',
      ],
      fileSize: 1024 * 1024 * 10,
    },
    {
      message: 'Le type de fichier est incorrect',
    },
  )
  file: MultipartFile
}
