import { FC, useCallback, useState } from 'react'
import { MediaInfo, MetadataSummary } from '../types'

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remaining = Math.floor(seconds % 60)
  return [hours, minutes, remaining].map((value) => String(value).padStart(2, '0')).join(':')
}

const MediaInspector: FC = () => {
  const [file, setFile] = useState('')
  const [media, setMedia] = useState<MediaInfo | null>(null)
  const [metadata, setMetadata] = useState<MetadataSummary | null>(null)
  const [status, setStatus] = useState('')

  const inspect = useCallback(async () => {
    const paths = await window.electronAPI.openFile()
    if (!paths?.[0]) return
    setFile(paths[0])
    setStatus('正在分析媒体文件...')
    try {
      const [mediaResult, metadataResult] = await Promise.allSettled([
        window.electronAPI.getMediaInfo(paths[0]),
        window.electronAPI.readMetadata(paths[0]),
      ])
      setMedia(mediaResult.status === 'fulfilled' ? mediaResult.value : null)
      setMetadata(metadataResult.status === 'fulfilled' ? metadataResult.value : null)
      if (mediaResult.status === 'rejected' && metadataResult.status === 'rejected') {
        throw new Error('媒体流和元信息均读取失败')
      }
      const warnings = [
        mediaResult.status === 'rejected' ? '音视频流读取失败' : '',
        metadataResult.status === 'rejected' ? '元信息读取失败' : '',
      ].filter(Boolean)
      setStatus(warnings.length ? `部分分析完成：${warnings.join('、')}` : '分析完成')
    } catch (error) {
      setStatus(`分析失败: ${error}`)
    }
  }, [])

  const details =
    media || metadata
      ? [
          ['容器格式', media?.format || metadata?.fileType || '未知'],
          ['视频编码', media?.codec || '无视频轨或未读取'],
          ['音频编码', media?.audioCodec || '无音频轨或未读取'],
          ['分辨率', media?.width && media.height ? `${media.width} × ${media.height}` : '—'],
          ['帧率', media?.fps ? `${media.fps} FPS` : '—'],
          ['时长', media ? formatDuration(media.duration) : '—'],
          ['码率', media?.bitrate ? `${(media.bitrate / 1_000_000).toFixed(2)} Mbps` : '—'],
          ['文件大小', media?.size ? `${(media.size / 1024 / 1024).toFixed(2)} MB` : '—'],
          ['采样率', media?.audioSampleRate ? `${media.audioSampleRate} Hz` : '—'],
          ['声道数', media?.audioChannels ? String(media.audioChannels) : '—'],
          ['拍摄设备', [metadata?.make, metadata?.model].filter(Boolean).join(' ') || '—'],
          ['拍摄时间', metadata?.dateTimeOriginal || '—'],
          [
            '位置信息',
            metadata?.latitude !== undefined ? `${metadata.latitude}, ${metadata.longitude}` : '—',
          ],
          ['实况标识', metadata?.contentIdentifier || '—'],
        ]
      : []

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-2 text-2xl font-bold text-gray-800">媒体检查器</h2>
      <p className="mb-6 text-sm text-gray-500">一次读取容器、音视频流和拍摄元信息。</p>
      <button
        onClick={inspect}
        className="mb-6 w-full rounded-xl border-2 border-dashed border-gray-300 bg-white py-8 hover:border-primary-500 hover:bg-primary-50"
      >
        <span className="text-4xl">🔍</span>
        <p className="mt-2 text-gray-600">
          {file ? file.split(/[\\/]/).pop() : '选择需要检查的媒体文件'}
        </p>
      </button>
      {details.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 shadow-sm md:grid-cols-3">
          {details.map(([label, value]) => (
            <div key={label} className="min-w-0 bg-white p-4">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="mt-1 truncate font-medium text-gray-800" title={value}>
                {value}
              </p>
            </div>
          ))}
        </div>
      )}
      {metadata?.description && (
        <div className="mb-4 rounded-lg bg-white p-4 text-sm text-gray-600 shadow-sm">
          <span className="font-medium text-gray-800">描述：</span>
          {metadata.description}
        </div>
      )}
      {status && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800">
          {status}
        </div>
      )}
    </div>
  )
}

export default MediaInspector
