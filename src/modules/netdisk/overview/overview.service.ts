import { HttpService } from '@nestjs/axios'
import { Inject, Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import * as qiniu from 'qiniu'

import { IOssConfig, OssConfig } from '~/config'
import { OSS_API } from '~/constants/oss.constant'

import { CountInfo, FlowInfo, HitInfo, SpaceInfo } from './overview.dto'

@Injectable()
export class NetDiskOverviewService {
  private mac: qiniu.auth.digest.Mac
  private readonly FORMAT = 'YYYYMMDDHHmmss'

  constructor(
    @Inject(OssConfig.KEY) private qiniuConfig: IOssConfig,
    private readonly httpService: HttpService,
  ) {
    this.mac = new qiniu.auth.digest.Mac(
      this.qiniuConfig.accessKey,
      this.qiniuConfig.secretKey,
    )
  }

  /** Obtenir les dates de début et de fin formatées */
  getStartAndEndDate(start: Date, end = new Date()) {
    return [dayjs(start).format(this.FORMAT), dayjs(end).format(this.FORMAT)]
  }

  /**
   * Obtenir le chemin de l'interface de statistiques
   * @see: https://developer.qiniu.com/kodo/3906/statistic-interface
   */
  getStatisticUrl(type: string, queryParams = {}) {
    const bucketKey = type === 'blob_io' ? '$bucket' : 'bucket'
    const defaultParams = {
      [bucketKey]: this.qiniuConfig.bucket,
      g: 'day',
    }
    const searchParams = new URLSearchParams({ ...defaultParams, ...queryParams })
    return decodeURIComponent(`${OSS_API}/v6/${type}?${searchParams}`)
  }

  /** Obtenir les données statistiques */
  getStatisticData(url: string) {
    const accessToken = qiniu.util.generateAccessTokenV2(
      this.mac,
      url,
      'GET',
      'application/x-www-form-urlencoded',
    )
    return this.httpService.axiosRef.get(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `${accessToken}`,
      },
    })
  }

  /**
   * Obtenir minuit du jour actuel
   */
  getZeroHourToDay(current: Date): Date {
    const year = dayjs(current).year()
    const month = dayjs(current).month()
    const date = dayjs(current).date()
    return new Date(year, month, date, 0)
  }

  /**
   * Obtenir minuit du 1er du mois en cours
   */
  getZeroHourAnd1Day(current: Date): Date {
    const year = dayjs(current).year()
    const month = dayjs(current).month()
    return new Date(year, month, 1, 0)
  }

  /**
   * Cette interface permet d'obtenir le volume de stockage standard actuel. Peut interroger les mesures du jour, avec un délai statistique d'environ 5 minutes.
   * https://developer.qiniu.com/kodo/3908/statistic-space
   */
  async getSpace(beginDate: Date, endDate = new Date()): Promise<SpaceInfo> {
    const [begin, end] = this.getStartAndEndDate(beginDate, endDate)
    const url = this.getStatisticUrl('space', { begin, end })
    const { data } = await this.getStatisticData(url)
    return {
      datas: data.datas,
      times: data.times.map((e) => {
        return dayjs.unix(e).date()
      }),
    }
  }

  /**
   * Cette interface permet d'obtenir le nombre de fichiers en stockage standard. Peut interroger les mesures du jour, avec un délai statistique d'environ 5 minutes.
   * https://developer.qiniu.com/kodo/3914/count
   */
  async getCount(beginDate: Date, endDate = new Date()): Promise<CountInfo> {
    const [begin, end] = this.getStartAndEndDate(beginDate, endDate)
    const url = this.getStatisticUrl('count', { begin, end })
    const { data } = await this.getStatisticData(url)
    return {
      times: data.times.map((e) => {
        return dayjs.unix(e).date()
      }),
      datas: data.datas,
    }
  }

  /**
   * Statistiques du trafic sortant externe
   * Cette interface permet d'obtenir les statistiques du trafic sortant externe, du trafic de retour CDN et du nombre de requêtes GET. Peut interroger les mesures du jour, avec un délai statistique d'environ 5 minutes.
   * https://developer.qiniu.com/kodo/3820/blob-io
   */
  async getFlow(beginDate: Date, endDate = new Date()): Promise<FlowInfo> {
    const [begin, end] = this.getStartAndEndDate(beginDate, endDate)
    const url = this.getStatisticUrl('blob_io', { begin, end, $ftype: 0, $src: 'origin', select: 'flow' })
    const { data } = await this.getStatisticData(url)
    const times = []
    const datas = []
    data.forEach((e) => {
      times.push(dayjs(e.time).date())
      datas.push(e.values.flow)
    })
    return {
      times,
      datas,
    }
  }

  /**
   * Statistiques du nombre de requêtes GET
   * Cette interface permet d'obtenir les statistiques du trafic sortant externe, du trafic de retour CDN et du nombre de requêtes GET. Peut interroger les mesures du jour, avec un délai statistique d'environ 5 minutes.
   * https://developer.qiniu.com/kodo/3820/blob-io
   */
  async getHit(beginDate: Date, endDate = new Date()): Promise<HitInfo> {
    const [begin, end] = this.getStartAndEndDate(beginDate, endDate)
    const url = this.getStatisticUrl('blob_io', { begin, end, $ftype: 0, $src: 'inner', select: 'hit' })
    const { data } = await this.getStatisticData(url)
    const times = []
    const datas = []
    data.forEach((e) => {
      times.push(dayjs(e.time).date())
      datas.push(e.values.hit)
    })
    return {
      times,
      datas,
    }
  }
}
