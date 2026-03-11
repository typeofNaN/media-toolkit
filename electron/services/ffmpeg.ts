import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import ffprobePath from '@ffprobe-installer/ffprobe'

ffmpeg.setFfmpegPath(ffmpegPath.path)
ffmpeg.setFfprobePath(ffprobePath.path)

export interface MediaInfo {
  duration: number
  width: number
  height: number
  fps: number
  bitrate: number
  codec: string
  audioCodec?: string
  audioSampleRate?: number
  audioChannels?: number
  format: string
  size: number
}

export class FFmpegService {
  private getFps(fpsString: string): number {
    const match = fpsString.match(/(\d+)\/(\d+)/)
    if (match) {
      return Math.round(parseInt(match[1]) / parseInt(match[2]))
    }
    return parseInt(fpsString) || 30
  }

  async getMediaInfo(filePath: string): Promise<MediaInfo> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err)
          return
        }

        const videoStream = metadata.streams.find((s) => s.codec_type === 'video')
        const audioStream = metadata.streams.find((s) => s.codec_type === 'audio')

        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
          fps: videoStream?.r_frame_rate ? this.getFps(videoStream.r_frame_rate) : 0,
          bitrate: metadata.format.bit_rate ? parseInt(String(metadata.format.bit_rate)) : 0,
          codec: videoStream?.codec_name || '',
          audioCodec: audioStream?.codec_name,
          audioSampleRate: audioStream?.sample_rate,
          audioChannels: audioStream?.channels,
          format: metadata.format.format_name || '',
          size: metadata.format.size ? parseInt(String(metadata.format.size)) : 0,
        })
      })
    })
  }

  async convert(options: {
    input: string
    output: string
    format: string
    codec?: string
    quality?: 'low' | 'medium' | 'high'
  }): Promise<string> {
    const qualityMap = {
      low: { crf: 28, preset: 'faster' },
      medium: { crf: 23, preset: 'medium' },
      high: { crf: 18, preset: 'slow' },
    }

    const { crf, preset } = qualityMap[options.quality || 'medium']

    return new Promise((resolve, reject) => {
      let command = ffmpeg(options.input).output(options.output)

      if (options.codec) {
        command = command.videoCodec(options.codec)
      } else if (options.format === 'mp4') {
        command = command.videoCodec('libx264')
      } else if (options.format === 'webm') {
        command = command.videoCodec('libvpx-vp9')
      }

      command
        .outputOptions(['-crf', String(crf), '-preset', preset])
        .on('end', () => resolve(options.output))
        .on('error', reject)
        .run()
    })
  }

  async compress(options: {
    input: string
    output: string
    quality: number
    resolution?: string
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(options.input).output(options.output)

      const crf = Math.min(51, Math.max(0, 51 - options.quality))
      command = command.outputOptions(['-crf', String(crf), '-preset', 'medium'])

      if (options.resolution) {
        command = command.size(options.resolution)
      }

      command
        .on('end', () => resolve(options.output))
        .on('error', reject)
        .run()
    })
  }

  async trim(options: {
    input: string
    output: string
    startTime: number
    endTime: number
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(options.input)
        .setStartTime(options.startTime)
        .setDuration(options.endTime - options.startTime)
        .output(options.output)
        .on('end', () => resolve(options.output))
        .on('error', reject)
        .run()
    })
  }

  async extractAudio(options: {
    input: string
    output: string
    format: string
    quality?: 'low' | 'medium' | 'high'
  }): Promise<string> {
    const qualityMap = { low: '96k', medium: '192k', high: '320k' }
    const bitrate = qualityMap[options.quality || 'medium']

    return new Promise((resolve, reject) => {
      ffmpeg(options.input)
        .output(options.output)
        .audioBitrate(bitrate)
        .noVideo()
        .on('end', () => resolve(options.output))
        .on('error', reject)
        .run()
    })
  }

  async extractFrames(options: {
    input: string
    outputDir: string
    fps?: number
    format?: 'jpg' | 'png'
  }): Promise<string> {
    const outputPattern = path.join(options.outputDir, `frame-%04d.${options.format || 'jpg'}`)

    return new Promise((resolve, reject) => {
      ffmpeg(options.input)
        .fps(options.fps || 1)
        .output(outputPattern)
        .on('end', () => resolve(options.outputDir))
        .on('error', reject)
        .run()
    })
  }

  async merge(options: { inputs: string[]; output: string }): Promise<string> {
    return new Promise((resolve, reject) => {
      const command = ffmpeg()

      options.inputs.forEach((input) => {
        command.input(input)
      })

      command
        .outputOptions('-filter_complex', `concat=n=${options.inputs.length}:v=1:a=1`)
        .output(options.output)
        .on('end', () => resolve(options.output))
        .on('error', reject)
        .run()
    })
  }

  async resize(options: {
    input: string
    output: string
    width: number
    height: number
    keepAspectRatio?: boolean
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      const size = options.keepAspectRatio
        ? `${options.width}:-1`
        : `${options.width}:${options.height}`

      ffmpeg(options.input)
        .size(size)
        .output(options.output)
        .on('end', () => resolve(options.output))
        .on('error', reject)
        .run()
    })
  }

  async watermark(options: {
    input: string
    watermark: string
    output: string
    position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center'
    opacity?: number
  }): Promise<string> {
    const positionMap = {
      topLeft: '10:10',
      topRight: 'main_w-overlay_w-10:10',
      bottomLeft: '10:main_h-overlay_h-10',
      bottomRight: 'main_w-overlay_w-10:main_h-overlay_h-10',
      center: '(main_w-overlay_w)/2:(main_h-overlay_h)/2',
    }

    const opacity = options.opacity || 0.8

    return new Promise((resolve, reject) => {
      ffmpeg(options.input)
        .input(options.watermark)
        .complexFilter(
          [
            `[1:v]format=rgba,colorchannelmixer=aa=${opacity}[overlay]`,
            `[0:v][overlay]overlay=${positionMap[options.position]}`,
          ],
          'output'
        )
        .output(options.output)
        .on('end', () => resolve(options.output))
        .on('error', reject)
        .run()
    })
  }

  async createGif(options: {
    input: string
    output: string
    startTime: number
    duration: number
    fps?: number
    width?: number
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(options.input)
        .setStartTime(options.startTime)
        .setDuration(options.duration)
        .output(options.output)

      if (options.width) {
        command = command.size(`${options.width}:-1`)
      }

      command
        .fps(options.fps || 15)
        .outputOptions(['-loop', '0'])
        .on('end', () => resolve(options.output))
        .on('error', reject)
        .run()
    })
  }

  async compressImage(options: {
    input: string
    output: string
    quality: number
    format?: 'jpg' | 'png' | 'webp'
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      const ext = path.extname(options.output).toLowerCase()
      const format = options.format || (ext === '.png' ? 'png' : ext === '.webp' ? 'webp' : 'jpg')

      let command = ffmpeg(options.input).output(options.output)

      if (format === 'jpg') {
        const q = Math.max(1, Math.min(31, Math.round(31 - (options.quality * 30) / 100)))
        command = command.outputOptions(['-q:v', String(q)]).outputFormat('image2')
      } else if (format === 'webp') {
        const q = Math.max(0, Math.min(100, options.quality))
        command = command.outputOptions(['-q:v', String(q)]).outputFormat('webp')
      } else {
        const q = Math.max(1, Math.min(9, Math.round(10 - options.quality / 10)))
        command = command.outputOptions(['-q:v', String(q)]).outputFormat('image2')
      }

      command
        .on('end', () => resolve(options.output))
        .on('error', reject)
        .run()
    })
  }
}
