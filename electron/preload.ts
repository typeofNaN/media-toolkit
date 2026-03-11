import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: (options?: { filters?: { name: string; extensions: string[] }[] }) =>
    ipcRenderer.invoke('dialog:openFile', options),
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  saveFile: (options?: {
    defaultPath?: string
    filters?: { name: string; extensions: string[] }[]
  }) => ipcRenderer.invoke('dialog:saveFile', options),

  getMediaInfo: (filePath: string) => ipcRenderer.invoke('ffmpeg:getMediaInfo', filePath),
  convert: (options: ConvertOptions) => ipcRenderer.invoke('ffmpeg:convert', options),
  compress: (options: CompressOptions) => ipcRenderer.invoke('ffmpeg:compress', options),
  trim: (options: TrimOptions) => ipcRenderer.invoke('ffmpeg:trim', options),
  extractAudio: (options: ExtractAudioOptions) =>
    ipcRenderer.invoke('ffmpeg:extractAudio', options),
  extractFrames: (options: ExtractFramesOptions) =>
    ipcRenderer.invoke('ffmpeg:extractFrames', options),
  merge: (options: MergeOptions) => ipcRenderer.invoke('ffmpeg:merge', options),
  resize: (options: ResizeOptions) => ipcRenderer.invoke('ffmpeg:resize', options),
  watermark: (options: WatermarkOptions) => ipcRenderer.invoke('ffmpeg:watermark', options),
  createGif: (options: GifOptions) => ipcRenderer.invoke('ffmpeg:gif', options),
  compressImage: (options: CompressImageOptions) =>
    ipcRenderer.invoke('ffmpeg:compressImage', options),
})

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
