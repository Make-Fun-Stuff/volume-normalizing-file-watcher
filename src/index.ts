import { watch } from './watcher'
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv)).argv

if (!argv.sourceDir) {
  throw Error(`Missing --sourceDir argument`)
}
if (!argv.targetDir) {
  throw Error(`Missing --targetDir argument`)
}
if (!argv.targedDb) {
  throw Error(`Missing --targedDb argument`)
}

watch(argv.sourceDir, argv.targetDir, parseInt(argv.targedDb))
