import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { GenerateText } from './pages/GenerateText'
import { GenerateJson } from './pages/GenerateJson'
import { Chat } from "./pages/Chat";
import { AdaptiveLearning } from './pages/AdaptiveLearning'
import AdaptiveQuestions from './pages/AdaptiveQuestions'
import { PhysicsGame } from './pages/PhysicsGame'
import { NotFound } from './pages/NotFound'
import { NavBar } from './components/NavBar'
import { AuthProvider } from './context/AuthProvider'
import './index.css'

const root = document.getElementById('root')

if (!root) throw new Error('Failed to find the root element')

createRoot(root).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generate-text" element={<GenerateText />} />
          <Route path="/generate-json" element={<GenerateJson />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/adaptive-learning" element={<AdaptiveLearning />} />
          <Route path="/adaptive-questions" element={<AdaptiveQuestions />} />
          <Route path="/physics-game" element={<PhysicsGame />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
)
