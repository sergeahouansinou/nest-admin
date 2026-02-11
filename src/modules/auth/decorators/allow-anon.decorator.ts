import { SetMetadata } from '@nestjs/common'

import { ALLOW_ANON_KEY } from '../auth.constant'

/**
 * Ajouter ce décorateur lorsque l'interface n'a pas besoin de vérifier si l'utilisateur a les permissions d'opération
 */
export const AllowAnon = () => SetMetadata(ALLOW_ANON_KEY, true)
