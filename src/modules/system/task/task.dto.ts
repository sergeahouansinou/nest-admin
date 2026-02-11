import { BadRequestException } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptional, IntersectionType, PartialType } from '@nestjs/swagger'
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  Validate,
  ValidateIf,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { CronExpressionParser } from 'cron-parser'
import { isEmpty } from 'lodash'

import { PagerDto } from '~/common/dto/pager.dto'
import { IsUnique } from '~/shared/database/constraints/unique.constraint'

import { TaskEntity } from './task.entity'

// Validation d'expression cron, référencée depuis cron-parser dans la bibliothèque bull
@ValidatorConstraint({ name: 'isCronExpression', async: false })
export class IsCronExpression implements ValidatorConstraintInterface {
  validate(value: string, _args: ValidationArguments) {
    try {
      if (isEmpty(value))
        throw new BadRequestException('cron expression is empty')

      CronExpressionParser.parse(value)
      return true
    }
    catch (e) {
      return false
    }
  }

  defaultMessage(_args: ValidationArguments) {
    return 'this cron expression ($value) invalid'
  }
}

export class TaskDto {
  @ApiProperty({ description: 'Nom de la tâche' })
  @IsUnique({ entity: TaskEntity, message: 'Le nom de la tâche existe déjà' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string

  @ApiProperty({ description: 'Service appelé' })
  @IsString()
  @MinLength(1)
  service: string

  @ApiProperty({ description: 'Type de tâche : cron | interval' })
  @IsIn([0, 1])
  type: number

  @ApiProperty({ description: 'Statut de la tâche' })
  @IsIn([0, 1])
  status: number

  @ApiPropertyOptional({ description: 'Heure de début', type: Date })
  @IsDateString()
  @ValidateIf(o => !isEmpty(o.startTime))
  startTime: string

  @ApiPropertyOptional({ description: 'Heure de fin', type: Date })
  @IsDateString()
  @ValidateIf(o => !isEmpty(o.endTime))
  endTime: string

  @ApiPropertyOptional({
    description: 'Limite du nombre d\'exécutions, négatif pour illimité',
  })
  @IsOptional()
  @IsInt()
  limit?: number = -1

  @ApiProperty({ description: 'Expression cron' })
  @Validate(IsCronExpression)
  @ValidateIf(o => o.type === 0)
  cron: string

  @ApiProperty({ description: 'Intervalle d\'exécution, en millisecondes' })
  @IsInt()
  @Min(100)
  @ValidateIf(o => o.type === 1)
  every?: number

  @ApiPropertyOptional({ description: 'Paramètres d\'exécution' })
  @IsOptional()
  @IsString()
  data?: string

  @ApiPropertyOptional({ description: 'Remarque de la tâche' })
  @IsOptional()
  @IsString()
  remark?: string
}

export class TaskUpdateDto extends PartialType(TaskDto) {}

export class TaskQueryDto extends IntersectionType(PagerDto, PartialType(TaskDto)) {}
