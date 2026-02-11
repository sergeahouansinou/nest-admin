import { basename, extname } from 'node:path'

import { Inject, Injectable } from '@nestjs/common'
import { isEmpty } from 'lodash'
import * as qiniu from 'qiniu'
import { auth, conf, rs } from 'qiniu'

import { IOssConfig, OssConfig } from '~/config'
import { NETDISK_COPY_SUFFIX, NETDISK_DELIMITER, NETDISK_HANDLE_MAX_ITEM, NETDISK_LIMIT } from '~/constants/oss.constant'

import { AccountInfo } from '~/modules/user/user.model'
import { UserService } from '~/modules/user/user.service'

import { generateRandomValue } from '~/utils'

import { SFileInfo, SFileInfoDetail, SFileList } from './manage.class'
import { FileOpItem } from './manage.dto'

@Injectable()
export class NetDiskManageService {
  private config: conf.Config
  private mac: auth.digest.Mac
  private bucketManager: rs.BucketManager

  constructor(
    @Inject(OssConfig.KEY) private qiniuConfig: IOssConfig,
    private userService: UserService,
  ) {
    this.mac = new qiniu.auth.digest.Mac(
      this.qiniuConfig.accessKey,
      this.qiniuConfig.secretKey,
    )
    this.config = new qiniu.conf.Config({
      zone: this.qiniuConfig.zone,
    })
    // bucket manager
    this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config)
  }

  /**
   * Obtenir la liste des fichiers
   * @param prefix Chemin du dossier actuel, ignoré en mode recherche
   * @param marker Identifiant de page suivante
   * @returns iFileListResult
   */
  async getFileList(prefix = '', marker = '', skey = ''): Promise<SFileList> {
    // Faut-il effectuer une recherche
    const searching = !isEmpty(skey)
    return new Promise<SFileList>((resolve, reject) => {
      this.bucketManager.listPrefix(
        this.qiniuConfig.bucket,
        {
          prefix: searching ? '' : prefix,
          limit: NETDISK_LIMIT,
          delimiter: searching ? '' : NETDISK_DELIMITER,
          marker,
        },
        (err, respBody, respInfo) => {
          if (err) {
            reject(err)
            return
          }
          if (respInfo.statusCode === 200) {
            // Si ce nextMarker n'est pas vide, il reste des fichiers non listés,
            // spécifier ce marqueur dans les options lors du prochain appel à listPrefix
            const fileList: SFileInfo[] = []
            // Traitement des répertoires, disponible uniquement en mode non-recherche
            if (!searching && !isEmpty(respBody.commonPrefixes)) {
              // dir
              for (const dirPath of respBody.commonPrefixes) {
                const name = (dirPath as string)
                  .substr(0, dirPath.length - 1)
                  .replace(prefix, '')
                if (isEmpty(skey) || name.includes(skey)) {
                  fileList.push({
                    name: (dirPath as string)
                      .substr(0, dirPath.length - 1)
                      .replace(prefix, ''),
                    type: 'dir',
                    id: generateRandomValue(10),
                  })
                }
              }
            }
            // handle items
            if (!isEmpty(respBody.items)) {
              // file
              for (const item of respBody.items) {
                // Traitement en mode recherche
                if (searching) {
                  const pathList: string[] = item.key.split(NETDISK_DELIMITER)
                  // dir is empty stirng, file is key string
                  const name = pathList.pop()
                  if (
                    item.key.endsWith(NETDISK_DELIMITER)
                    && pathList[pathList.length - 1].includes(skey)
                  ) {
                    // Le résultat est un répertoire
                    const ditName = pathList.pop()
                    fileList.push({
                      id: generateRandomValue(10),
                      name: ditName,
                      type: 'dir',
                      belongTo: pathList.join(NETDISK_DELIMITER),
                    })
                  }
                  else if (name.includes(skey)) {
                    // Fichier
                    fileList.push({
                      id: generateRandomValue(10),
                      name,
                      type: 'file',
                      fsize: item.fsize,
                      mimeType: item.mimeType,
                      putTime: new Date(Number.parseInt(item.putTime) / 10000),
                      belongTo: pathList.join(NETDISK_DELIMITER),
                    })
                  }
                }
                else {
                  // Obtention normale de la liste
                  const fileKey = item.key.replace(prefix, '') as string
                  if (!isEmpty(fileKey)) {
                    fileList.push({
                      id: generateRandomValue(10),
                      name: fileKey,
                      type: 'file',
                      fsize: item.fsize,
                      mimeType: item.mimeType,
                      putTime: new Date(Number.parseInt(item.putTime) / 10000),
                    })
                  }
                }
              }
            }
            resolve({
              list: fileList,
              marker: respBody.marker || null,
            })
          }
          else {
            reject(
              new Error(
                `Qiniu Error Code: ${respInfo.statusCode}, Info: ${respInfo.statusMessage}`,
              ),
            )
          }
        },
      )
    })
  }

  /**
   * Obtenir les informations du fichier
   */
  async getFileInfo(name: string, path: string): Promise<SFileInfoDetail> {
    return new Promise((resolve, reject) => {
      this.bucketManager.stat(
        this.qiniuConfig.bucket,
        `${path}${name}`,
        (err, respBody, respInfo) => {
          if (err) {
            reject(err)
            return
          }
          if (respInfo.statusCode === 200) {
            const detailInfo: SFileInfoDetail = {
              fsize: respBody.fsize,
              hash: respBody.hash,
              md5: respBody.md5,
              mimeType: respBody.mimeType.split('/x-qn-meta')[0],
              putTime: new Date(Number.parseInt(respBody.putTime) / 10000),
              type: respBody.type,
              uploader: '',
              mark: respBody?.['x-qn-meta']?.['!mark'] ?? '',
            }
            if (!respBody.endUser) {
              resolve(detailInfo)
            }
            else {
              this.userService
                .getAccountInfo(Number.parseInt(respBody.endUser))
                .then((user: AccountInfo) => {
                  if (isEmpty(user)) {
                    resolve(detailInfo)
                  }
                  else {
                    detailInfo.uploader = user.username
                    resolve(detailInfo)
                  }
                })
            }
          }
          else {
            reject(
              new Error(
                `Qiniu Error Code: ${respInfo.statusCode}, Info: ${respInfo.statusMessage}`,
              ),
            )
          }
        },
      )
    })
  }

  /**
   * Modifier le MimeType du fichier
   */
  async changeFileHeaders(
    name: string,
    path: string,
    headers: { [k: string]: string },
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.bucketManager.changeHeaders(
        this.qiniuConfig.bucket,
        `${path}${name}`,
        headers,
        (err, _, respInfo) => {
          if (err) {
            reject(err)
            return
          }
          if (respInfo.statusCode === 200) {
            resolve()
          }
          else {
            reject(
              new Error(
                `Qiniu Error Code: ${respInfo.statusCode}, Info: ${respInfo.statusMessage}`,
              ),
            )
          }
        },
      )
    })
  }

  /**
   * Créer un dossier
   * @returns true en cas de succès
   */
  async createDir(dirName: string): Promise<void> {
    const safeDirName = dirName.endsWith('/') ? dirName : `${dirName}/`
    return new Promise((resolve, reject) => {
      // Téléverser un fichier vide pour créer l'effet de dossier
      const formUploader = new qiniu.form_up.FormUploader(this.config)
      const putExtra = new qiniu.form_up.PutExtra()
      formUploader.put(
        this.createUploadToken(''),
        safeDirName,
        ' ',
        putExtra,
        (respErr, respBody, respInfo) => {
          if (respErr) {
            reject(respErr)
            return
          }
          if (respInfo.statusCode === 200) {
            resolve()
          }
          else {
            reject(
              new Error(
                `Qiniu Error Code: ${respInfo.statusCode}, Info: ${respInfo.statusMessage}`,
              ),
            )
          }
        },
      )
    })
  }

  /**
   * Vérifier si un fichier existe, peut également vérifier les répertoires
   */
  async checkFileExist(filePath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // fix path end must a /

      // Vérifier si le dossier existe
      this.bucketManager.stat(
        this.qiniuConfig.bucket,
        filePath,
        (respErr, respBody, respInfo) => {
          if (respErr) {
            reject(respErr)
            return
          }
          if (respInfo.statusCode === 200) {
            // Le dossier existe
            resolve(true)
          }
          else if (respInfo.statusCode === 612) {
            // Le dossier n'existe pas
            resolve(false)
          }
          else {
            reject(
              new Error(
                `Qiniu Error Code: ${respInfo.statusCode}, Info: ${respInfo.statusMessage}`,
              ),
            )
          }
        },
      )
    })
  }

  /**
   * Créer un Upload Token, durée d'expiration par défaut d'une heure
   * @returns upload token
   */
  createUploadToken(endUser: string): string {
    const policy = new qiniu.rs.PutPolicy({
      scope: this.qiniuConfig.bucket,
      insertOnly: 1,
      fsizeLimit: 1024 ** 2 * 10,
      endUser,
    })
    const uploadToken = policy.uploadToken(this.mac)
    return uploadToken
  }

  /**
   * Renommer un fichier
   * @param dir Chemin du fichier
   * @param name Nom du fichier
   */
  async renameFile(dir: string, name: string, toName: string): Promise<void> {
    const fileName = `${dir}${name}`
    const toFileName = `${dir}${toName}`
    const op = {
      force: true,
    }
    return new Promise((resolve, reject) => {
      this.bucketManager.move(
        this.qiniuConfig.bucket,
        fileName,
        this.qiniuConfig.bucket,
        toFileName,
        op,
        (err, respBody, respInfo) => {
          if (err) {
            reject(err)
          }
          else {
            if (respInfo.statusCode === 200) {
              resolve()
            }
            else {
              reject(
                new Error(
                  `Qiniu Error Code: ${respInfo.statusCode}, Info: ${respInfo.statusMessage}`,
                ),
              )
            }
          }
        },
      )
    })
  }

  /**
   * Déplacer un fichier
   */
  async moveFile(dir: string, toDir: string, name: string): Promise<void> {
    const fileName = `${dir}${name}`
    const toFileName = `${toDir}${name}`
    const op = {
      force: true,
    }
    return new Promise((resolve, reject) => {
      this.bucketManager.move(
        this.qiniuConfig.bucket,
        fileName,
        this.qiniuConfig.bucket,
        toFileName,
        op,
        (err, respBody, respInfo) => {
          if (err) {
            reject(err)
          }
          else {
            if (respInfo.statusCode === 200) {
              resolve()
            }
            else {
              reject(
                new Error(
                  `Qiniu Error Code: ${respInfo.statusCode}, Info: ${respInfo.statusMessage}`,
                ),
              )
            }
          }
        },
      )
    })
  }

  /**
   * Copier un fichier
   */
  async copyFile(dir: string, toDir: string, name: string): Promise<void> {
    const fileName = `${dir}${name}`
    // Construire le nom du fichier
    const ext = extname(name)
    const bn = basename(name, ext)
    const toFileName = `${toDir}${bn}${NETDISK_COPY_SUFFIX}${ext}`
    const op = {
      force: true,
    }
    return new Promise((resolve, reject) => {
      this.bucketManager.copy(
        this.qiniuConfig.bucket,
        fileName,
        this.qiniuConfig.bucket,
        toFileName,
        op,
        (err, respBody, respInfo) => {
          if (err) {
            reject(err)
          }
          else {
            if (respInfo.statusCode === 200) {
              resolve()
            }
            else {
              reject(
                new Error(
                  `Qiniu Error Code: ${respInfo.statusCode}, Info: ${respInfo.statusMessage}`,
                ),
              )
            }
          }
        },
      )
    })
  }

  /**
   * Renommer un dossier
   */
  async renameDir(path: string, name: string, toName: string): Promise<void> {
    const dirName = `${path}${name}`
    const toDirName = `${path}${toName}`
    let hasFile = true
    let marker = ''
    const op = {
      force: true,
    }
    const bucketName = this.qiniuConfig.bucket
    while (hasFile) {
      await new Promise<void>((resolve, reject) => {
        // Lister tous les fichiers du répertoire actuel
        this.bucketManager.listPrefix(
          this.qiniuConfig.bucket,
          {
            prefix: dirName,
            limit: NETDISK_HANDLE_MAX_ITEM,
            marker,
          },
          (err, respBody, respInfo) => {
            if (err) {
              reject(err)
              return
            }
            if (respInfo.statusCode === 200) {
              const moveOperations = respBody.items.map((item) => {
                const { key } = item
                const destKey = key.replace(dirName, toDirName)
                return qiniu.rs.moveOp(
                  bucketName,
                  key,
                  bucketName,
                  destKey,
                  op,
                )
              })
              this.bucketManager.batch(
                moveOperations,
                (err2, respBody2, respInfo2) => {
                  if (err2) {
                    reject(err2)
                    return
                  }
                  if (respInfo2.statusCode === 200) {
                    if (isEmpty(respBody.marker))
                      hasFile = false
                    else
                      marker = respBody.marker

                    resolve()
                  }
                  else {
                    reject(
                      new Error(
                        `Qiniu Error Code: ${respInfo2.statusCode}, Info: ${respInfo2.statusMessage}`,
                      ),
                    )
                  }
                },
              )
            }
            else {
              reject(
                new Error(
                  `Qiniu Error Code: ${respInfo.statusCode}, Info: ${respInfo.statusMessage}`,
                ),
              )
            }
          },
        )
      })
    }
  }

  /**
   * Obtenir le lien URL de téléchargement Qiniu
   * @param key Chemin du fichier
   * @returns Lien
   */
  getDownloadLink(key: string): string {
    if (this.qiniuConfig.access === 'public') {
      return this.bucketManager.publicDownloadUrl(this.qiniuConfig.domain, key)
    }
    else if (this.qiniuConfig.access === 'private') {
      return this.bucketManager.privateDownloadUrl(
        this.qiniuConfig.domain,
        key,
        Date.now() / 1000 + 36000,
      )
    }
    throw new Error('qiniu config access type not support')
  }

  /**
   * Supprimer un fichier
   * @param dir Répertoire du fichier à supprimer
   * @param name Nom du fichier
   */
  async deleteFile(dir: string, name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.bucketManager.delete(
        this.qiniuConfig.bucket,
        `${dir}${name}`,
        (err, respBody, respInfo) => {
          if (err) {
            reject(err)
            return
          }
          if (respInfo.statusCode === 200) {
            resolve()
          }
          else {
            reject(
              new Error(
                `Qiniu Error Code: ${respInfo.statusCode}, Info: ${respInfo.statusMessage}`,
              ),
            )
          }
        },
      )
    })
  }

  /**
   * Supprimer un dossier
   * @param fileList Fichiers ou dossiers à traiter
   * @param dir Nom du répertoire des fichiers
   */
  async deleteMultiFileOrDir(
    fileList: FileOpItem[],
    dir: string,
  ): Promise<void> {
    const files = fileList.filter(item => item.type === 'file')
    if (files.length > 0) {
      // Traitement par lots des fichiers
      const copyOperations = files.map((item) => {
        const fileName = `${dir}${item.name}`
        return qiniu.rs.deleteOp(this.qiniuConfig.bucket, fileName)
      })
      await new Promise<void>((resolve, reject) => {
        this.bucketManager.batch(copyOperations, (err, respBody, respInfo) => {
          if (err) {
            reject(err)
            return
          }
          if (respInfo.statusCode === 200) {
            resolve()
          }
          else if (respInfo.statusCode === 298) {
            reject(new Error('Opération anormale, mais certains dossiers ont été supprimés avec succès'))
          }
          else {
            reject(
              new Error(
                `Qiniu Error Code: ${respInfo.statusCode}, Info: ${respInfo.statusMessage}`,
              ),
            )
          }
        })
      })
    }
    // Traitement des dossiers
    const dirs = fileList.filter(item => item.type === 'dir')
    if (dirs.length > 0) {
      // Traitement de la copie des dossiers
      for (let i = 0; i < dirs.length; i++) {
        const dirName = `${dir}${dirs[i].name}/`
        let hasFile = true
        let marker = ''
        while (hasFile) {
          await new Promise<void>((resolve, reject) => {
            // Lister tous les fichiers du répertoire actuel
            this.bucketManager.listPrefix(
              this.qiniuConfig.bucket,
              {
                prefix: dirName,
                limit: NETDISK_HANDLE_MAX_ITEM,
                marker,
              },
              (err, respBody, respInfo) => {
                if (err) {
                  reject(err)
                  return
                }
                if (respInfo.statusCode === 200) {
                  const moveOperations = respBody.items.map((item) => {
                    const { key } = item
                    return qiniu.rs.deleteOp(this.qiniuConfig.bucket, key)
                  })
                  this.bucketManager.batch(
                    moveOperations,
                    (err2, respBody2, respInfo2) => {
                      if (err2) {
                        reject(err2)
                        return
                      }
                      if (respInfo2.statusCode === 200) {
                        if (isEmpty(respBody.marker))
                          hasFile = false
                        else
                          marker = respBody.marker

                        resolve()
                      }
                      else {
                        reject(
                          new Error(
                            `Qiniu Error Code: ${respInfo2.statusCode}, Info: ${respInfo2.statusMessage}`,
                          ),
                        )
                      }
                    },
                  )
                }
                else {
                  reject(
                    new Error(
                      `Qiniu Error Code: ${respInfo.statusCode}, Info: ${respInfo.statusMessage}`,
                    ),
                  )
                }
              },
            )
          })
        }
      }
    }
  }

  /**
   * Copier des fichiers, y compris les dossiers
   */
  async copyMultiFileOrDir(
    fileList: FileOpItem[],
    dir: string,
    toDir: string,
  ): Promise<void> {
    const files = fileList.filter(item => item.type === 'file')
    const op = {
      force: true,
    }
    if (files.length > 0) {
      // Traitement par lots des fichiers
      const copyOperations = files.map((item) => {
        const fileName = `${dir}${item.name}`
        // Construire le nom du fichier
        const ext = extname(item.name)
        const bn = basename(item.name, ext)
        const toFileName = `${toDir}${bn}${NETDISK_COPY_SUFFIX}${ext}`
        return qiniu.rs.copyOp(
          this.qiniuConfig.bucket,
          fileName,
          this.qiniuConfig.bucket,
          toFileName,
          op,
        )
      })
      await new Promise<void>((resolve, reject) => {
        this.bucketManager.batch(copyOperations, (err, respBody, respInfo) => {
          if (err) {
            reject(err)
            return
          }
          if (respInfo.statusCode === 200) {
            resolve()
          }
          else if (respInfo.statusCode === 298) {
            reject(new Error('Opération anormale, mais certains dossiers ont été supprimés avec succès'))
          }
          else {
            reject(
              new Error(
                `Qiniu Error Code: ${respInfo.statusCode}, Info: ${respInfo.statusMessage}`,
              ),
            )
          }
        })
      })
    }
    // Traitement des dossiers
    const dirs = fileList.filter(item => item.type === 'dir')
    if (dirs.length > 0) {
      // Traitement de la copie des dossiers
      for (let i = 0; i < dirs.length; i++) {
        const dirName = `${dir}${dirs[i].name}/`
        const copyDirName = `${toDir}${dirs[i].name}${NETDISK_COPY_SUFFIX}/`
        let hasFile = true
        let marker = ''
        while (hasFile) {
          await new Promise<void>((resolve, reject) => {
            // Lister tous les fichiers du répertoire actuel
            this.bucketManager.listPrefix(
              this.qiniuConfig.bucket,
              {
                prefix: dirName,
                limit: NETDISK_HANDLE_MAX_ITEM,
                marker,
              },
              (err, respBody, respInfo) => {
                if (err) {
                  reject(err)
                  return
                }
                if (respInfo.statusCode === 200) {
                  const moveOperations = respBody.items.map((item) => {
                    const { key } = item
                    const destKey = key.replace(dirName, copyDirName)
                    return qiniu.rs.copyOp(
                      this.qiniuConfig.bucket,
                      key,
                      this.qiniuConfig.bucket,
                      destKey,
                      op,
                    )
                  })
                  this.bucketManager.batch(
                    moveOperations,
                    (err2, respBody2, respInfo2) => {
                      if (err2) {
                        reject(err2)
                        return
                      }
                      if (respInfo2.statusCode === 200) {
                        if (isEmpty(respBody.marker))
                          hasFile = false
                        else
                          marker = respBody.marker

                        resolve()
                      }
                      else {
                        reject(
                          new Error(
                            `Qiniu Error Code: ${respInfo2.statusCode}, Info: ${respInfo2.statusMessage}`,
                          ),
                        )
                      }
                    },
                  )
                }
                else {
                  reject(
                    new Error(
                      `Qiniu Error Code: ${respInfo.statusCode}, Info: ${respInfo.statusMessage}`,
                    ),
                  )
                }
              },
            )
          })
        }
      }
    }
  }

  /**
   * Déplacer des fichiers, y compris les dossiers
   */
  async moveMultiFileOrDir(
    fileList: FileOpItem[],
    dir: string,
    toDir: string,
  ): Promise<void> {
    const files = fileList.filter(item => item.type === 'file')
    const op = {
      force: true,
    }
    if (files.length > 0) {
      // Traitement par lots des fichiers
      const copyOperations = files.map((item) => {
        const fileName = `${dir}${item.name}`
        const toFileName = `${toDir}${item.name}`
        return qiniu.rs.moveOp(
          this.qiniuConfig.bucket,
          fileName,
          this.qiniuConfig.bucket,
          toFileName,
          op,
        )
      })
      await new Promise<void>((resolve, reject) => {
        this.bucketManager.batch(copyOperations, (err, respBody, respInfo) => {
          if (err) {
            reject(err)
            return
          }
          if (respInfo.statusCode === 200) {
            resolve()
          }
          else if (respInfo.statusCode === 298) {
            reject(new Error('Opération anormale, mais certains dossiers ont été supprimés avec succès'))
          }
          else {
            reject(
              new Error(
                `Qiniu Error Code: ${respInfo.statusCode}, Info: ${respInfo.statusMessage}`,
              ),
            )
          }
        })
      })
    }
    // Traitement des dossiers
    const dirs = fileList.filter(item => item.type === 'dir')
    if (dirs.length > 0) {
      // Traitement du déplacement des dossiers
      for (let i = 0; i < dirs.length; i++) {
        const dirName = `${dir}${dirs[i].name}/`
        const toDirName = `${toDir}${dirs[i].name}/`
        // Le répertoire de destination ne doit pas être lui-même
        if (toDirName.startsWith(dirName))
          continue

        let hasFile = true
        let marker = ''
        while (hasFile) {
          await new Promise<void>((resolve, reject) => {
            // Lister tous les fichiers du répertoire actuel
            this.bucketManager.listPrefix(
              this.qiniuConfig.bucket,
              {
                prefix: dirName,
                limit: NETDISK_HANDLE_MAX_ITEM,
                marker,
              },
              (err, respBody, respInfo) => {
                if (err) {
                  reject(err)
                  return
                }
                if (respInfo.statusCode === 200) {
                  const moveOperations = respBody.items.map((item) => {
                    const { key } = item
                    const destKey = key.replace(dirName, toDirName)
                    return qiniu.rs.moveOp(
                      this.qiniuConfig.bucket,
                      key,
                      this.qiniuConfig.bucket,
                      destKey,
                      op,
                    )
                  })
                  this.bucketManager.batch(
                    moveOperations,
                    (err2, respBody2, respInfo2) => {
                      if (err2) {
                        reject(err2)
                        return
                      }
                      if (respInfo2.statusCode === 200) {
                        if (isEmpty(respBody.marker))
                          hasFile = false
                        else
                          marker = respBody.marker

                        resolve()
                      }
                      else {
                        reject(
                          new Error(
                            `Qiniu Error Code: ${respInfo2.statusCode}, Info: ${respInfo2.statusMessage}`,
                          ),
                        )
                      }
                    },
                  )
                }
                else {
                  reject(
                    new Error(
                      `Qiniu Error Code: ${respInfo.statusCode}, Info: ${respInfo.statusMessage}`,
                    ),
                  )
                }
              },
            )
          })
        }
      }
    }
  }
}
