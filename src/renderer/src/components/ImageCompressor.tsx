import { FC, useState, useCallback } from 'react'

interface MediaFile {
  path: string
  name: string
}

const ImageCompressor: FC = () => {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [quality, setQuality] = useState(80)
  const [outputFormat, setOutputFormat] = useState<'jpg' | 'png' | 'webp'>('jpg')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState('')
  const [completedFiles, setCompletedFiles] = useState<string[]>([])

  const selectFiles = useCallback(async () => {
    const paths = await window.electronAPI.openFile({
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'] }],
    })
    if (paths && paths.length > 0) {
      const newFiles = paths.map((path: string) => ({
        path,
        name: path.split('/').pop() || '',
      }))
      setFiles((prev) => [...prev, ...newFiles])
    }
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const process = useCallback(async () => {
    if (files.length === 0) return

    setProcessing(true)
    setProgress('正在压缩图片...')
    setCompletedFiles([])

    try {
      const outputDir = await window.electronAPI.openDirectory()
      if (!outputDir) {
        setProcessing(false)
        return
      }

      const completed: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setProgress(`正在处理 ${i + 1}/${files.length}: ${file.name}`)

        const fileName = file.name.replace(/\.[^/.]+$/, '')
        const outputPath = `${outputDir}/${fileName}_compressed.${outputFormat}`

        await window.electronAPI.compressImage({
          input: file.path,
          output: outputPath,
          quality,
          format: outputFormat,
        })

        completed.push(file.name)
      }

      setCompletedFiles(completed)
      setProgress(`压缩完成! 共处理 ${files.length} 张图片`)
    } catch (error) {
      setProgress(`错误: ${error}`)
    } finally {
      setProcessing(false)
    }
  }, [files, quality, outputFormat])

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">图片压缩</h2>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <button
          onClick={selectFiles}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 py-8 transition-colors hover:border-primary-500 hover:bg-primary-50"
        >
          <div className="text-center">
            <span className="text-4xl">🖼️</span>
            <p className="mt-2 text-gray-600">选择图片文件</p>
            <p className="text-sm text-gray-400">支持 JPG, PNG, WebP, BMP, TIFF</p>
          </div>
        </button>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🖼️</span>
                  <p className="font-medium text-gray-800">{file.name}</p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 transition-colors hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-800">压缩设置</h3>

        <div className="mb-4">
          <label className="mb-2 block text-sm text-gray-600">压缩质量: {quality}%</label>
          <input
            type="range"
            min="1"
            max="100"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary-500"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-400">
            <span>最小体积</span>
            <span>最高质量</span>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-600">输出格式</label>
          <div className="flex gap-4">
            {(['jpg', 'png', 'webp'] as const).map((format) => (
              <button
                key={format}
                onClick={() => setOutputFormat(format)}
                className={`flex-1 rounded-lg py-2 transition-colors ${
                  outputFormat === format
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {progress && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-blue-800">{progress}</p>
        </div>
      )}

      {completedFiles.length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-800">已处理文件</h3>
          <div className="space-y-2">
            {completedFiles.map((name, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
                <span className="text-green-500">✓</span>
                <span className="text-gray-800">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={process}
        disabled={files.length === 0 || processing}
        className={`w-full rounded-lg py-3 font-semibold transition-colors ${
          files.length === 0 || processing
            ? 'cursor-not-allowed bg-gray-300 text-gray-500'
            : 'bg-primary-500 text-white hover:bg-primary-600'
        }`}
      >
        {processing ? '压缩中...' : '开始压缩'}
      </button>
    </div>
  )
}

export default ImageCompressor
