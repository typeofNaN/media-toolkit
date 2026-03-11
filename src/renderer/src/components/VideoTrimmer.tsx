import { FC, useState, useCallback } from 'react'

const VideoTrimmer: FC = () => {
  const [file, setFile] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState('')

  const selectFile = useCallback(async () => {
    const paths = await window.electronAPI.openFile()
    if (paths && paths.length > 0) {
      setFile(paths[0])
      setFileName(paths[0].split('/').pop() || '')

      const info = await window.electronAPI.getMediaInfo(paths[0])
      setDuration(info.duration)
      setEndTime(info.duration)
    }
  }, [])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const trim = useCallback(async () => {
    if (!file) return

    setProcessing(true)
    setProgress('正在裁剪视频...')

    try {
      const outputPath = await window.electronAPI.saveFile({
        defaultPath: fileName.replace(/\.[^/.]+$/, '_trimmed.mp4'),
        filters: [{ name: 'MP4 Video', extensions: ['mp4'] }],
      })

      if (!outputPath) {
        setProcessing(false)
        return
      }

      await window.electronAPI.trim({
        input: file,
        output: outputPath,
        startTime,
        endTime,
      })

      setProgress('视频裁剪完成!')
    } catch (error) {
      setProgress(`错误: ${error}`)
    } finally {
      setProcessing(false)
    }
  }, [file, fileName, startTime, endTime])

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">视频裁剪</h2>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <button
          onClick={selectFile}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 py-8 transition-colors hover:border-primary-500 hover:bg-primary-50"
        >
          <div className="text-center">
            <span className="text-4xl">📁</span>
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
          <h3 className="mb-4 font-semibold text-gray-800">时间范围</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-gray-600">开始时间</label>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={startTime}
                onChange={(e) => setStartTime(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="mt-1 text-center text-gray-600">{formatTime(startTime)}</p>
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-600">结束时间</label>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={endTime}
                onChange={(e) => setEndTime(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="mt-1 text-center text-gray-600">{formatTime(endTime)}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <span className="text-gray-600">裁剪时长: </span>
              <span className="font-semibold text-primary-600">
                {formatTime(endTime - startTime)}
              </span>
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
        onClick={trim}
        disabled={!file || processing}
        className={`w-full rounded-lg py-3 font-semibold transition-colors ${
          !file || processing
            ? 'cursor-not-allowed bg-gray-300 text-gray-500'
            : 'bg-primary-500 text-white hover:bg-primary-600'
        }`}
      >
        {processing ? '处理中...' : '裁剪视频'}
      </button>
    </div>
  )
}

export default VideoTrimmer
