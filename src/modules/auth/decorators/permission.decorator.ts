import { applyDecorators, SetMetadata } from '@nestjs/common'

import { isPlainObject } from 'lodash'

import { PERMISSION_KEY } from '../auth.constant'

 type TupleToObject<T extends string, P extends ReadonlyArray<string>> = {
   [K in Uppercase<P[number]>]: `${T}:${Lowercase<K>}`
 }
 type AddPrefixToObjectValue<T extends string, P extends Record<string, string>> = {
   [K in keyof P]: K extends string ? `${T}:${P[K]}` : never
 }

/** Les opérations sur les ressources nécessitent des permissions spécifiques */
export function Perm(permission: string | string[]) {
  return applyDecorators(SetMetadata(PERMISSION_KEY, permission))
}

/** (Optionnel) Enregistrer toutes les permissions définies via definePermission, utilisable pour les indications de type TypeScript lors du développement frontend, afin d'éviter les incohérences entre les définitions de permissions frontend et backend */
let permissions: string[] = []
/**
 * Définir les permissions et collecter toutes les permissions définies
 *
 * - Définition sous forme d'objet, ex :
 * ```ts
 * definePermission('app:health', {
 *  NETWORK: 'network'
 * };
 * ```
 *
 * - Définition sous forme de tableau de chaînes, ex :
 * ```ts
 * definePermission('app:health', ['network']);
 * ```
 */
export function definePermission<T extends string, U extends Record<string, string>>(modulePrefix: T, actionMap: U): AddPrefixToObjectValue<T, U>
export function definePermission<T extends string, U extends ReadonlyArray<string>>(modulePrefix: T, actions: U): TupleToObject<T, U>
export function definePermission(modulePrefix: string, actions) {
  if (isPlainObject(actions)) {
    Object.entries(actions).forEach(([key, action]) => {
      actions[key] = `${modulePrefix}:${action}`
    })
    permissions = [...new Set([...permissions, ...Object.values<string>(actions)])]
    return actions
  }
  else if (Array.isArray(actions)) {
    const permissionFormats = actions.map(action => `${modulePrefix}:${action}`)
    permissions = [...new Set([...permissions, ...permissionFormats])]

    return actions.reduce((prev, action) => {
      prev[action.toUpperCase()] = `${modulePrefix}:${action}`
      return prev
    }, {})
  }
}

/** Obtenir toutes les permissions définies via definePermission */
export const getDefinePermissions = () => permissions
