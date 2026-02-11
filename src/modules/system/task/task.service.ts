import { InjectQueue } from '@nestjs/bull'
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { ModuleRef, Reflector } from '@nestjs/core'
import { UnknownElementException } from '@nestjs/core/errors/exceptions/unknown-element.exception'
import { InjectRepository } from '@nestjs/typeorm'
import { Queue } from 'bull'
import Redis from 'ioredis'
import { isEmpty, isNil } from 'lodash'
import { Like, Repository } from 'typeorm'
import { InjectRedis } from '~/common/decorators/inject-redis.decorator'

import { BusinessException } from '~/common/exceptions/biz.exception'
import { ErrorEnum } from '~/constants/error-code.constant'

import { paginate } from '~/helper/paginate'
import { Pagination } from '~/helper/paginate/pagination'

import { TaskEntity } from '~/modules/system/task/task.entity'
import { MISSION_DECORATOR_KEY } from '~/modules/tasks/mission.decorator'

import {
  SYS_TASK_QUEUE_NAME,
  SYS_TASK_QUEUE_PREFIX,
  TaskStatus,
} from './constant'
import { TaskDto, TaskQueryDto, TaskUpdateDto } from './task.dto'

@Injectable()
export class TaskService implements OnModuleInit {
  private logger = new Logger(TaskService.name)

  constructor(
    @InjectRepository(TaskEntity)
    private taskRepository: Repository<TaskEntity>,
    @InjectQueue(SYS_TASK_QUEUE_NAME) private taskQueue: Queue,
    private moduleRef: ModuleRef,
    private reflector: Reflector,
    @InjectRedis() private redis: Redis,
  ) {}

  /**
   * module init
   */
  async onModuleInit() {
    await this.initTask()
  }

  /**
   * Initialiser les tâches, appelé avant le démarrage du système
   */
  async initTask(): Promise<void> {
    const initKey = `${SYS_TASK_QUEUE_PREFIX}:init`
    // Empêcher la double initialisation
    const result = await this.redis
      .multi()
      .setnx(initKey, new Date().getTime())
      .expire(initKey, 60 * 30)
      .exec()
    if (result[0][1] === 0) {
      // Un verrou existe, ignorer pour éviter la double initialisation
      this.logger.log('Init task is lock', TaskService.name)
      return
    }
    const jobs = await this.taskQueue.getJobs([
      'active',
      'delayed',
      'failed',
      'paused',
      'waiting',
      'completed',
    ])
    jobs.forEach((j) => {
      j.remove()
    })

    // Rechercher toutes les tâches à exécuter
    const tasks = await this.taskRepository.findBy({ status: 1 })
    if (tasks && tasks.length > 0) {
      for (const t of tasks)
        await this.start(t)
    }
    // Libérer le verrou après le démarrage
    await this.redis.del(initKey)
  }

  async list({
    page,
    pageSize,
    name,
    service,
    type,
    status,
  }: TaskQueryDto): Promise<Pagination<TaskEntity>> {
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .where({
        ...(name ? { name: Like(`%${name}%`) } : null),
        ...(service ? { service: Like(`%${service}%`) } : null),
        ...(type ? { type } : null),
        ...(!isNil(status) ? { status } : null),
      })
      .orderBy('task.id', 'ASC')

    return paginate(queryBuilder, { page, pageSize })
  }

  /**
   * task info
   */
  async info(id: number): Promise<TaskEntity> {
    const task = this.taskRepository
      .createQueryBuilder('task')
      .where({ id })
      .getOne()

    if (!task)
      throw new NotFoundException('Task Not Found')

    return task
  }

  /**
   * delete task
   */
  async delete(task: TaskEntity): Promise<void> {
    if (!task)
      throw new BadRequestException('Task is Empty')

    await this.stop(task)
    await this.taskRepository.delete(task.id)
  }

  /**
   * Exécuter manuellement une fois
   */
  async once(task: TaskEntity): Promise<void | never> {
    if (task) {
      await this.taskQueue.add(
        { id: task.id, service: task.service, args: task.data },
        { jobId: task.id, removeOnComplete: true, removeOnFail: true },
      )
    }
    else {
      throw new BadRequestException('Task is Empty')
    }
  }

  async create(dto: TaskDto): Promise<void> {
    const result = await this.taskRepository.save(dto)
    const task = await this.info(result.id)
    if (result.status === 0)
      await this.stop(task)
    else if (result.status === TaskStatus.Activited)
      await this.start(task)
  }

  async update(id: number, dto: TaskUpdateDto): Promise<void> {
    await this.taskRepository.update(id, dto)
    const task = await this.info(id)
    if (task.status === 0)
      await this.stop(task)
    else if (task.status === TaskStatus.Activited)
      await this.start(task)
  }

