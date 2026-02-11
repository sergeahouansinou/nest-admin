import { ApiProperty } from '@nestjs/swagger'

export class ImageCaptcha {
  @ApiProperty({ description: 'Image SVG au format base64' })
  img: string

  @ApiProperty({ description: 'ID unique correspondant au captcha' })
  id: string
}

export class LoginToken {
  @ApiProperty({ description: 'Token d\'identité JWT' })
  token: string
}
