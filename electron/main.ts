import { app, BrowserWindow, ipcMain, dialog, shell, nativeImage } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { FFmpegService } from './services/ffmpeg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

const iconPath = VITE_DEV_SERVER_URL
  ? path.join(__dirname, '../../build/icon.png')
  : path.join(__dirname, '../build/icon.png')

let mainWindow: BrowserWindow | null = null
let ffmpegService: FFmpegService | null = null

function createWindow() {
  const icon = nativeImage.createFromPath(iconPath)

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    const icon = nativeImage.createFromPath(iconPath)
    app.dock.setIcon(icon)
  }

  ffmpegService = new FFmpegService()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('dialog:openFile', async (_, options) => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile', 'multiSelections'],
    filters: options?.filters || [
      {
        name: 'Media Files',
        extensions: [
          'mp4',
          'avi',
          'mov',
          'mkv',
          'mp3',
          'wav',
          'flac',
          'jpg',
          'jpeg',
          'png',
          'webp',
          'gif',
        ],
      },
      { name: 'All Files', extensions: ['*'] },
    ],
    ...options,
  })
  return result.filePaths
})

ipcMain.handle('dialog:openDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory', 'createDirectory'],
  })
  return result.filePaths[0]
})

ipcMain.handle('dialog:saveFile', async (_, options) => {
  const result = await dialog.showSaveDialog(mainWindow!, options)
  return result.filePath
})

ipcMain.handle('ffmpeg:getMediaInfo', async (_, filePath: string) => {
  return ffmpegService!.getMediaInfo(filePath)
})

ipcMain.handle('ffmpeg:convert', async (_, options) => {
  return ffmpegService!.convert(options)
})

ipcMain.handle('ffmpeg:compress', async (_, options) => {
  return ffmpegService!.compress(options)
})

ipcMain.handle('ffmpeg:trim', async (_, options) => {
  return ffmpegService!.trim(options)
})

ipcMain.handle('ffmpeg:extractAudio', async (_, options) => {
  return ffmpegService!.extractAudio(options)
})

ipcMain.handle('ffmpeg:extractFrames', async (_, options) => {
  return ffmpegService!.extractFrames(options)
})

ipcMain.handle('ffmpeg:merge', async (_, options) => {
  return ffmpegService!.merge(options)
})

ipcMain.handle('ffmpeg:resize', async (_, options) => {
  return ffmpegService!.resize(options)
})

ipcMain.handle('ffmpeg:watermark', async (_, options) => {
  return ffmpegService!.watermark(options)
})

ipcMain.handle('ffmpeg:gif', async (_, options) => {
  return ffmpegService!.createGif(options)
})

ipcMain.handle('ffmpeg:compressImage', async (_, options) => {
  return ffmpegService!.compressImage(options)
})
