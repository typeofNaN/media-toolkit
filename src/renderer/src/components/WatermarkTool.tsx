import { FC, useCallback, useState } from 'react'
import { WatermarkOptions } from '../types'

const nameOf = (value: string) => value.split(/[\\/]/).pop() || ''

const WatermarkTool: FC = () => {
  const [video, setVideo] = useState('')
  const [watermark, setWatermark] = useState('')
  const [position, setPosition] = useState<WatermarkOptions['position']>('bottomRight')
  const [opacity, setOpacity] = useState(80)
  const [processing, setProcessing] = useState(false)
  const [status, setStatus] = useState('')

  const select = async (kind: 'video' | 'watermark') => {
    const paths = await window.electronAPI.openFile({
      filters: [
        {
          name: kind === 'video' ? '视频' : '水印图片',
          extensions:
            kind === 'video'
              ? ['mp4', 'mov', 'mkv', 'avi', 'webm']
              : ['png', 'jpg', 'jpeg', 'webp'],
        },
      ],
    })
    if (!paths?.[0]) return
    kind === 'video' ? setVideo(paths[0]) : setWatermark(paths[0])
  }

  const process = useCallback(async () => {
    if (!video || !watermark) return
    const output = await window.electronAPI.saveFile({
      defaultPath: video.replace(/(\.[^/.]+)$/, '_watermarked.mp4'),
      filters: [{ name: 'MP4', extensions: ['mp4'] }],
    })
    if (!output) return
    setProcessing(true)
    setStatus('正在添加水印...')
    try {
      await window.electronAPI.watermark({
        input: video,
        watermark,
        output,
        position,
        opacity: opacity / 100,
      })
      setStatus(`处理完成: ${output}`)
    } catch (error) {
      setStatus(`处理失败: ${error}`)
    } finally {
      setProcessing(false)
    }
  }, [opacity, position, video, watermark])

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-2 text-2xl font-bold text-gray-800">添加水印</h2>
      <p className="mb-6 text-sm text-gray-500">为视频叠加 PNG、JPG 或 WebP 图片水印。</p>
      <div className="mb-6 grid grid-cols-2 gap-4">
        <button
          onClick={() => select('video')}
          className="rounded-xl border-2 border-dashed border-gray-300 bg-white py-7"
        >
          🎬<p className="mt-2 truncate px-3 text-sm">{video ? nameOf(video) : '选择视频'}</p>
        </button>
        <button
          onClick={() => select('watermark')}
          className="rounded-xl border-2 border-dashed border-gray-300 bg-white py-7"
        >
          🖼️
          <p className="mt-2 truncate px-3 text-sm">
            {watermark ? nameOf(watermark) : '选择水印图片'}
          </p>
        </button>
      </div>
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="block text-sm text-gray-600">
          水印位置
          <select
            value={position}
            onChange={(event) => setPosition(event.target.value as WatermarkOptions['position'])}
            className="mt-2 w-full rounded-lg border px-3 py-2"
          >
            <option value="topLeft">左上</option>
            <option value="topRight">右上</option>
            <option value="bottomLeft">左下</option>
            <option value="bottomRight">右下</option>
            <option value="center">居中</option>
          </select>
        </label>
        <label className="mt-5 block text-sm text-gray-600">
          不透明度: {opacity}%
          <input
            type="range"
            min="10"
            max="100"
            value={opacity}
            onChange={(event) => setOpacity(Number(event.target.value))}
            className="mt-2 w-full"
          />
        </label>
      </div>
      {status && <div className="mb-4 rounded-lg bg-blue-50 p-4 text-blue-800">{status}</div>}
      <button
        onClick={process}
        disabled={!video || !watermark || processing}
        className="w-full rounded-lg bg-primary-500 py-3 font-semibold text-white disabled:bg-gray-300"
      >
        {processing ? '处理中...' : '添加水印'}
      </button>
    </div>
  )
}

export default WatermarkTool
