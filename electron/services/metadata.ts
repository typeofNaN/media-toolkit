import { copyFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { ExifTool, exiftool } from 'exiftool-vendored'

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

export class MetadataService {
  private tool = this.createTool()

  private createTool(): ExifTool {
    if (!process.resourcesPath) return exiftool
    const executable = path.join(
      process.resourcesPath,
      'exiftool',
      'bin',
      process.platform === 'win32' ? 'exiftool.exe' : 'exiftool'
    )
    return existsSync(executable) ? new ExifTool({ exiftoolPath: executable }) : exiftool
  }

  async read(filePath: string): Promise<MetadataSummary> {
    const tags = await this.tool.read(filePath, { readArgs: [] })

    return {
      fileName: tags.FileName || path.basename(filePath),
      fileType: tags.FileType || '',
      mimeType: tags.MIMEType || '',
      fileSize: tags.FileSize,
      width: tags.ImageWidth,
      height: tags.ImageHeight,
      duration: typeof tags.Duration === 'number' ? tags.Duration : undefined,
      title: tags.Title,
      description: tags.Description || tags.ImageDescription,
      artist: tags.Artist || (Array.isArray(tags.Creator) ? tags.Creator.join(', ') : tags.Creator),
      copyright: tags.Copyright,
      keywords:
        tags.Keywords === undefined
          ? undefined
          : Array.isArray(tags.Keywords)
            ? tags.Keywords
            : [tags.Keywords],
      dateTimeOriginal: tags.DateTimeOriginal?.toString(),
      latitude: tags.GPSLatitude === undefined ? undefined : Number(tags.GPSLatitude),
      longitude: tags.GPSLongitude === undefined ? undefined : Number(tags.GPSLongitude),
      make: tags.Make,
      model: tags.Model,
      lensModel: tags.LensModel,
      software: tags.Software,
      contentIdentifier: tags.ContentIdentifier,
    }
  }

  async write(input: string, output: string, metadata: EditableMetadata): Promise<string> {
    await mkdir(path.dirname(output), { recursive: true })
    if (path.resolve(input) !== path.resolve(output)) {
      await copyFile(input, output)
    }

    const tags: Record<string, string | number | string[]> = {}
    if (metadata.title !== undefined) tags.Title = metadata.title
    if (metadata.description !== undefined) {
      tags.Description = metadata.description
      tags.ImageDescription = metadata.description
    }
    if (metadata.artist !== undefined) tags.Artist = metadata.artist
    if (metadata.copyright !== undefined) tags.Copyright = metadata.copyright
    if (metadata.keywords !== undefined) tags.Keywords = metadata.keywords
    if (metadata.dateTimeOriginal !== undefined) tags.DateTimeOriginal = metadata.dateTimeOriginal
    tags.GPSLatitude = metadata.latitude ?? ''
    tags.GPSLongitude = metadata.longitude ?? ''

    await this.tool.write(output, tags, ['-overwrite_original'])
    return output
  }

  async remove(input: string, output: string): Promise<string> {
    await mkdir(path.dirname(output), { recursive: true })
    if (path.resolve(input) !== path.resolve(output)) {
      await copyFile(input, output)
    }
    await this.tool.write(output, {}, ['-all=', '-overwrite_original'])
    return output
  }

  async copyAll(source: string, target: string): Promise<void> {
    await this.tool.write(target, {}, ['-TagsFromFile', source, '-all:all', '-overwrite_original'])
  }

  async setLivePhotoIdentifier(filePath: string, identifier: string): Promise<void> {
    await this.tool.write(
      filePath,
      {
        ContentIdentifier: identifier,
        ImageUniqueID: identifier,
      },
      ['-overwrite_original']
    )
  }

  async end(): Promise<void> {
    await this.tool.end()
  }
}
