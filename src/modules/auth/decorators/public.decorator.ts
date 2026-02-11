import { SetMetadata } from '@nestjs/common'

import { PUBLIC_KEY } from '../auth.constant'

/**
 * Ajouter ce décorateur lorsque l'interface n'a pas besoin de vérifier la connexion de l'utilisateur
 */
export const Public = () => SetMetadata(PUBLIC_KEY, true)
