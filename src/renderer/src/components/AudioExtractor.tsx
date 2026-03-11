import { FC, useState, useCallback } from 'react'

interface MediaFile {
  path: string
  name: string
}

const AudioExtractor: FC = () => {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [outputFormat, setOutputFormat] = useState('mp3')
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState('')

  const selectFiles = useCallback(async () => {
    const paths = await window.electronAPI.openFile()
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

  const extract = useCallback(async () => {
    if (files.length === 0) return

    setProcessing(true)
    setProgress('正在提取音频...')

    try {
      const outputDir = await window.electronAPI.openDirectory()
      if (!outputDir) {
        setProcessing(false)
        return
      }

      for (const file of files) {
        const fileName = file.name.replace(/\.[^/.]+$/, '')
        const outputPath = `${outputDir}/${fileName}.${outputFormat}`

        await window.electronAPI.extractAudio({
          input: file.path,
          output: outputPath,
          format: outputFormat,
          quality,
        })
      }

      setProgress('音频提取完成!')
    } catch (error) {
      setProgress(`错误: ${error}`)
    } finally {
      setProcessing(false)
    }
  }, [files, outputFormat, quality])

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">音频提取</h2>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <button
          onClick={selectFiles}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 py-8 transition-colors hover:border-primary-500 hover:bg-primary-50"
        >
          <div className="text-center">
            <span className="text-4xl">📁</span>
            <p className="mt-2 text-gray-600">选择视频文件</p>
            <p className="text-sm text-gray-400">支持 MP4, AVI, MOV, MKV</p>
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
                  <span className="text-2xl">🎬</span>
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
        <h3 className="mb-4 font-semibold text-gray-800">输出设置</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm text-gray-600">音频格式</label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary-500"
            >
              <option value="mp3">MP3</option>
              <option value="aac">AAC</option>
              <option value="wav">WAV</option>
              <option value="flac">FLAC</option>
              <option value="ogg">OGG</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm text-gray-600">音质</label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary-500"
            >
              <option value="low">低 (96kbps)</option>
              <option value="medium">中等 (192kbps)</option>
              <option value="high">高 (320kbps)</option>
            </select>
          </div>
        </div>
      </div>

      {progress && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-blue-800">{progress}</p>
        </div>
      )}

      <button
        onClick={extract}
        disabled={files.length === 0 || processing}
        className={`w-full rounded-lg py-3 font-semibold transition-colors ${
          files.length === 0 || processing
            ? 'cursor-not-allowed bg-gray-300 text-gray-500'
            : 'bg-primary-500 text-white hover:bg-primary-600'
        }`}
      >
        {processing ? '处理中...' : '提取音频'}
      </button>
    </div>
  )
}

export default AudioExtractor
