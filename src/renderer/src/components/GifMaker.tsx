import { FC, useState, useCallback } from 'react'

const GifMaker: FC = () => {
  const [file, setFile] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [startTime, setStartTime] = useState(0)
  const [duration, setDuration] = useState(5)
  const [videoDuration, setVideoDuration] = useState(0)
  const [fps, setFps] = useState(15)
  const [width, setWidth] = useState(480)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState('')

  const selectFile = useCallback(async () => {
    const paths = await window.electronAPI.openFile()
    if (paths && paths.length > 0) {
      setFile(paths[0])
      setFileName(paths[0].split('/').pop() || '')

      const info = await window.electronAPI.getMediaInfo(paths[0])
      setVideoDuration(info.duration)
      setWidth(Math.min(info.width, 480))
    }
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const createGif = useCallback(async () => {
    if (!file) return

    setProcessing(true)
    setProgress('正在创建 GIF...')

    try {
      const outputPath = await window.electronAPI.saveFile({
        defaultPath: fileName.replace(/\.[^/.]+$/, '.gif'),
        filters: [{ name: 'GIF Image', extensions: ['gif'] }],
      })

      if (!outputPath) {
        setProcessing(false)
        return
      }

      await window.electronAPI.createGif({
        input: file,
        output: outputPath,
        startTime,
        duration,
        fps,
        width,
      })

      setProgress('GIF 创建完成!')
    } catch (error) {
      setProgress(`错误: ${error}`)
    } finally {
      setProcessing(false)
    }
  }, [file, fileName, startTime, duration, fps, width])

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">GIF 制作</h2>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <button
          onClick={selectFile}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 py-8 transition-colors hover:border-primary-500 hover:bg-primary-50"
        >
          <div className="text-center">
            <span className="text-4xl">🎞️</span>
            <p className="mt-2 text-gray-600">选择视频文件</p>
          </div>
        </button>

        {file && (
          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎬</span>
              <p className="font-medium text-gray-800">{fileName}</p>
            </div>
          </div>
        )}
      </div>

      {file && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-800">GIF 设置</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-gray-600">开始时间</label>
              <input
                type="range"
                min="0"
                max={Math.max(0, videoDuration - duration)}
                step="0.1"
                value={startTime}
                onChange={(e) => setStartTime(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="mt-1 text-center text-gray-600">{formatTime(startTime)}</p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-600">时长: {duration} 秒</label>
              <input
                type="range"
                min="1"
                max={Math.min(30, videoDuration)}
                step="1"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-600">帧率: {fps} FPS</label>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-600">宽度: {width}px</label>
              <input
                type="range"
                min="120"
                max="720"
                step="10"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {progress && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-blue-800">{progress}</p>
        </div>
      )}

      <button
        onClick={createGif}
        disabled={!file || processing}
        className={`w-full rounded-lg py-3 font-semibold transition-colors ${
          !file || processing
            ? 'cursor-not-allowed bg-gray-300 text-gray-500'
            : 'bg-primary-500 text-white hover:bg-primary-600'
        }`}
      >
        {processing ? '处理中...' : '创建 GIF'}
      </button>
    </div>
  )
}

export default GifMaker
