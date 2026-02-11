import { SetMetadata } from '@nestjs/common'

export const BYPASS_KEY = Symbol('__bypass_key__')

/**
 * Ajouter ce décorateur lorsque la conversion au format de retour de base n'est pas nécessaire
 */
export function Bypass() {
  return SetMetadata(BYPASS_KEY, true)
}
