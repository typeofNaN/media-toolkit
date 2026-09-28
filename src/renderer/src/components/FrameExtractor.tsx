import { FC, useCallback, useState } from 'react'

const FrameExtractor: FC = () => {
  const [file, setFile] = useState('')
  const [mode, setMode] = useState<'cover' | 'frames'>('cover')
  const [time, setTime] = useState(0)
  const [fps, setFps] = useState(1)
  const [format, setFormat] = useState<'jpg' | 'png'>('jpg')
  const [processing, setProcessing] = useState(false)
  const [status, setStatus] = useState('')

  const select = async () => {
    const paths = await window.electronAPI.openFile({
      filters: [{ name: '视频', extensions: ['mp4', 'mov', 'mkv', 'avi', 'webm'] }],
    })
    if (paths?.[0]) setFile(paths[0])
  }

  const process = useCallback(async () => {
    if (!file) return
    setProcessing(true)
    try {
      if (mode === 'cover') {
        const output = await window.electronAPI.saveFile({
          defaultPath: `cover.${format}`,
          filters: [{ name: format.toUpperCase(), extensions: [format] }],
        })
        if (!output) return
        setStatus('正在提取封面...')
        await window.electronAPI.extractCover({ input: file, output, time })
        setStatus(`封面已保存: ${output}`)
      } else {
        const outputDir = await window.electronAPI.openDirectory()
        if (!outputDir) return
        setStatus('正在批量抽帧...')
        await window.electronAPI.extractFrames({ input: file, outputDir, fps, format })
        setStatus(`抽帧完成: ${outputDir}`)
      }
    } catch (error) {
      setStatus(`处理失败: ${error}`)
    } finally {
      setProcessing(false)
    }
  }, [file, format, fps, mode, time])

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-2 text-2xl font-bold text-gray-800">封面与抽帧</h2>
      <p className="mb-6 text-sm text-gray-500">从指定时间点导出封面，或按帧率批量导出画面。</p>
      <button
        onClick={select}
        className="mb-6 w-full rounded-xl border-2 border-dashed border-gray-300 bg-white py-8"
      >
        🎞️ <span className="ml-2">{file ? file.split(/[\\/]/).pop() : '选择视频文件'}</span>
      </button>
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex gap-3">
          <button
            onClick={() => setMode('cover')}
            className={`flex-1 rounded-lg py-2 ${mode === 'cover' ? 'bg-primary-500 text-white' : 'bg-gray-100'}`}
          >
            单张封面
          </button>
          <button
            onClick={() => setMode('frames')}
            className={`flex-1 rounded-lg py-2 ${mode === 'frames' ? 'bg-primary-500 text-white' : 'bg-gray-100'}`}
          >
            批量抽帧
          </button>
        </div>
        {mode === 'cover' ? (
          <label className="block text-sm text-gray-600">
            时间点（秒）
            <input
              type="number"
              min="0"
              step="0.1"
              value={time}
              onChange={(event) => setTime(Number(event.target.value))}
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </label>
        ) : (
          <label className="block text-sm text-gray-600">
            每秒导出帧数
            <input
              type="number"
              min="0.1"
              max="30"
              step="0.1"
              value={fps}
              onChange={(event) => setFps(Number(event.target.value))}
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </label>
        )}
        <label className="mt-4 block text-sm text-gray-600">
          图片格式
          <select
            value={format}
            onChange={(event) => setFormat(event.target.value as 'jpg' | 'png')}
            className="mt-2 w-full rounded-lg border px-3 py-2"
          >
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
          </select>
        </label>
      </div>
      {status && <div className="mb-4 rounded-lg bg-blue-50 p-4 text-blue-800">{status}</div>}
      <button
        onClick={process}
        disabled={!file || processing}
        className="w-full rounded-lg bg-primary-500 py-3 font-semibold text-white disabled:bg-gray-300"
      >
        {processing ? '处理中...' : mode === 'cover' ? '导出封面' : '开始抽帧'}
      </button>
    </div>
  )
}

export default FrameExtractor
