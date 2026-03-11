import { FC, useState, useCallback } from 'react'

interface MediaFile {
  path: string
  name: string
}

const ImageTools: FC = () => {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [operation, setOperation] = useState<'resize' | 'convert'>('resize')
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [outputFormat, setOutputFormat] = useState('png')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState('')

  const selectFiles = useCallback(async () => {
    const paths = await window.electronAPI.openFile({
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'] }],
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
    setProgress('正在处理图片...')

    try {
      const outputDir = await window.electronAPI.openDirectory()
      if (!outputDir) {
        setProcessing(false)
        return
      }

      for (const file of files) {
        const fileName = file.name.replace(/\.[^/.]+$/, '')
        const outputPath = `${outputDir}/${fileName}.${outputFormat}`

        if (operation === 'resize') {
          await window.electronAPI.resize({
            input: file.path,
            output: outputPath,
            width,
            height,
            keepAspectRatio: true,
          })
        } else {
          await window.electronAPI.convert({
            input: file.path,
            output: outputPath,
            format: outputFormat,
          })
        }
      }

      setProgress('处理完成!')
    } catch (error) {
      setProgress(`错误: ${error}`)
    } finally {
      setProcessing(false)
    }
  }, [files, operation, width, height, outputFormat])

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">图片工具</h2>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <button
          onClick={selectFiles}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 py-8 transition-colors hover:border-primary-500 hover:bg-primary-50"
        >
          <div className="text-center">
            <span className="text-4xl">🖼️</span>
            <p className="mt-2 text-gray-600">选择图片文件</p>
            <p className="text-sm text-gray-400">支持 JPG, PNG, WebP, GIF, BMP</p>
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
        <h3 className="mb-4 font-semibold text-gray-800">操作类型</h3>
        <div className="mb-4 flex gap-4">
          <button
            onClick={() => setOperation('resize')}
            className={`flex-1 rounded-lg py-2 transition-colors ${
              operation === 'resize'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            调整大小
          </button>
          <button
            onClick={() => setOperation('convert')}
            className={`flex-1 rounded-lg py-2 transition-colors ${
              operation === 'convert'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            格式转换
          </button>
        </div>

        {operation === 'resize' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-gray-600">宽度</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-600">高度</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="mb-2 block text-sm text-gray-600">输出格式</label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary-500"
          >
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
      </div>

      {progress && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-blue-800">{progress}</p>
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
        {processing ? '处理中...' : '开始处理'}
      </button>
    </div>
  )
}

export default ImageTools
