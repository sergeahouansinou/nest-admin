import { ApiProperty } from '@nestjs/swagger'

export class SpaceInfo {
  @ApiProperty({ description: 'Jour X du mois en cours', type: [Number] })
  times: number[]

  @ApiProperty({ description: 'Capacité du jour correspondant, en octets', type: [Number] })
  datas: number[]
}

export class CountInfo {
  @ApiProperty({ description: 'Jour X du mois en cours', type: [Number] })
  times: number[]

  @ApiProperty({ description: 'Nombre de fichiers du jour correspondant', type: [Number] })
  datas: number[]
}

export class FlowInfo {
  @ApiProperty({ description: 'Jour X du mois en cours', type: [Number] })
  times: number[]

  @ApiProperty({ description: 'Trafic consommé du jour correspondant', type: [Number] })
  datas: number[]
}

export class HitInfo {
  @ApiProperty({ description: 'Jour X du mois en cours', type: [Number] })
  times: number[]

  @ApiProperty({ description: 'Nombre de requêtes Get du jour correspondant', type: [Number] })
  datas: number[]
}

export class OverviewSpaceInfo {
  @ApiProperty({ description: 'Capacité utilisée actuelle' })
  spaceSize: number

  @ApiProperty({ description: 'Nombre de fichiers actuel' })
  fileSize: number

  @ApiProperty({ description: 'Trafic utilisé aujourd\'hui' })
  flowSize: number

  @ApiProperty({ description: 'Nombre de requêtes aujourd\'hui' })
  hitSize: number

  @ApiProperty({ description: 'Tendance du trafic, calculée à partir du 1er du mois en cours', type: FlowInfo })
  flowTrend: FlowInfo

  @ApiProperty({ description: 'Tendance de la capacité, calculée à partir du 1er du mois en cours', type: SpaceInfo })
  sizeTrend: SpaceInfo
}
