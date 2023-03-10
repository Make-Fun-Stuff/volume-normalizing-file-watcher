import chokidar from 'chokidar'
import { existsSync, mkdirSync } from 'fs'
import { setVolume } from './ffmpeg'
import { cleanFilename, removeLeadingSlash, removeTrailingSlash } from './util'

let WATCHER_READY = false

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const handleAddFile = (req: {
  path: string
  sourceDir: string
  destinationDir: string
  targetMeanVolume: number
}) => {
  if (!req.path.endsWith('.mp3')) {
    return
  }
  console.log(`Detected new file: ${req.path}`)

  const withoutSrc = removeLeadingSlash(req.path.replace(req.sourceDir, ''))
  let fname: string = withoutSrc
  let dir: string | undefined = undefined

  // handle subdirectories
  if (withoutSrc.includes('/')) {
    const split = withoutSrc.split('/')
    dir = split.slice(0, split.length - 1).join('/')
    fname = split[split.length - 1]

    const fullDestDir = `${req.destinationDir}/${dir}`
    if (!existsSync(fullDestDir)) {
      console.log(`Creating folder: ${fullDestDir}`)
      mkdirSync(fullDestDir, { recursive: true })
    }
  }

  if (fname.startsWith('.')) {
    console.log(`Ignoring hidden file`)
    return
  }

  const destination = `${req.destinationDir}/${dir ? `${dir}/` : ''}${cleanFilename(fname)}`
  delay(3000).then((_) => {
    try {
      setVolume({ source: req.path, destination, targetMeanVolume: req.targetMeanVolume })
    } catch (e) {
      console.log(`Something went wrong with file: ${req.path}`)
      console.log(e)
    }
  })
}

export const watch = (sourceDir: string, destinationDir: string, targetDb: number) => {
  const cleanedDestinationDir = removeTrailingSlash(destinationDir)
  chokidar
    .watch(sourceDir)
    .on('ready', () => {
      WATCHER_READY = true
      console.log('Ready')
    })
    .on('add', (path) => {
      if (WATCHER_READY) {
        handleAddFile({
          path: removeTrailingSlash(path),
          sourceDir,
          destinationDir: cleanedDestinationDir,
          targetMeanVolume: targetDb,
        })
      }
    })
}
