import { Resvg } from '@resvg/resvg-js'
import icongen from 'icon-gen'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function svgToPng(svgPath: string, size: number): Promise<Buffer> {
  const svg = fs.readFileSync(svgPath)
  const opts = {
    fitTo: {
      mode: 'width' as const,
      value: size,
    },
  }
  const resvg = new Resvg(svg, opts)
  const pngData = resvg.render()
  return pngData.asPng()
}

async function generateIcons(): Promise<void> {
  const inputPath = path.join(__dirname, '..', 'build', 'icon.svg')
  const outputDir = path.join(__dirname, '..', 'build')
  const tempDir = path.join(__dirname, '..', 'build', 'temp')

  console.log('Generating icons from:', inputPath)

  fs.mkdirSync(tempDir, { recursive: true })

  const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024]

  for (const size of sizes) {
    const png = await svgToPng(inputPath, size)
    const outputPath = path.join(tempDir, `${size}.png`)
    fs.writeFileSync(outputPath, png)
    console.log(`Generated ${size}x${size} PNG`)
  }

  const basePngPath = path.join(tempDir, '512.png')
  fs.copyFileSync(basePngPath, path.join(outputDir, 'icon.png'))
  console.log('Created icon.png (512x512)')

  console.log('Generating .icns for macOS...')
  await icongen(tempDir, outputDir, {
    report: true,
    icns: {
      name: 'icon',
      sizes: [16, 32, 64, 128, 256, 512, 1024],
    },
  })
  console.log('Generated icon.icns')

  console.log('Generating .ico for Windows...')
  await icongen(tempDir, outputDir, {
    report: true,
    ico: {
      name: 'icon',
      sizes: [16, 24, 32, 48, 64, 128, 256],
    },
  })
  console.log('Generated icon.ico')

  fs.rmSync(tempDir, { recursive: true, force: true })

  console.log('All icons generated successfully!')
}

generateIcons().catch(console.error)