  /**
   * Démarrer la tâche
   */
  async start(task: TaskEntity): Promise<void> {
    if (!task)
      throw new BadRequestException('Task is Empty')

    // Arrêter d'abord la tâche existante
    await this.stop(task)
    let repeat: any
    if (task.type === 1) {
      // Intervalle Repeat every millis (cron setting cannot be used together with this setting.)
      repeat = {
        every: task.every,
      }
    }
    else {
      // cron
      repeat = {
        cron: task.cron,
      }
      // Start date when the repeat job should start repeating (only with cron).
      if (task.startTime)
        repeat.startDate = task.startTime

      if (task.endTime)
        repeat.endDate = task.endTime
    }
    if (task.limit > 0)
      repeat.limit = task.limit

    const job = await this.taskQueue.add(
      { id: task.id, service: task.service, args: task.data },
      { jobId: task.id, removeOnComplete: true, removeOnFail: true, repeat },
    )
    if (job && job.opts) {
      await this.taskRepository.update(task.id, {
        jobOpts: JSON.stringify(job.opts.repeat),
        status: 1,
      })
    }
    else {
      // update status to 0, indique que la tâche est en pause car le démarrage a échoué
      await job?.remove()
      await this.taskRepository.update(task.id, {
        status: TaskStatus.Disabled,
      })
      throw new BadRequestException('Task Start failed')
    }
  }

  /**
   * Arrêter la tâche
   */
  async stop(task: TaskEntity): Promise<void> {
    if (!task)
      throw new BadRequestException('Task is Empty')

    const exist = await this.existJob(task.id.toString())
    if (!exist) {
      await this.taskRepository.update(task.id, {
        status: TaskStatus.Disabled,
      })
      return
    }
    const jobs = await this.taskQueue.getJobs([
      'active',
      'delayed',
      'failed',
      'paused',
      'waiting',
      'completed',
    ])
    jobs
      .filter(j => j.data.id === task.id)
      .forEach(async (j) => {
        await j.remove()
      })

    // Supprimer la tâche actuelle de la file d'attente
    await this.taskQueue.removeRepeatable(JSON.parse(task.jobOpts))

    await this.taskRepository.update(task.id, { status: TaskStatus.Disabled })
    // if (task.jobOpts) {
    //   await this.app.queue.sys.removeRepeatable(JSON.parse(task.jobOpts));
    //   // update status
    //   await this.getRepo().admin.sys.Task.update(task.id, { status: TaskStatus.Disabled, });
    // }
  }

  /**
   * Vérifier si la tâche existe dans la file d'attente
   */
  async existJob(jobId: string): Promise<boolean> {
    // https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md#queueremoverepeatablebykey
    const jobs = await this.taskQueue.getRepeatableJobs()
    const ids = jobs.map((e) => {
      return e.id
    })
    return ids.includes(jobId)
  }

  /**
   * Mettre à jour le statut de complétion, supprimer la tâche et modifier le statut si terminée
   */
  async updateTaskCompleteStatus(tid: number): Promise<void> {
    const jobs = await this.taskQueue.getRepeatableJobs()
    const task = await this.taskRepository.findOneBy({ id: tid })
    // Si la prochaine heure d'exécution est antérieure à l'heure actuelle, l'exécution est terminée.
    for (const job of jobs) {
      const currentTime = new Date().getTime()
      if (job.id === tid.toString() && job.next < currentTime) {
        // Si la prochaine heure d'exécution est antérieure à l'heure actuelle, l'exécution est terminée.
        await this.stop(task)
        break
      }
    }
  }

  /**
   * Vérifier si le service a une annotation définie
   */
  async checkHasMissionMeta(
    nameOrInstance: string | unknown,
    exec: string,
  ): Promise<void | never> {
    try {
      let service: any
      if (typeof nameOrInstance === 'string')
        service = await this.moduleRef.get(nameOrInstance, { strict: false })
      else
        service = nameOrInstance

      // La tâche à exécuter n'existe pas
      if (!service || !(exec in service))
        throw new NotFoundException('La tâche n\'existe pas')

      // Vérifier si l'annotation Mission est présente
      const hasMission = this.reflector.get<boolean>(
        MISSION_DECORATOR_KEY,
        service.constructor,
      )
      // Si absente, lever une erreur
      if (!hasMission)
        throw new BusinessException(ErrorEnum.INSECURE_MISSION)
    }
    catch (e) {
      if (e instanceof UnknownElementException) {
        // La tâche n'existe pas
        throw new NotFoundException('La tâche n\'existe pas')
      }
      else {
        // Les autres erreurs ne sont pas traitées, continuer à lever l'exception
        throw e
      }
    }
  }

  /**
   * Appeler un service par serviceName, par exemple LogService.clearReqLog
   */
  async callService(name: string, args: string): Promise<void> {
    if (name) {
      const [serviceName, methodName] = name.split('.')
      if (!methodName)
        throw new BadRequestException('serviceName define BadRequestException')

      const service = await this.moduleRef.get(serviceName, {
        strict: false,
      })

      // Vérification de l'annotation de sécurité
      await this.checkHasMissionMeta(service, methodName)
      if (isEmpty(args)) {
        await service[methodName]()
      }
      else {
        // Validation de sécurité des paramètres
        const parseArgs = this.safeParse(args)

        if (Array.isArray(parseArgs)) {
          // Si c'est un tableau, l'étendre automatiquement en paramètres de méthode
          await service[methodName](...parseArgs)
        }
        else {
          await service[methodName](parseArgs)
        }
      }
    }
  }

  safeParse(args: string): unknown | string {
    try {
      return JSON.parse(args)
    }
    catch (e) {
      return args
    }
  }
}
