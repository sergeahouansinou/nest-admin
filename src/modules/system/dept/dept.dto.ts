import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator'

export class DeptDto {
  @ApiProperty({ description: 'Nom du département' })
  @IsString()
  @MinLength(1)
  name: string

  @ApiProperty({ description: 'ID du département parent' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  parentId: number

  @ApiProperty({ description: 'Numéro d\'ordre de tri', required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  orderNo: number
}

export class TransferDeptDto {
  @ApiProperty({ description: 'Liste des identifiants des administrateurs à transférer', type: [Number] })
  @IsArray()
  @ArrayNotEmpty()
  userIds: number[]

  @ApiProperty({ description: 'ID du département système de destination' })
  @IsInt()
  @Min(0)
  deptId: number
}

export class MoveDept {
  @ApiProperty({ description: 'ID du département actuel' })
  @IsInt()
  @Min(0)
  id: number

  @ApiProperty({ description: 'ID du département parent de destination' })
  @IsInt()
  @Min(0)
  @IsOptional()
  parentId: number
}

export class MoveDeptDto {
  @ApiProperty({ description: 'Liste des départements', type: [MoveDept] })
  @ValidateNested({ each: true })
  @Type(() => MoveDept)
  depts: MoveDept[]
}

export class DeptQueryDto {
  @ApiProperty({ description: 'Nom du département' })
  @IsString()
  @IsOptional()
  name?: string
}
