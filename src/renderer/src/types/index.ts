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

export interface ExtractCoverOptions {
  input: string
  output: string
  time: number
}

export interface EditableMetadata {
  title?: string
  description?: string
  artist?: string
  copyright?: string
  keywords?: string[]
  dateTimeOriginal?: string
  latitude?: number
  longitude?: number
}

export interface MetadataSummary extends EditableMetadata {
  fileName: string
  fileType: string
  mimeType: string
  fileSize?: string
  width?: number
  height?: number
  duration?: number
  make?: string
  model?: string
  lensModel?: string
  software?: string
  contentIdentifier?: string
}

export interface ReplaceLivePhotoCoverOptions {
  photo: string
  video: string
  output: string
  time: number
}

export interface CreateLivePhotoOptions {
  input: string
  templatePhoto: string
  outputDir: string
  name: string
  startTime: number
  duration: number
  coverTime: number
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
      extractCover: (options: ExtractCoverOptions) => Promise<string>
      replaceLivePhotoCover: (options: ReplaceLivePhotoCoverOptions) => Promise<string>
      createLivePhotoPair: (
        options: CreateLivePhotoOptions
      ) => Promise<{ photo: string; video: string; identifier: string }>
      readMetadata: (filePath: string) => Promise<MetadataSummary>
      writeMetadata: (options: {
        input: string
        output: string
        metadata: EditableMetadata
      }) => Promise<string>
      removeMetadata: (options: { input: string; output: string }) => Promise<string>
    }
  }
}

export {}
