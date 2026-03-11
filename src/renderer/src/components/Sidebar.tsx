import { FC } from 'react'
import { ToolType } from '../App'

interface SidebarProps {
  currentTool: ToolType
  onToolChange: (tool: ToolType) => void
}

const tools = [
  { id: 'converter' as ToolType, name: '视频转换', icon: '🎬' },
  { id: 'audio' as ToolType, name: '音频提取', icon: '🎵' },
  { id: 'trimmer' as ToolType, name: '视频裁剪', icon: '✂️' },
  { id: 'image' as ToolType, name: '图片工具', icon: '🖼️' },
  { id: 'compressor' as ToolType, name: '图片压缩', icon: '📦' },
  { id: 'gif' as ToolType, name: 'GIF 制作', icon: '🎞️' },
]

const Sidebar: FC<SidebarProps> = ({ currentTool, onToolChange }) => {
  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-800">Media Toolkit</h1>
        <p className="mt-1 text-sm text-gray-500">多媒体处理工具</p>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {tools.map((tool) => (
            <li key={tool.id}>
              <button
                onClick={() => onToolChange(tool.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                  currentTool === tool.id
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{tool.icon}</span>
                <span className="font-medium">{tool.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-gray-200 p-4">
        <p className="text-center text-xs text-gray-400">v{__APP_VERSION__}</p>
      </div>
    </aside>
  )
}

export default Sidebar
