import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { FastifyRequest } from 'fastify'

type Payload = keyof IAuthUser

/**
 * @description Obtenir les informations de l'utilisateur actuellement connecté et les attacher à la requête
 */
export const AuthUser = createParamDecorator(
  (data: Payload, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>()
    // auth guard will mount this
    const user = request.user as IAuthUser

    return data ? user?.[data] : user
  },
)
