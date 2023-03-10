import ffmpeg from 'fluent-ffmpeg'

export const getVolume = async (source: string): Promise<{ mean: number; max: number } | void> => {
  return new Promise(function (resolve, _reject) {
    ffmpeg({ source })
      .withAudioFilter('volumedetect')
      .addOption('-f', 'null')
      .on('error', function (error) {
        console.log(error)
        resolve()
      })
      .on('end', function (_stdout, stderr) {
        const match = stderr.match(
          'mean_volume: (-?[0-9.]+) dB[\\S\\s]+ max_volume: (-?[0-9.]+) dB'
        )
        if (!match) {
          console.log(`Unable to parse out mean/max volume from ${source}`)
	  resolve()
        }
        resolve({
          mean: Number(match[1]),
          max: Number(match[2]),
        })
      })
      .saveToFile('/dev/null')
  })
}

const getDelta = (target: number, actual: number) => {
  return (target > actual ? 1 : -1) * Math.ceil(Math.max(target, actual) - Math.min(target, actual))
}

export const setVolume = async (request: {
  source: string
  destination: string
  targetMeanVolume: number
}): Promise<void> => {
  console.log(`Volume change request: ${JSON.stringify(request, null, 2)}`)
  const volume = await getVolume(request.source)
  if (!volume) {
    return
  }
  const delta = getDelta(request.targetMeanVolume, volume.mean)
  console.log(`Detected Volume: ${JSON.stringify(volume, null, 2)} (Delta: ${delta} db)`)

  return new Promise(function (resolve, reject) {
    if (Math.abs(delta) > 2) {
      ffmpeg({ source: request.source })
        .withAudioFilter(`volume=${delta}dB`)
        .on('error', function (error) {
          reject(error)
        })
        .on('end', function () {
          resolve()
        })
        .saveToFile(request.destination)
    } else {
      console.log('Volume is close enough, copying as-is')
      ffmpeg({ source: request.source })
        .on('error', function (error) {
          reject(error)
        })
        .on('end', function () {
          resolve()
        })
        .saveToFile(request.destination)
    }
  })
}
