import { FC, useCallback, useState } from 'react'

const fileName = (value: string) => value.split(/[\\/]/).pop() || ''

const LivePhotoTools: FC = () => {
  const [mode, setMode] = useState<'cover' | 'create'>('cover')
  const [photo, setPhoto] = useState('')
  const [video, setVideo] = useState('')
  const [template, setTemplate] = useState('')
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(3)
  const [processing, setProcessing] = useState(false)
  const [status, setStatus] = useState('')

  const choose = async (kind: 'photo' | 'video' | 'template') => {
    const image = kind !== 'video'
    const paths = await window.electronAPI.openFile({
      filters: [
        {
          name: image ? '照片' : '视频',
          extensions: image ? ['jpg', 'jpeg', 'heic'] : ['mov', 'mp4', 'mkv'],
        },
      ],
    })
    if (!paths?.[0]) return
    if (kind === 'photo') setPhoto(paths[0])
    if (kind === 'video') setVideo(paths[0])
    if (kind === 'template') setTemplate(paths[0])
  }

  const replaceCover = useCallback(async () => {
    if (!photo || !video) return
    const output = await window.electronAPI.saveFile({
      defaultPath: fileName(photo).replace(/(\.[^/.]+)$/, '_cover.jpg'),
      filters: [{ name: 'JPEG', extensions: ['jpg'] }],
    })
    if (!output) return
    setProcessing(true)
    setStatus('正在提取画面并迁移实况元信息...')
    try {
      await window.electronAPI.replaceLivePhotoCover({ photo, video, output, time })
      setStatus(`新封面已保存: ${output}`)
    } catch (error) {
      setStatus(`处理失败: ${error}`)
    } finally {
      setProcessing(false)
    }
  }, [photo, time, video])

  const createPair = useCallback(async () => {
    if (!video || !template) return
    const outputDir = await window.electronAPI.openDirectory()
    if (!outputDir) return
    setProcessing(true)
    setStatus('正在创建实验性配对素材...')
    try {
      const result = await window.electronAPI.createLivePhotoPair({
        input: video,
        templatePhoto: template,
        outputDir,
        name: fileName(video).replace(/\.[^/.]+$/, ''),
        startTime: 0,
        duration,
        coverTime: Math.min(time, duration),
      })
      setStatus(`已生成 ${fileName(result.photo)} + ${fileName(result.video)}`)
    } catch (error) {
      setStatus(`创建失败: ${error}`)
    } finally {
      setProcessing(false)
    }
  }, [duration, template, time, video])

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-2 text-2xl font-bold text-gray-800">实况照片工具</h2>
      <p className="mb-6 text-sm text-gray-500">
        更换 Live Photo 主图，或从视频生成带共享标识的实验性配对素材。
      </p>
      <div className="mb-6 flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <button
          onClick={() => setMode('cover')}
          className={`flex-1 rounded-lg py-2 ${mode === 'cover' ? 'bg-primary-500 text-white' : 'bg-gray-100'}`}
        >
          修改封面
        </button>
        <button
          onClick={() => setMode('create')}
          className={`flex-1 rounded-lg py-2 ${mode === 'create' ? 'bg-primary-500 text-white' : 'bg-gray-100'}`}
        >
          生成配对素材（实验）
        </button>
      </div>

      <div className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {mode === 'cover' && (
          <button
            onClick={() => choose('photo')}
            className="w-full rounded-lg border-2 border-dashed border-gray-300 py-5"
          >
            📷 {photo ? fileName(photo) : '选择原实况照片主图'}
          </button>
        )}
        <button
          onClick={() => choose('video')}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 py-5"
        >
          🎬 {video ? fileName(video) : mode === 'cover' ? '选择配对 MOV 视频' : '选择源视频'}
        </button>
        {mode === 'create' && (
          <>
            <button
              onClick={() => choose('template')}
              className="w-full rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 py-5"
            >
              🧩 {template ? fileName(template) : '选择一张已有实况照片作为元信息模板'}
            </button>
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              苹果 MakerNote
              不能可靠地从零创建，因此模板是生成配对素材所必需的。当前跨平台输出不包含苹果
              still-image-time 定时轨道，不保证被“照片”识别为原生 Live Photo；模板文件不会被修改。
            </div>
          </>
        )}
        <label className="block text-sm text-gray-600">
          封面时间点: {time.toFixed(1)} 秒
          <input
            type="range"
            min="0"
            max={mode === 'create' ? duration : 10}
            step="0.1"
            value={time}
            onChange={(event) => setTime(Number(event.target.value))}
            className="mt-2 w-full"
          />
        </label>
        {mode === 'create' && (
          <label className="block text-sm text-gray-600">
            片段时长: {duration} 秒
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              className="mt-2 w-full"
            />
          </label>
        )}
      </div>
      {status && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800">
          {status}
        </div>
      )}
      <button
        onClick={mode === 'cover' ? replaceCover : createPair}
        disabled={processing || !video || (mode === 'cover' ? !photo : !template)}
        className="w-full rounded-lg bg-primary-500 py-3 font-semibold text-white disabled:bg-gray-300"
      >
        {processing ? '处理中...' : mode === 'cover' ? '生成新封面' : '生成实验性配对素材'}
      </button>
    </div>
  )
}

export default LivePhotoTools
