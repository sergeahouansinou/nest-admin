import { ApiProperty } from '@nestjs/swagger'

export class Runtime {
  @ApiProperty({ description: 'Système' })
  os?: string

  @ApiProperty({ description: 'Architecture du serveur' })
  arch?: string

  @ApiProperty({ description: 'Version de Node' })
  nodeVersion?: string

  @ApiProperty({ description: 'Version de Npm' })
  npmVersion?: string
}

export class CoreLoad {
  @ApiProperty({ description: 'Consommation actuelle des ressources CPU' })
  rawLoad?: number

  @ApiProperty({ description: 'Ressources CPU actuellement inactives' })
  rawLoadIdle?: number
}

// Intel(R) Xeon(R) Platinum 8163 CPU @ 2.50GHz
export class Cpu {
  @ApiProperty({ description: 'Fabricant' })
  manufacturer?: string

  @ApiProperty({ description: 'Marque' })
  brand?: string

  @ApiProperty({ description: 'Nombre de cœurs physiques' })
  physicalCores?: number

  @ApiProperty({ description: 'Modèle' })
  model?: string

  @ApiProperty({ description: 'Vitesse en GHz' })
  speed?: number

  @ApiProperty({ description: 'Consommation des ressources CPU - ticks bruts' })
  rawCurrentLoad?: number

  @ApiProperty({ description: 'Ressources CPU inactives - ticks bruts' })
  rawCurrentLoadIdle?: number

  @ApiProperty({ description: 'Consommation des ressources CPU', type: [CoreLoad] })
  coresLoad?: CoreLoad[]
}

export class Disk {
  @ApiProperty({ description: 'Taille de l\'espace disque (bytes)' })
  size?: number

  @ApiProperty({ description: 'Espace disque utilisé (bytes)' })
  used?: number

  @ApiProperty({ description: 'Espace disque disponible (bytes)' })
  available?: number
}

export class Memory {
  @ApiProperty({ description: 'total memory in bytes' })
  total?: number

  @ApiProperty({ description: 'Mémoire disponible' })
  available?: number
}

/**
 * Informations système
 */
export class ServeStatInfo {
  @ApiProperty({ description: 'Environnement d\'exécution', type: Runtime })
  runtime?: Runtime

  @ApiProperty({ description: 'Informations CPU', type: Cpu })
  cpu?: Cpu

  @ApiProperty({ description: 'Informations disque', type: Disk })
  disk?: Disk

  @ApiProperty({ description: 'Informations mémoire', type: Memory })
  memory?: Memory
}
