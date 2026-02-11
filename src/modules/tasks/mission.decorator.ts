import { SetMetadata } from '@nestjs/common'

export const MISSION_DECORATOR_KEY = 'decorator:mission'

/**
 * Marqueur de tâche planifiée, les tâches sans ce marqueur ne seront pas exécutées, garantissant l'exécution sécurisée des modules récupérés globalement
 */
export const Mission = () => SetMetadata(MISSION_DECORATOR_KEY, true)
