import { exec } from 'node:child_process'

import { CronJob } from 'cron'

/** Ce fichier est uniquement destiné à la démonstration */

async function runMigrationGenerate() {
  exec('npm run migration:revert && npm run migration:run', (error, stdout, stderr) => {
    if (!error)
      console.log('Opération réussie', error)

    else
      console.log('Opération échouée', error)
  })
}

const job = CronJob.from({
  /** Restaurer les données initiales chaque jour à 4h30 du matin */
  cronTime: '30 4 * * *',
  timeZone: 'Asia/Shanghai',
  start: true,
  onTick() {
    runMigrationGenerate()
    console.log('Task executed daily at 4.30 AM:', new Date().toLocaleTimeString())
  },
})
