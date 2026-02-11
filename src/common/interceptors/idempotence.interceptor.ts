import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common'

import type { FastifyRequest } from 'fastify'
import {
  ConflictException,
  Injectable,
  SetMetadata,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { catchError, tap } from 'rxjs'

import { CacheService } from '~/shared/redis/cache.service'
import { hashString } from '~/utils'
import { getIp } from '~/utils/ip.util'
import { getRedisKey } from '~/utils/redis.util'

import { HTTP_IDEMPOTENCE_KEY, HTTP_IDEMPOTENCE_OPTIONS } from '../decorators/idempotence.decorator'

const IdempotenceHeaderKey = 'x-idempotence'

export interface IdempotenceOption {
  errorMessage?: string
  pendingMessage?: string

  /**
   * Si la requête est dupliquée, gérer l'exception manuellement
   */
  handler?: (req: FastifyRequest) => any

  /**
   * Durée d'enregistrement de la requête dupliquée
   * @default 60
   */
  expired?: number

  /**
   * Si le header ne contient pas de clé d'idempotence, méthode pour générer la clé à partir de la requête
   */
  generateKey?: (req: FastifyRequest) => string

  /**
   * Lire uniquement la clé du header, sans génération automatique
   * @default false
   */
  disableGenerateKey?: boolean
}

@Injectable()
export class IdempotenceInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly cacheService: CacheService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<FastifyRequest>()

    // Ignorer les requêtes Get
    if (request.method.toUpperCase() === 'GET')
      return next.handle()

    const handler = context.getHandler()
    const options: IdempotenceOption | undefined = this.reflector.get(
      HTTP_IDEMPOTENCE_OPTIONS,
      handler,
    )

    if (!options)
      return next.handle()

    const {
      errorMessage = 'Une requête identique réussie ne peut être envoyée qu\'une seule fois dans les 60 secondes',
      pendingMessage = 'Une requête identique est en cours de traitement...',
      handler: errorHandler,
      expired = 60,
      disableGenerateKey = false,
    } = options
    const redis = this.cacheService.getClient()

    const idempotence = request.headers[IdempotenceHeaderKey] as string
    const key = disableGenerateKey
      ? undefined
      : options.generateKey
        ? options.generateKey(request)
        : this.generateKey(request)

    const idempotenceKey
      = !!(idempotence || key) && getRedisKey(`idempotence:${idempotence || key}`)

    SetMetadata(HTTP_IDEMPOTENCE_KEY, idempotenceKey)(handler)

    if (idempotenceKey) {
      const resultValue: '0' | '1' | null = (await redis.get(
        idempotenceKey,
      )) as any
      if (resultValue !== null) {
        if (errorHandler)
          return await errorHandler(request)

        const message = {
          1: errorMessage,
          0: pendingMessage,
        }[resultValue]
        throw new ConflictException(message)
      }
      else {
        await redis.set(idempotenceKey, '0', 'EX', expired)
      }
    }
    return next.handle().pipe(
      tap(async () => {
        if (idempotenceKey) {
          await redis.set(idempotenceKey, '1', 'KEEPTTL')
        }
      }),
      catchError(async (err) => {
        if (idempotenceKey)
          await redis.del(idempotenceKey)

        throw err
      }),
    )
  }

  private generateKey(req: FastifyRequest) {
    const { body, params, query = {}, headers, url } = req

    const obj = { body, url, params, query } as any

    const uuid = headers['x-uuid']
    if (uuid) {
      obj.uuid = uuid
    }
    else {
      const ua = headers['user-agent']
      const ip = getIp(req)

      if (!ua && !ip)
        return undefined

      Object.assign(obj, { ua, ip })
    }

    return hashString(JSON.stringify(obj))
  }
}
