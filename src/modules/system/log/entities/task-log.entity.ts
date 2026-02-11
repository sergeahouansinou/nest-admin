import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm'

import { CommonEntity } from '~/common/entity/common.entity'

import { TaskEntity } from '../../task/task.entity'

@Entity({ name: 'sys_task_log' })
export class TaskLogEntity extends CommonEntity {
  @Column({ type: 'tinyint', default: 0 })
  @ApiProperty({ description: 'Statut de la tâche : 0 échoué, 1 réussi' })
  status: number

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'Informations du journal de la tâche' })
  detail: string

  @Column({ type: 'int', nullable: true, name: 'consume_time', default: 0 })
  @ApiProperty({ description: 'Temps consommé par la tâche' })
  consumeTime: number

  @ManyToOne(() => TaskEntity)
  @JoinColumn({ name: 'task_id' })
  task: Relation<TaskEntity>
}
