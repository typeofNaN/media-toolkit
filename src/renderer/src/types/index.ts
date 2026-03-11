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

export interface ConvertOptions {
  input: string
  output: string
  format: string
  codec?: string
  quality?: 'low' | 'medium' | 'high'
}

export interface CompressOptions {
  input: string
  output: string
  quality: number
  resolution?: string
}

export interface TrimOptions {
  input: string
  output: string
  startTime: number
  endTime: number
}

export interface ExtractAudioOptions {
  input: string
  output: string
  format: string
  quality?: 'low' | 'medium' | 'high'
}

export interface ExtractFramesOptions {
  input: string
  outputDir: string
  fps?: number
  format?: 'jpg' | 'png'
}

export interface MergeOptions {
  inputs: string[]
  output: string
}

export interface ResizeOptions {
  input: string
  output: string
  width: number
  height: number
  keepAspectRatio?: boolean
}

export interface WatermarkOptions {
  input: string
  watermark: string
  output: string
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center'
  opacity?: number
}

export interface GifOptions {
  input: string
  output: string
  startTime: number
  duration: number
  fps?: number
  width?: number
}

export interface CompressImageOptions {
  input: string
  output: string
  quality: number
  format?: 'jpg' | 'png' | 'webp'
}

declare global {
  interface Window {
    electronAPI: {
      openFile: (options?: {
        filters?: { name: string; extensions: string[] }[]
      }) => Promise<string[]>
      openDirectory: () => Promise<string>
      saveFile: (options?: {
        defaultPath?: string
        filters?: { name: string; extensions: string[] }[]
      }) => Promise<string>

      getMediaInfo: (filePath: string) => Promise<MediaInfo>
      convert: (options: ConvertOptions) => Promise<string>
      compress: (options: CompressOptions) => Promise<string>
      trim: (options: TrimOptions) => Promise<string>
      extractAudio: (options: ExtractAudioOptions) => Promise<string>
      extractFrames: (options: ExtractFramesOptions) => Promise<string>
      merge: (options: MergeOptions) => Promise<string>
      resize: (options: ResizeOptions) => Promise<string>
      watermark: (options: WatermarkOptions) => Promise<string>
      createGif: (options: GifOptions) => Promise<string>
      compressImage: (options: CompressImageOptions) => Promise<string>
    }
  }
}

export {}
