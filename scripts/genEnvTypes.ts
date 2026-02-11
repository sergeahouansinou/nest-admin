import fs from 'node:fs'
import path from 'node:path'

import dotenv from 'dotenv'

const directoryPath = path.resolve(__dirname, '..')

const targets = ['.env', `.env.${process.env.NODE_ENV || 'development'}`]

const envObj = targets.reduce((prev, file) => {
  const result = dotenv.parse(fs.readFileSync(path.join(directoryPath, file)))
  return { ...prev, ...result }
}, {})

const envType = Object.entries<string>(envObj).reduce((prev, [key, value]) => {
  return `${prev}
      ${key}: '${value}';`
}, '').trim()

fs.writeFile(path.join(directoryPath, 'types/env.d.ts'), `
// generate by ./scripts/generateEnvTypes.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ${envType}
    }
  }
}
export {};
  `, (err) => {
  if (err)
    console.log('Échec de la génération du fichier env.d.ts')
  else
    console.log('Fichier env.d.ts généré avec succès')
})

//   console.log('envObj:', envObj)

function formatValue(value) {
  let _value
  try {
    const res = JSON.parse(value)
    _value = typeof res === 'object' ? value : res
  }
  catch (error) {
    _value = `'${value}'`
  }
  return _value
}
