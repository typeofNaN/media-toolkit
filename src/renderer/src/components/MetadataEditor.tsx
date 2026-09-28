import { FC, useCallback, useState } from 'react'
import { EditableMetadata, MetadataSummary } from '../types'

const emptyMetadata: EditableMetadata = {
  title: '',
  description: '',
  artist: '',
  copyright: '',
  keywords: [],
  dateTimeOriginal: '',
}

const MetadataEditor: FC = () => {
  const [file, setFile] = useState('')
  const [summary, setSummary] = useState<MetadataSummary | null>(null)
  const [metadata, setMetadata] = useState<EditableMetadata>(emptyMetadata)
  const [keywords, setKeywords] = useState('')
  const [processing, setProcessing] = useState(false)
  const [status, setStatus] = useState('')

  const selectFile = useCallback(async () => {
    const paths = await window.electronAPI.openFile()
    if (!paths?.[0]) return
    setProcessing(true)
    setStatus('正在读取元信息...')
    try {
      const info = await window.electronAPI.readMetadata(paths[0])
      setFile(paths[0])
      setSummary(info)
      setMetadata({
        title: info.title || '',
        description: info.description || '',
        artist: info.artist || '',
        copyright: info.copyright || '',
        dateTimeOriginal: info.dateTimeOriginal || '',
        latitude: info.latitude,
        longitude: info.longitude,
      })
      setKeywords(info.keywords?.join(', ') || '')
      setStatus('元信息读取完成')
    } catch (error) {
      setStatus(`读取失败: ${error}`)
    } finally {
      setProcessing(false)
    }
  }, [])

  const update = (key: keyof EditableMetadata, value: string) => {
    setMetadata((current) => ({ ...current, [key]: value }))
  }

  const save = useCallback(async () => {
    if (!file) return
    const extension = file.split('.').pop() || '*'
    const output = await window.electronAPI.saveFile({
      defaultPath: file.replace(/(\.[^/.]+)$/, '_metadata$1'),
      filters: [{ name: '媒体文件', extensions: [extension] }],
    })
    if (!output) return
    setProcessing(true)
    setStatus('正在写入元信息...')
    try {
      await window.electronAPI.writeMetadata({
        input: file,
        output,
        metadata: {
          ...metadata,
          keywords: keywords
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          latitude:
            metadata.latitude === undefined || String(metadata.latitude) === ''
              ? undefined
              : Number(metadata.latitude),
          longitude:
            metadata.longitude === undefined || String(metadata.longitude) === ''
              ? undefined
              : Number(metadata.longitude),
        },
      })
      setStatus(`已保存到: ${output}`)
    } catch (error) {
      setStatus(`写入失败: ${error}`)
    } finally {
      setProcessing(false)
    }
  }, [file, keywords, metadata])

  const removeAll = useCallback(async () => {
    if (!file) return
    const extension = file.split('.').pop() || '*'
    const output = await window.electronAPI.saveFile({
      defaultPath: file.replace(/(\.[^/.]+)$/, '_clean$1'),
      filters: [{ name: '媒体文件', extensions: [extension] }],
    })
    if (!output) return
    setProcessing(true)
    setStatus('正在移除元信息...')
    try {
      await window.electronAPI.removeMetadata({ input: file, output })
      setStatus(`已生成隐私副本: ${output}`)
    } catch (error) {
      setStatus(`处理失败: ${error}`)
    } finally {
      setProcessing(false)
    }
  }, [file])

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-2 text-2xl font-bold text-gray-800">元信息编辑</h2>
      <p className="mb-6 text-sm text-gray-500">
        查看与修改 EXIF、IPTC、XMP 和 QuickTime 元信息，或生成隐私副本。
      </p>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <button
          onClick={selectFile}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 py-7 hover:border-primary-500 hover:bg-primary-50"
        >
          <span className="text-4xl">🏷️</span>
          <p className="mt-2 text-gray-600">选择图片、视频或音频文件</p>
        </button>
        {summary && (
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-4 text-sm md:grid-cols-4">
            <div>
              <span className="text-gray-400">类型</span>
              <p>{summary.fileType || '未知'}</p>
            </div>
            <div>
              <span className="text-gray-400">尺寸</span>
              <p>
                {summary.width && summary.height ? `${summary.width} × ${summary.height}` : '—'}
              </p>
            </div>
            <div>
              <span className="text-gray-400">设备</span>
              <p>{[summary.make, summary.model].filter(Boolean).join(' ') || '—'}</p>
            </div>
            <div>
              <span className="text-gray-400">实况标识</span>
              <p className="truncate" title={summary.contentIdentifier}>
                {summary.contentIdentifier || '—'}
              </p>
            </div>
          </div>
        )}
      </div>

      {file && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            {(
              [
                ['title', '标题'],
                ['artist', '作者'],
                ['copyright', '版权'],
                ['dateTimeOriginal', '拍摄时间'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="text-sm text-gray-600">
                {label}
                <input
                  value={String(metadata[key] || '')}
                  onChange={(event) => update(key, event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
            ))}
            <label className="col-span-2 text-sm text-gray-600">
              描述
              <textarea
                value={metadata.description || ''}
                onChange={(event) => update('description', event.target.value)}
                rows={3}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="col-span-2 text-sm text-gray-600">
              关键词（逗号分隔）
              <input
                value={keywords}
                onChange={(event) => setKeywords(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="text-sm text-gray-600">
              纬度
              <input
                type="number"
                step="any"
                value={metadata.latitude ?? ''}
                onChange={(event) => update('latitude', event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="text-sm text-gray-600">
              经度
              <input
                type="number"
                step="any"
                value={metadata.longitude ?? ''}
                onChange={(event) => update('longitude', event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
          </div>
        </div>
      )}

      {status && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800">
          {status}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={removeAll}
          disabled={!file || processing}
          className="rounded-lg border border-red-200 py-3 font-semibold text-red-600 disabled:opacity-40"
        >
          生成隐私副本
        </button>
        <button
          onClick={save}
          disabled={!file || processing}
          className="rounded-lg bg-primary-500 py-3 font-semibold text-white disabled:bg-gray-300"
        >
          {processing ? '处理中...' : '保存修改副本'}
        </button>
      </div>
    </div>
  )
}

export default MetadataEditor
