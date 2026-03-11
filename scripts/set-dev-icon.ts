import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const electronIcnsPath = path.join(
  __dirname,
  '..',
  'node_modules/electron/dist/Electron.app/Contents/Resources/electron.icns'
)
const customIconPath = path.join(__dirname, '..', 'build/icon.icns')
const backupPath = path.join(__dirname, '..', 'build/electron.icns.backup')

function setIcon() {
  if (!fs.existsSync(electronIcnsPath)) {
    console.log('Electron.icns not found, skipping icon setup')
    return
  }

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(electronIcnsPath, backupPath)
    console.log('Backed up original electron.icns')
  }

  fs.copyFileSync(customIconPath, electronIcnsPath)
  console.log('Set custom icon for development mode')
}

setIcon()
