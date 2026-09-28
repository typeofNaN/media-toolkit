import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import ffprobePath from '@ffprobe-installer/ffprobe'
import { mkdir } from 'fs/promises'
import { chmodSync, existsSync } from 'fs'
import { randomUUID } from 'crypto'
import { MetadataService } from './metadata'

const ensureExecutable = (filePath: string) => {
  if (process.platform === 'win32') return
  try {
    chmodSync(filePath, 0o755)
  } catch (error) {
    console.warn(`无法设置媒体工具执行权限: ${filePath}`, error)
  }
}

const resolveMediaBinary = (name: 'ffmpeg' | 'ffprobe', fallback: string) => {
  const executable = process.platform === 'win32' ? `${name}.exe` : name
  const packagedPath = path.join(
    process.resourcesPath,
    name,
    `${process.platform}-${process.arch}`,
    executable
  )
  return existsSync(packagedPath) ? packagedPath : fallback
}

const resolvedFfmpegPath = resolveMediaBinary('ffmpeg', ffmpegPath.path)
const resolvedFfprobePath = resolveMediaBinary('ffprobe', ffprobePath.path)
ensureExecutable(resolvedFfmpegPath)
ensureExecutable(resolvedFfprobePath)
ffmpeg.setFfmpegPath(resolvedFfmpegPath)
ffmpeg.setFfprobePath(resolvedFfprobePath)

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
  constructor(private metadataService: MetadataService) {}

  private assertDistinctPaths(input: string, output: string) {
    if (path.resolve(input) === path.resolve(output)) {
      throw new Error('输出文件不能覆盖输入文件，请选择其他文件名或目录')
    }
  }
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
    this.assertDistinctPaths(options.input, options.output)
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
    this.assertDistinctPaths(options.input, options.output)
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
    this.assertDistinctPaths(options.input, options.output)
    if (options.startTime < 0 || options.endTime <= options.startTime) {
      throw new Error('结束时间必须晚于开始时间')
    }
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
    this.assertDistinctPaths(options.input, options.output)
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
    if (options.inputs.length < 2) throw new Error('至少需要两个视频文件')
    options.inputs.forEach((input) => this.assertDistinctPaths(input, options.output))
    const media = await Promise.all(options.inputs.map((input) => this.getMediaInfo(input)))
    const width = media[0].width
    const height = media[0].height
    const fps = media[0].fps || 30
    if (!width || !height) throw new Error('无法读取第一个视频的分辨率')

    return new Promise((resolve, reject) => {
      const command = ffmpeg()

      options.inputs.forEach((input) => {
        command.input(input)
      })

      const filters: string[] = []
      const concatInputs: string[] = []
      media.forEach((info, index) => {
        filters.push(
          `[${index}:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${fps},setpts=PTS-STARTPTS[v${index}]`
        )
        if (info.audioCodec) {
          filters.push(`[${index}:a]aresample=44100,asetpts=PTS-STARTPTS[a${index}]`)
        } else {
          filters.push(
            `anullsrc=channel_layout=stereo:sample_rate=44100,atrim=duration=${info.duration},asetpts=PTS-STARTPTS[a${index}]`
          )
        }
        concatInputs.push(`[v${index}][a${index}]`)
      })
      filters.push(`${concatInputs.join('')}concat=n=${options.inputs.length}:v=1:a=1[v][a]`)

      command
        .complexFilter(filters)
        .outputOptions(['-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-c:a', 'aac'])
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
    this.assertDistinctPaths(options.input, options.output)
    if (options.width <= 0 || options.height <= 0) throw new Error('图片尺寸必须大于 0')
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
    this.assertDistinctPaths(options.input, options.output)
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
            `[0:v][overlay]overlay=${positionMap[options.position]}[output]`,
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
    this.assertDistinctPaths(options.input, options.output)
    if (options.duration <= 0) throw new Error('GIF 时长必须大于 0')
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
    this.assertDistinctPaths(options.input, options.output)
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
        const compression = Math.max(1, Math.min(9, Math.round(9 - (options.quality * 8) / 100)))
        command = command
          .outputOptions(['-compression_level', String(compression), '-pred', 'mixed'])
          .outputFormat('image2')
      }

      command
        .on('end', () => resolve(options.output))
        .on('error', reject)
        .run()
    })
  }

  async extractCover(options: { input: string; output: string; time: number }): Promise<string> {
    this.assertDistinctPaths(options.input, options.output)
    return new Promise((resolve, reject) => {
      ffmpeg(options.input)
        .seekInput(Math.max(0, options.time))
        .frames(1)
        .outputOptions(['-q:v', '2'])
        .output(options.output)
        .on('end', () => resolve(options.output))
        .on('error', reject)
        .run()
    })
  }

  async replaceLivePhotoCover(options: {
    photo: string
    video: string
    output: string
    time: number
  }): Promise<string> {
    await this.extractCover({ input: options.video, output: options.output, time: options.time })
    await this.metadataService.copyAll(options.photo, options.output)
    return options.output
  }

  async createLivePhotoPair(options: {
    input: string
    templatePhoto: string
    outputDir: string
    name: string
    startTime: number
    duration: number
    coverTime: number
  }): Promise<{ photo: string; video: string; identifier: string }> {
    await mkdir(options.outputDir, { recursive: true })
    const safeName = options.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'live-photo'
    const photo = path.join(options.outputDir, `${safeName}.jpg`)
    const video = path.join(options.outputDir, `${safeName}.mov`)
    const identifier = randomUUID().toUpperCase()

    await this.extractCover({
      input: options.input,
      output: photo,
      time: options.startTime + options.coverTime,
    })
    await this.metadataService.copyAll(options.templatePhoto, photo)
    await this.metadataService.setLivePhotoIdentifier(photo, identifier)

    await new Promise<void>((resolve, reject) => {
      ffmpeg(options.input)
        .setStartTime(options.startTime)
        .setDuration(options.duration)
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          '-pix_fmt',
          'yuv420p',
          '-movflags',
          'use_metadata_tags+faststart',
          '-metadata',
          `com.apple.quicktime.content.identifier=${identifier}`,
        ])
        .output(video)
        .on('end', () => resolve())
        .on('error', reject)
        .run()
    })
    await this.metadataService.setLivePhotoIdentifier(video, identifier)

    return { photo, video, identifier }
  }
}
