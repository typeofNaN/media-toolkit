import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import VideoConverter from './components/VideoConverter'
import AudioExtractor from './components/AudioExtractor'
import VideoTrimmer from './components/VideoTrimmer'
import ImageTools from './components/ImageTools'
import ImageCompressor from './components/ImageCompressor'
import GifMaker from './components/GifMaker'

export type ToolType = 'converter' | 'audio' | 'trimmer' | 'image' | 'compressor' | 'gif'

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
