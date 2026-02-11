import { DynamicModule, ExistingProvider, Module } from '@nestjs/common'

import { LogModule } from '~/modules/system/log/log.module'
import { SystemModule } from '~/modules/system/system.module'

import { EmailJob } from './jobs/email.job'
import { HttpRequestJob } from './jobs/http-request.job'
import { LogClearJob } from './jobs/log-clear.job'

const providers = [LogClearJob, HttpRequestJob, EmailJob]

/**
 * auto create alias
 * {
 *    provide: 'LogClearMissionService',
 *    useExisting: LogClearMissionService,
 *  }
 */
function createAliasProviders(): ExistingProvider[] {
  const aliasProviders: ExistingProvider[] = []
  for (const p of providers) {
    aliasProviders.push({
      provide: p.name,
      useExisting: p,
    })
  }
  return aliasProviders
}

/**
 * Toutes les tâches planifiées à exécuter doivent être enregistrées ici
 */
@Module({})
export class TasksModule {
  static forRoot(): DynamicModule {
    // Utiliser Alias pour définir des alias, permettant d'obtenir les Services définis par type chaîne, sinon impossible de les obtenir
    const aliasProviders = createAliasProviders()
    return {
      global: true,
      module: TasksModule,
      imports: [SystemModule, LogModule],
      providers: [...providers, ...aliasProviders],
      exports: aliasProviders,
    }
  }
}
