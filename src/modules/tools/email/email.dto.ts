import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString } from 'class-validator'

/**
 * Envoi d'e-mail
 */
export class EmailSendDto {
  @ApiProperty({ description: 'E-mail du destinataire' })
  @IsEmail()
  to: string

  @ApiProperty({ description: 'Sujet' })
  @IsString()
  subject: string

  @ApiProperty({ description: 'Contenu' })
  @IsString()
  content: string
}
