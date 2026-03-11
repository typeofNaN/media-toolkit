declare module '@ffmpeg-installer/ffmpeg' {
  const ffmpeg: { path: string }
  export default ffmpeg
}

declare module '@ffprobe-installer/ffprobe' {
  const ffprobe: { path: string }
  export default ffprobe
}

declare const __APP_VERSION__: string
