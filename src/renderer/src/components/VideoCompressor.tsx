import { FC, useCallback, useState } from 'react'

const VideoCompressor: FC = () => {
  const [file, setFile] = useState('')
  const [quality, setQuality] = useState(28)
  const [resolution, setResolution] = useState('')
  const [processing, setProcessing] = useState(false)
  const [status, setStatus] = useState('')

  const select = async () => {
    const paths = await window.electronAPI.openFile({
      filters: [{ name: '视频', extensions: ['mp4', 'mov', 'mkv', 'avi', 'webm'] }],
    })
    if (paths?.[0]) setFile(paths[0])
  }

  const compress = useCallback(async () => {
    if (!file) return
    const output = await window.electronAPI.saveFile({
      defaultPath: file.replace(/(\.[^/.]+)$/, '_compressed.mp4'),
      filters: [{ name: 'MP4', extensions: ['mp4'] }],
    })
    if (!output) return
    setProcessing(true)
    setStatus('正在压缩视频...')
    try {
      await window.electronAPI.compress({
        input: file,
        output,
        quality,
        resolution: resolution || undefined,
      })
      setStatus(`压缩完成: ${output}`)
    } catch (error) {
      setStatus(`压缩失败: ${error}`)
    } finally {
      setProcessing(false)
    }
  }, [file, quality, resolution])

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-2 text-2xl font-bold text-gray-800">视频压缩</h2>
      <p className="mb-6 text-sm text-gray-500">调整画质与分辨率，生成适合分享的 MP4 文件。</p>
      <button
        onClick={select}
        className="mb-6 w-full rounded-xl border-2 border-dashed border-gray-300 bg-white py-8"
      >
        🎬{' '}
        <span className="ml-2 text-gray-600">
          {file ? file.split(/[\\/]/).pop() : '选择视频文件'}
        </span>
      </button>
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="block text-sm text-gray-600">
          输出质量: {quality}%
          <input
            type="range"
            min="10"
            max="50"
            value={quality}
            onChange={(event) => setQuality(Number(event.target.value))}
            className="mt-3 w-full"
          />
        </label>
        <label className="mt-5 block text-sm text-gray-600">
          输出分辨率
          <select
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="">保持原分辨率</option>
            <option value="3840x2160">4K</option>
            <option value="1920x1080">1080p</option>
            <option value="1280x720">720p</option>
            <option value="854x480">480p</option>
          </select>
        </label>
      </div>
      {status && <div className="mb-4 rounded-lg bg-blue-50 p-4 text-blue-800">{status}</div>}
      <button
        onClick={compress}
        disabled={!file || processing}
        className="w-full rounded-lg bg-primary-500 py-3 font-semibold text-white disabled:bg-gray-300"
      >
        {processing ? '压缩中...' : '开始压缩'}
      </button>
    </div>
  )
}

export default VideoCompressor
