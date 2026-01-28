import { useState } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ParticipantProvider } from './contexts/ParticipantContext';
import LogMealPage from './pages/LogMealPage';
import ChatPage from './pages/ChatPage';
import ExtraInformation from './pages/ExtraInformation';
import JournalPage from './pages/JournalPage';

function App() {
  return (
    <ParticipantProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LogMealPage />} />
          <Route path="/chat/:mealType" element={<ChatPage />} />
          <Route path="/extra-information" element={<ExtraInformation />} />
          <Route path="/journal" element={<JournalPage />} />
        </Routes>
      </Router>
    </ParticipantProvider>
  )
}

export default App