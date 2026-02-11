import { ApiProperty } from '@nestjs/swagger'

export class LoginLogInfo {
  @ApiProperty({ description: 'Numéro du journal' })
  id: number

  @ApiProperty({ description: 'IP de connexion', example: '1.1.1.1' })
  ip: string

  @ApiProperty({ description: 'Adresse de connexion' })
  address: string

  @ApiProperty({ description: 'Système', example: 'Windows 10' })
  os: string

  @ApiProperty({ description: 'Navigateur', example: 'Chrome' })
  browser: string

  @ApiProperty({ description: 'Nom d\'utilisateur de connexion', example: 'admin' })
  username: string

  @ApiProperty({ description: 'Heure de connexion', example: '2023-12-22 16:46:20.333843' })
  time: string
}

export class TaskLogInfo {
  @ApiProperty({ description: 'Numéro du journal' })
  id: number

  @ApiProperty({ description: 'Numéro de la tâche' })
  taskId: number

  @ApiProperty({ description: 'Nom de la tâche' })
  name: string

  @ApiProperty({ description: 'Date de création' })
  createdAt: string

  @ApiProperty({ description: 'Temps consommé' })
  consumeTime: number

  @ApiProperty({ description: 'Informations d\'exécution' })
  detail: string

  @ApiProperty({ description: 'Statut d\'exécution de la tâche' })
  status: number
}
