import { Injectable } from '@nestjs/common'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { DataSource, ObjectType, Repository } from 'typeorm'

interface Condition {
  entity: ObjectType<any>
  // Si aucun champ n'est spécifié, utiliser la propriété en cours de validation comme critère de recherche
  field?: string
}

/**
 * Vérifier si la valeur d'un champ existe dans la table de données
 */
@ValidatorConstraint({ name: 'entityItemExist', async: true })
@Injectable()
export class EntityExistConstraint implements ValidatorConstraintInterface {
  constructor(private dataSource: DataSource) {}

  async validate(value: string, args: ValidationArguments) {
    let repo: Repository<any>

    if (!value)
      return true
    // Le champ de comparaison par défaut est id
    let field = 'id'
    // Obtenir le repository via l'entité transmise
    if ('entity' in args.constraints[0]) {
      // Un objet est transmis, le champ de comparaison peut être spécifié
      field = args.constraints[0].field ?? 'id'
      repo = this.dataSource.getRepository(args.constraints[0].entity)
    }
    else {
      // Une classe d'entité est transmise
      repo = this.dataSource.getRepository(args.constraints[0])
    }
    // Validation par vérification de l'existence de l'enregistrement
    const item = await repo.findOne({ where: { [field]: value } })
    return !!item
  }

  defaultMessage(args: ValidationArguments) {
    if (!args.constraints[0])
      return 'Model not been specified!'

    return `All instance of ${args.constraints[0].name} must been exists in databse!`
  }
}

/**
 * Validation de l'existence des données
 * @param entity Classe Entity ou objet de condition de validation
 * @param validationOptions
 */
function IsEntityExist(
  entity: ObjectType<any>,
  validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void

function IsEntityExist(
  condition: { entity: ObjectType<any>, field?: string },
  validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void

function IsEntityExist(
  condition: ObjectType<any> | { entity: ObjectType<any>, field?: string },
  validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void {
  return (object: Record<string, any>, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [condition],
      validator: EntityExistConstraint,
    })
  }
}

export { IsEntityExist }
