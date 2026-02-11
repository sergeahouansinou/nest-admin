import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity } from 'typeorm'

import { CommonEntity } from '~/common/entity/common.entity'

@Entity({ name: 'sys_task' })
export class TaskEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  @ApiProperty({ description: 'Nom de la tâche' })
  name: string

  @Column()
  @ApiProperty({ description: 'Identifiant de la tâche' })
  service: string

  @Column({ type: 'tinyint', default: 0 })
  @ApiProperty({ description: 'Type de tâche : 0 cron, 1 intervalle' })
  type: number

  @Column({ type: 'tinyint', default: 1 })
  @ApiProperty({ description: 'Statut de la tâche : 0 désactivé, 1 activé' })
  status: number

  @Column({ name: 'start_time', type: 'datetime', nullable: true })
  @ApiProperty({ description: 'Heure de début' })
  startTime: Date

  @Column({ name: 'end_time', type: 'datetime', nullable: true })
  @ApiProperty({ description: 'Heure de fin' })
  endTime: Date

  @Column({ type: 'int', nullable: true, default: 0 })
  @ApiProperty({ description: 'Durée de l\'intervalle' })
  limit: number

  @Column({ nullable: true })
  @ApiProperty({ description: 'Expression cron' })
  cron: string

  @Column({ type: 'int', nullable: true })
  @ApiProperty({ description: 'Nombre d\'exécutions' })
  every: number

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'Paramètres de la tâche' })
  data: string

  @Column({ name: 'job_opts', type: 'text', nullable: true })
  @ApiProperty({ description: 'Configuration de la tâche' })
  jobOpts: string

  @Column({ nullable: true })
  @ApiProperty({ description: 'Description de la tâche' })
  remark: string
}
