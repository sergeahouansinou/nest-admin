import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { Column, Entity, JoinTable, ManyToMany, Relation } from 'typeorm'

import { CompleteEntity } from '~/common/entity/common.entity'

import { UserEntity } from '../../user/user.entity'
import { MenuEntity } from '../menu/menu.entity'

@Entity({ name: 'sys_role' })
export class RoleEntity extends CompleteEntity {
  @Column({ length: 50, unique: true })
  @ApiProperty({ description: 'Nom du rôle' })
  name: string

  @Column({ unique: true, comment: 'Identifiant du rôle' })
  @ApiProperty({ description: 'Identifiant du rôle' })
  value: string

  @Column({ nullable: true })
  @ApiProperty({ description: 'Description du rôle' })
  remark: string

  @Column({ type: 'tinyint', nullable: true, default: 1 })
  @ApiProperty({ description: 'Statut : 1 activé, 0 désactivé' })
  status: number

  @Column({ nullable: true })
  @ApiProperty({ description: 'Utilisateur par défaut' })
  default: boolean

  @ApiHideProperty()
  @ManyToMany(() => UserEntity, user => user.roles)
  users: Relation<UserEntity[]>

  @ApiHideProperty()
  @ManyToMany(() => MenuEntity, menu => menu.roles, {})
  @JoinTable({
    name: 'sys_role_menus',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'menu_id', referencedColumnName: 'id' },
  })
  menus: Relation<MenuEntity[]>
}
