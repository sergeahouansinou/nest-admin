import { Injectable } from '@nestjs/common'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { isNil, merge } from 'lodash'
import { ClsService } from 'nestjs-cls'
import { DataSource, Not, ObjectType } from 'typeorm'

interface Condition {
  entity: ObjectType<any>
  /** Si aucun champ n'est spécifié, utiliser la propriété en cours de validation comme critère de recherche */
  field?: string
  /** Message d'erreur en cas d'échec de la validation */
  message?: string
}

/**
 * Vérification de l'unicité d'un champ
 */
@ValidatorConstraint({ name: 'entityItemUnique', async: true })
@Injectable()
export class UniqueConstraint implements ValidatorConstraintInterface {
  constructor(private dataSource: DataSource, private readonly cls: ClsService) {}

  async validate(value: any, args: ValidationArguments) {
    // Obtenir le modèle et le champ à valider
    const config: Omit<Condition, 'entity'> = {
      field: args.property,
    }

    const condition = ('entity' in args.constraints[0]
      ? merge(config, args.constraints[0])
      : {
          ...config,
          entity: args.constraints[0],
        }) as unknown as Required<Condition>

    if (!condition.entity)
      return false

    try {
      // Vérifier si les données existent déjà, si oui la validation échoue
      const repo = this.dataSource.getRepository(condition.entity)

      // Si aucun message d'erreur personnalisé n'est fourni, essayer d'obtenir le commentaire du champ comme indication
      if (!condition.message) {
        const targetColumn = repo.metadata.columns.find(n => n.propertyName === condition.field)
        if (targetColumn?.comment) {
          args.constraints[0].message = `Un(e) ${targetColumn.comment} identique existe déjà`
        }
      }

      let andWhere = {}
      const operateId = this.cls.get('operateId')
      // Si c'est une opération de modification, exclure l'élément lui-même
      if (Number.isInteger(operateId)) {
        andWhere = { id: Not(operateId) }
      }

      return isNil(
        await repo.findOne({
          where: { [condition.field]: value, ...andWhere },
        }),
      )
    }
    catch (err) {
      // Si une exception de base de données se produit, la validation échoue
      return false
    }
  }

  defaultMessage(args: ValidationArguments) {
    const { entity, field, message } = args.constraints[0] as Condition
    const queryProperty = field ?? args.property
    // if (!(args.object as any).getManager)
    //   return 'getManager function not been found!'

    if (!entity)
      return 'Model not been specified!'

    if (message) {
      return message
    }

    // return `${queryProperty} of ${entity.name} must been unique!`
    return `${queryProperty} of ${entity.name} must been unique!`
  }
}

/**
 * Validation de l'unicité des données
 * @param entity Classe Entity ou objet de condition de validation
 * @param validationOptions
 */
function IsUnique(
  entity: ObjectType<any>,
  validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void

function IsUnique(
  condition: Condition,
  validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void

function IsUnique(
  params: ObjectType<any> | Condition,
  validationOptions?: ValidationOptions,
) {
  return (object: Record<string, any>, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [params],
      validator: UniqueConstraint,
    })
  }
}

export { IsUnique }
