import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import VideoConverter from './components/VideoConverter'
import AudioExtractor from './components/AudioExtractor'
import VideoTrimmer from './components/VideoTrimmer'
import ImageTools from './components/ImageTools'
import ImageCompressor from './components/ImageCompressor'
import GifMaker from './components/GifMaker'
import MetadataEditor from './components/MetadataEditor'
import LivePhotoTools from './components/LivePhotoTools'
import MediaInspector from './components/MediaInspector'
import VideoCompressor from './components/VideoCompressor'
import FrameExtractor from './components/FrameExtractor'
import VideoMerger from './components/VideoMerger'
import WatermarkTool from './components/WatermarkTool'

export type ToolType =
  | 'converter'
  | 'audio'
  | 'trimmer'
  | 'image'
  | 'compressor'
  | 'gif'
  | 'metadata'
  | 'livePhoto'
  | 'inspector'
  | 'videoCompressor'
  | 'frames'
  | 'merger'
  | 'watermark'

function App() {
  const [currentTool, setCurrentTool] = useState<ToolType>('converter')

  const renderTool = useCallback(() => {
    switch (currentTool) {
      case 'converter':
        return <VideoConverter />
      case 'audio':
        return <AudioExtractor />
      case 'trimmer':
        return <VideoTrimmer />
      case 'image':
        return <ImageTools />
      case 'compressor':
        return <ImageCompressor />
      case 'gif':
        return <GifMaker />
      case 'metadata':
        return <MetadataEditor />
      case 'livePhoto':
        return <LivePhotoTools />
      case 'inspector':
        return <MediaInspector />
      case 'videoCompressor':
        return <VideoCompressor />
      case 'frames':
        return <FrameExtractor />
      case 'merger':
        return <VideoMerger />
      case 'watermark':
        return <WatermarkTool />
      default:
        return <VideoConverter />
    }
  }, [currentTool])

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentTool={currentTool} onToolChange={setCurrentTool} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="drag-region mb-4 h-8" />
          {renderTool()}
        </div>
      </main>
    </div>
  )
}

export default App
