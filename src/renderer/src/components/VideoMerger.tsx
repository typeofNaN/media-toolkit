import { FC, useCallback, useState } from 'react'

const nameOf = (value: string) => value.split(/[\\/]/).pop() || ''

const VideoMerger: FC = () => {
  const [files, setFiles] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)
  const [status, setStatus] = useState('')

  const select = async () => {
    const paths = await window.electronAPI.openFile({
      filters: [{ name: '视频', extensions: ['mp4', 'mov', 'mkv', 'avi', 'webm'] }],
    })
    if (paths?.length)
      setFiles((current) => [...current, ...paths.filter((path) => !current.includes(path))])
  }

  const move = (index: number, offset: number) => {
    setFiles((current) => {
      const next = [...current]
      const target = index + offset
      if (target < 0 || target >= next.length) return current
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const merge = useCallback(async () => {
    if (files.length < 2) return
    const output = await window.electronAPI.saveFile({
      defaultPath: 'merged.mp4',
      filters: [{ name: 'MP4', extensions: ['mp4'] }],
    })
    if (!output) return
    setProcessing(true)
    setStatus('正在按顺序合并视频...')
    try {
      await window.electronAPI.merge({ inputs: files, output })
      setStatus(`合并完成: ${output}`)
    } catch (error) {
      setStatus(`合并失败，请确认所有片段都包含兼容的音视频轨: ${error}`)
    } finally {
      setProcessing(false)
    }
  }, [files])

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-2 text-2xl font-bold text-gray-800">视频合并</h2>
      <p className="mb-6 text-sm text-gray-500">添加多个片段并调整顺序，合成为一个视频。</p>
      <button
        onClick={select}
        className="mb-5 w-full rounded-xl border-2 border-dashed border-gray-300 bg-white py-7"
      >
        ➕ 添加视频片段
      </button>
      <div className="mb-6 space-y-2">
        {files.map((file, index) => (
          <div
            key={file}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
          >
            <span className="w-7 text-center font-semibold text-gray-400">{index + 1}</span>
            <span className="min-w-0 flex-1 truncate">{nameOf(file)}</span>
            <button
              onClick={() => move(index, -1)}
              disabled={index === 0}
              className="px-2 disabled:opacity-20"
            >
              ↑
            </button>
            <button
              onClick={() => move(index, 1)}
              disabled={index === files.length - 1}
              className="px-2 disabled:opacity-20"
            >
              ↓
            </button>
            <button
              onClick={() => setFiles((current) => current.filter((item) => item !== file))}
              className="px-2 text-red-500"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      {status && <div className="mb-4 rounded-lg bg-blue-50 p-4 text-blue-800">{status}</div>}
      <button
        onClick={merge}
        disabled={files.length < 2 || processing}
        className="w-full rounded-lg bg-primary-500 py-3 font-semibold text-white disabled:bg-gray-300"
      >
        {processing ? '合并中...' : `合并 ${files.length} 个片段`}
      </button>
    </div>
  )
}

export default VideoMerger
